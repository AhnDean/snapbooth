'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { findPhotoByCode } from '../../src/utils/photoUpload';

function LivePhotoContent() {
  const searchParams = useSearchParams();
  const [showVideos, setShowVideos] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [layoutType, setLayoutType] = useState('1x4');
  const [videoUrls, setVideoUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRefs = useRef([]);
  const canvasRef = useRef(null);

  // URL에서 사진 코드로 동영상 데이터 로드
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const code = searchParams.get('code');
        const layout = searchParams.get('layout') || '1x4';
        setLayoutType(layout);

        if (!code) {
          setError('사진 코드가 없습니다.');
          setLoading(false);
          return;
        }

        console.log('🔍 사진 코드로 동영상 찾기:', code);

        // Supabase에서 사진 데이터 가져오기
        const result = await findPhotoByCode(code);

        console.log('📸 사진 데이터:', result);

        if (result.success && result.photo.video_urls && result.photo.video_urls.length > 0) {
          console.log('✅ 동영상 URL 찾음:', result.photo.video_urls);
          setVideoUrls(result.photo.video_urls);
        } else {
          console.warn('⚠️ 동영상이 없습니다. video_urls:', result.photo?.video_urls);
          setError('라이브 포토가 없습니다.');
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ 동영상 로드 실패:', err);
        setError('동영상을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    loadVideos();
  }, [searchParams]);

  // 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowVideos(true);
    }
  }, [countdown]);

  // 동영상 재생
  useEffect(() => {
    if (showVideos) {
      const playTimeout = setTimeout(() => {
        videoRefs.current.forEach(async (video) => {
          if (video) {
            try {
              await video.load();
              await video.play();
            } catch (err) {
              console.error('동영상 재생 실패:', err);
            }
          }
        });
      }, 100);

      return () => clearTimeout(playTimeout);
    }
  }, [showVideos]);

  // 레이아웃 스타일
  const getGridStyle = () => {
    if (layoutType === '2x2') {
      return 'grid-cols-2 grid-rows-2';
    }
    return 'grid-cols-1 grid-rows-4';
  };

  // 라이브 포토 화면 캡처하여 다운로드/공유
  const handleDownloadComposite = async () => {
    console.log('🖼️ 라이브 포토 저장 시작...');

    if (videoUrls.length === 0) {
      console.error('❌ 동영상 URL이 없습니다');
      alert('동영상이 로드되지 않았습니다.');
      return;
    }

    try {
      console.log('📹 비디오 개수:', videoUrls.length);
      console.log('📐 레이아웃 타입:', layoutType);

      // html2canvas 대신 간단하게 캔버스 사용
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const videos = videoRefs.current;

      console.log('🎬 비디오 refs:', videos.filter(v => v).length, '개 로드됨');

      // 각 비디오의 상태 로깅
      videos.forEach((v, i) => {
        if (v) {
          console.log(`비디오 ${i+1}: readyState=${v.readyState}, width=${v.videoWidth}, height=${v.videoHeight}`);
        }
      });

      // 모든 비디오가 준비되었는지 확인
      const readyVideos = videos.filter(v => v && v.readyState >= 2);
      console.log('✅ 준비된 비디오:', readyVideos.length, '개');

      if (readyVideos.length === 0) {
        console.error('❌ 준비된 비디오가 없습니다');
        alert('비디오가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (readyVideos.length < 4) {
        console.warn(`⚠️ ${4 - readyVideos.length}개의 비디오가 아직 준비되지 않았습니다`);
        // 계속 진행하되 경고만 표시
      }

      // 캔버스 크기 설정 (레이아웃에 따라 비율 조정)
      if (layoutType === '2x2') {
        canvas.width = 1200;
        canvas.height = 1200; // 정사각형
      } else {
        canvas.width = 900;
        canvas.height = 1200; // 원본 비율 유지
      }

      // 배경색
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = 20;
      const padding = 40;

      if (layoutType === '2x2') {
        // 2x2 레이아웃 (각 셀은 정사각형)
        const cellWidth = (canvas.width - padding * 2 - spacing) / 2;
        const cellHeight = cellWidth; // 정사각형

        for (let i = 0; i < Math.min(4, videos.length); i++) {
          const video = videos[i];
          if (video && video.readyState >= 2) {
            const x = (i % 2) * (cellWidth + spacing) + padding;
            const y = Math.floor(i / 2) * (cellHeight + spacing) + padding;

            // 비디오의 실제 비율 계산
            const videoAspect = video.videoWidth / video.videoHeight;
            const cellAspect = cellWidth / cellHeight;

            let drawWidth = cellWidth;
            let drawHeight = cellHeight;
            let drawX = x;
            let drawY = y;

            if (videoAspect > cellAspect) {
              drawHeight = cellWidth / videoAspect;
              drawY = y + (cellHeight - drawHeight) / 2;
            } else {
              drawWidth = cellHeight * videoAspect;
              drawX = x + (cellWidth - drawWidth) / 2;
            }

            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
          }
        }
      } else {
        // 1x4 레이아웃
        const cellWidth = canvas.width - padding * 2;
        const cellHeight = (canvas.height - padding * 2 - spacing * 3) / 4;

        for (let i = 0; i < Math.min(4, videos.length); i++) {
          const video = videos[i];
          if (video && video.readyState >= 2) {
            const y = i * (cellHeight + spacing) + padding;

            // 비디오의 실제 비율 계산
            const videoAspect = video.videoWidth / video.videoHeight;
            const cellAspect = cellWidth / cellHeight;

            let drawWidth = cellWidth;
            let drawHeight = cellHeight;
            let drawX = padding;
            let drawY = y;

            if (videoAspect > cellAspect) {
              drawHeight = cellWidth / videoAspect;
              drawY = y + (cellHeight - drawHeight) / 2;
            } else {
              drawWidth = cellHeight * videoAspect;
              drawX = spacing + (cellWidth - drawWidth) / 2;
            }

            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
          }
        }
      }

      console.log('🎨 캔버스 생성 완료. 크기:', canvas.width, 'x', canvas.height);

      // 캔버스를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ Blob 생성 실패');
          alert('이미지 생성에 실패했습니다.');
          return;
        }

        console.log('📦 Blob 생성 완료. 크기:', Math.round(blob.size / 1024), 'KB');

        const filename = `chupbox_live_photo_${Date.now()}.jpg`;

        // 모바일 환경에서 Web Share API 지원 확인
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], filename, { type: 'image/jpeg' });

            const shareData = {
              files: [file],
              title: 'CHUPBOX 라이브 포토',
              text: '촬영 전 준비하는 모습을 담은 라이브 포토 🎬'
            };

            if (navigator.canShare(shareData)) {
              console.log('📤 Web Share API 사용 가능, 공유 시작...');
              await navigator.share(shareData);
              console.log('✅ 공유 완료');
              return;
            } else {
              console.log('⚠️ canShare false, 다운로드로 전환');
            }
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('❌ 사용자가 공유 취소');
              return; // 사용자가 취소한 경우
            }
            console.log('⚠️ 공유 실패, 다운로드로 전환:', error);
          }
        } else {
          console.log('ℹ️ Web Share API 지원하지 않음, 다운로드 시작');
        }

        // Web Share API를 지원하지 않거나 실패한 경우 다운로드
        try {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ 다운로드 완료');
        } catch (downloadError) {
          console.error('❌ 다운로드 실패:', downloadError);
          alert('다운로드에 실패했습니다.');
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('라이브 포토 저장 실패:', error);
      alert('라이브 포토 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">라이브 포토를 불러오는 중...</p>
      </div>
    );
  }

  if (error || videoUrls.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-white text-xl mb-4">{error || '라이브 포토가 없습니다'}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* 카운트다운 */}
      {!showVideos && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-white animate-pulse mb-2">
              {countdown}
            </div>
            <div className="text-xl text-white">
              🎬 라이브 포토가 곧 재생됩니다
            </div>
          </div>
        </div>
      )}

      {/* 동영상 그리드 - 4컷 사진과 동일한 비율 */}
      <div className={`grid ${getGridStyle()} gap-5 bg-white p-10 rounded-xl ${
        layoutType === '2x2' ? 'w-full max-w-2xl' : 'w-[90vw] max-w-[500px]'
      }`}>
        {videoUrls.map((videoUrl, index) => {
          return (
            <div
              key={index}
              className={`relative bg-gray-900 rounded overflow-hidden ${
                layoutType === '2x2' ? 'aspect-square' : 'aspect-[3/4]'
              }`}
            >
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
                {index + 1}번째 순간
              </div>
              <video
                ref={el => videoRefs.current[index] = el}
                src={videoUrl}
                loop
                muted
                playsInline
                className={`w-full h-full object-contain transition-opacity duration-500 ${
                  showVideos ? 'opacity-100' : 'opacity-30'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      {showVideos && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleDownloadComposite}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all shadow-lg"
          >
            📥 사진 저장하기
          </button>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            닫기
          </button>
        </div>
      )}

      <p className="text-white text-sm mt-4 text-center">
        🎥 촬영 전 준비하는 모습을 담은 라이브 포토
      </p>

      {/* 숨겨진 캔버스 (합성용) */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default function LivePhotoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">라이브 포토를 불러오는 중...</p>
      </div>
    }>
      <LivePhotoContent />
    </Suspense>
  );
}

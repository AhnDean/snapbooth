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
      return 'grid-cols-2 grid-rows-2 aspect-square';
    }
    return 'grid-cols-1 grid-rows-4 aspect-[3/4]';
  };

  // 라이브 포토 화면 캡처하여 다운로드/공유
  const handleDownloadComposite = async () => {
    if (videoUrls.length === 0) return;

    try {
      // 현재 화면의 라이브 포토 그리드 영역을 캡처
      const gridElement = document.querySelector('.live-photo-grid');
      if (!gridElement) return;

      // html2canvas 대신 간단하게 캔버스 사용
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const videos = videoRefs.current;

      // 캔버스 크기 설정 (3:4 비율 유지 - 4컷 사진과 동일)
      if (layoutType === '2x2') {
        canvas.width = 1200;
        canvas.height = 1600; // 3:4 비율
      } else {
        canvas.width = 900;
        canvas.height = 1200; // 3:4 비율
      }

      // 배경색
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = 20;

      if (layoutType === '2x2') {
        // 2x2 레이아웃 (각 셀도 3:4 비율)
        const cellWidth = (canvas.width - spacing * 3) / 2;
        const cellHeight = cellWidth * 4 / 3; // 3:4 비율 유지

        for (let i = 0; i < Math.min(4, videos.length); i++) {
          const video = videos[i];
          if (video && video.readyState >= 2) {
            const x = (i % 2) * (cellWidth + spacing) + spacing;
            const y = Math.floor(i / 2) * (cellHeight + spacing) + spacing;

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
        const cellWidth = canvas.width - spacing * 2;
        const cellHeight = (canvas.height - spacing * 5) / 4;

        for (let i = 0; i < Math.min(4, videos.length); i++) {
          const video = videos[i];
          if (video && video.readyState >= 2) {
            const y = i * (cellHeight + spacing) + spacing;

            // 비디오의 실제 비율 계산
            const videoAspect = video.videoWidth / video.videoHeight;
            const cellAspect = cellWidth / cellHeight;

            let drawWidth = cellWidth;
            let drawHeight = cellHeight;
            let drawX = spacing;
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

      // 캔버스를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        const filename = `chupbox_live_photo_${Date.now()}.jpg`;

        // 모바일 환경에서 Web Share API 지원 확인
        if (navigator.share) {
          try {
            const file = new File([blob], filename, { type: 'image/jpeg' });

            await navigator.share({
              files: [file],
              title: 'CHUPBOX 라이브 포토',
              text: '촬영 전 준비하는 모습을 담은 라이브 포토 🎬'
            });
            return;
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.log('공유 실패, 다운로드로 전환:', error);
            } else {
              return; // 사용자가 취소한 경우
            }
          }
        }

        // Web Share API를 지원하지 않거나 실패한 경우 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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
      <div className={`grid ${getGridStyle()} gap-5 bg-white p-10 rounded-xl w-full ${
        layoutType === '2x2' ? 'max-w-md' : 'max-w-sm'
      }`}>
        {videoUrls.map((videoUrl, index) => {
          return (
            <div
              key={index}
              className="relative bg-gray-900 rounded overflow-hidden aspect-[3/4]"
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

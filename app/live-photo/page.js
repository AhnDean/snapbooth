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
  const [videoBlobUrls, setVideoBlobUrls] = useState([]); // CORS 우회용 Blob URLs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRefs = useRef([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

          // CORS 문제 우회: 비디오를 Blob으로 변환
          console.log('🔄 비디오를 Blob으로 변환 중...');
          const blobUrls = await Promise.all(
            result.photo.video_urls.map(async (url) => {
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                console.log('✅ Blob 생성 완료:', url.substring(url.lastIndexOf('/') + 1));
                return blobUrl;
              } catch (error) {
                console.error('❌ Blob 변환 실패:', error);
                return url; // 실패시 원본 URL 사용
              }
            })
          );
          setVideoBlobUrls(blobUrls);
          console.log('✅ 모든 비디오 Blob 변환 완료');
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

  // 카운트다운 후 동영상 재생
  useEffect(() => {
    if (videoBlobUrls.length > 0 && !loading) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowVideos(true);

            // 모든 비디오 재생 시작
            videoRefs.current.forEach(video => {
              if (video) {
                video.play().catch(e => console.error('비디오 재생 실패:', e));
              }
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [videoBlobUrls, loading]);

  // 라이브 포토 저장 (Web Share API)
  const handleSaveLivePhoto = async () => {
    console.log('🖼️ 라이브 포토 저장 시작...');

    if (videoUrls.length === 0) {
      alert('동영상이 로드되지 않았습니다.');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const videos = videoRefs.current;

      // 각 비디오 상태 확인
      console.log('🎬 비디오 refs:', videos.filter(v => v).length, '개');
      videos.forEach((v, i) => {
        if (v) {
          console.log(`비디오 ${i+1}: readyState=${v.readyState}, ${v.videoWidth}x${v.videoHeight}`);
        }
      });

      const readyVideos = videos.filter(v => v && v.readyState >= 2);
      console.log('✅ 준비된 비디오:', readyVideos.length, '개');

      if (readyVideos.length === 0) {
        alert('비디오가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 모든 비디오가 재생 중인지 확인하고, 일시정지된 비디오는 현재 프레임 캡처를 위해 play 호출
      await Promise.all(readyVideos.map(async (video) => {
        if (video.paused) {
          try {
            await video.play();
            // 잠시 대기하여 프레임이 렌더링되도록 함
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (e) {
            console.warn('비디오 재생 시도 실패 (무음이므로 괜찮음):', e);
          }
        }
      }));

      // 첫 번째 비디오의 원본 크기 가져오기
      const firstVideo = readyVideos[0];
      const videoWidth = firstVideo.videoWidth;
      const videoHeight = firstVideo.videoHeight;

      console.log('📐 원본 비디오 크기:', videoWidth, 'x', videoHeight);

      const spacing = 20;
      const padding = 40;

      if (layoutType === '2x2') {
        // 2x2 레이아웃: 정사각형
        const size = 280;
        canvas.width = (size * 2) + spacing + (padding * 2);
        canvas.height = (size * 2) + spacing + (padding * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2x2 위치
        const positions = [
          { x: padding, y: padding },
          { x: padding + size + spacing, y: padding },
          { x: padding, y: padding + size + spacing },
          { x: padding + size + spacing, y: padding + size + spacing }
        ];

        for (let i = 0; i < Math.min(4, readyVideos.length); i++) {
          const video = readyVideos[i];
          const pos = positions[i];

          // 정사각형으로 crop
          const sourceSize = Math.min(video.videoWidth, video.videoHeight);
          const sx = (video.videoWidth - sourceSize) / 2;
          const sy = (video.videoHeight - sourceSize) / 2;

          ctx.drawImage(video, sx, sy, sourceSize, sourceSize, pos.x, pos.y, size, size);
        }
      } else {
        // 1x4 레이아웃: 원본 비율 유지
        canvas.width = videoWidth + (padding * 2);
        canvas.height = (videoHeight * 4) + (spacing * 3) + (padding * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < Math.min(4, readyVideos.length); i++) {
          const video = readyVideos[i];
          const y = padding + (i * (videoHeight + spacing));
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, padding, y, videoWidth, videoHeight);
        }
      }

      console.log('🎨 캔버스 생성 완료:', canvas.width, 'x', canvas.height);

      // Blob 생성을 Promise로 래핑
      const createBlob = () => {
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Blob 생성 실패'));
            }
          }, 'image/jpeg', 0.95);
        });
      };

      const blob = await createBlob();
      console.log('📦 Blob 생성:', Math.round(blob.size / 1024), 'KB');

      const filename = `chupbox_live_photo_${Date.now()}.jpg`;

      // Web Share API 시도 (iPhone Safari)
      if (navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'image/jpeg' });
          const shareData = { files: [file], title: 'CHUPBOX 라이브 포토', text: '라이브 포토' };

          console.log('📤 Web Share API 시도...');
          await navigator.share(shareData);
          console.log('✅ 공유 완료');
          alert('✅ 사진이 저장되었습니다! 사진 앱에서 확인하세요.');
          return;
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('❌ 사용자가 공유 취소');
            return;
          }
          console.error('⚠️ 공유 실패:', error);
          alert('공유 실패: ' + error.message + '\n다운로드로 시도합니다.');
        }
      }

      // 다운로드 fallback
      console.log('💾 다운로드 시작...');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // 약간의 지연 후 정리
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ 다운로드 완료');
      alert('✅ 다운로드 완료! 다운로드 폴더를 확인하세요.');

    } catch (error) {
      console.error('❌ 저장 실패:', error);
      console.error('에러 스택:', error.stack);
      alert('라이브 포토 저장에 실패했습니다.\n\n에러: ' + error.message + '\n\n콘솔 로그를 확인해주세요.');
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
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
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
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-80">
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

      {/* 비디오 그리드 - 4컷 사진과 정확히 동일한 레이아웃 */}
      <div
        ref={containerRef}
        className="bg-white rounded-xl"
        style={{
          padding: '40px',
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: layoutType === '2x2' ? 'repeat(2, 280px)' : '1fr',
          gridTemplateRows: layoutType === '2x2' ? 'repeat(2, 280px)' : 'repeat(4, auto)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        {videoBlobUrls.map((videoBlobUrl, index) => (
          <div
            key={index}
            className="relative bg-gray-900 rounded overflow-hidden cursor-pointer"
            style={{
              width: '100%',
              aspectRatio: layoutType === '2x2' ? '1 / 1' : '4 / 3'
            }}
            onClick={(e) => {
              // 비디오 클릭 시 재생/일시정지 토글
              const video = videoRefs.current[index];
              if (video) {
                if (video.paused) {
                  video.play().catch(err => console.error('재생 실패:', err));
                } else {
                  video.pause();
                }
              }
            }}
          >
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
              {index + 1}번째 순간
            </div>
            <video
              ref={el => videoRefs.current[index] = el}
              src={videoBlobUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full"
              style={{
                objectFit: layoutType === '2x2' ? 'cover' : 'contain',
                opacity: showVideos ? 1 : 0.3,
                transition: 'opacity 0.5s'
              }}
              onLoadedData={(e) => {
                console.log(`✅ 비디오 ${index + 1} 로드 완료, 재생 시도...`);
                e.target.play().catch(err => {
                  console.error(`❌ 비디오 ${index + 1} 자동재생 실패:`, err);
                });
              }}
            />
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      {showVideos && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSaveLivePhoto}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold shadow-lg"
          >
            📥 사진 저장하기
          </button>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      )}

      <div className="text-center mt-4">
        <p className="text-white text-sm">
          🎥 촬영 전 준비하는 모습을 담은 라이브 포토
        </p>
        <p className="text-gray-400 text-xs mt-1">
          💡 비디오를 탭하면 재생/일시정지됩니다
        </p>
      </div>

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

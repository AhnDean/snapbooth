'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LivePhotoPage() {
  const searchParams = useSearchParams();
  const [showVideos, setShowVideos] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [layoutType, setLayoutType] = useState('1x4');
  const [videoBlobs, setVideoBlobs] = useState([]);
  const videoRefs = useRef([]);
  const canvasRef = useRef(null);

  // URL에서 동영상 데이터 로드
  useEffect(() => {
    const layout = searchParams.get('layout') || '1x4';
    setLayoutType(layout);

    // sessionStorage에서 동영상 Blob 가져오기
    const storedVideos = sessionStorage.getItem('livePhotoVideos');
    if (storedVideos) {
      const videoUrls = JSON.parse(storedVideos);
      // Data URL을 Blob으로 변환
      Promise.all(
        videoUrls.map(async (dataUrl) => {
          const response = await fetch(dataUrl);
          return await response.blob();
        })
      ).then(blobs => {
        setVideoBlobs(blobs);
      });
    }
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

  // 동영상을 캔버스에 합성하여 다운로드/공유
  const handleDownloadComposite = async () => {
    if (!canvasRef.current || videoBlobs.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    if (layoutType === '2x2') {
      canvas.width = 1024;
      canvas.height = 1024;
    } else {
      canvas.width = 600;
      canvas.height = 1800;
    }

    // 배경색
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 각 동영상의 첫 프레임을 캔버스에 그리기
    const videos = videoRefs.current;
    const spacing = 10;

    if (layoutType === '2x2') {
      // 2x2 레이아웃
      const cellWidth = (canvas.width - spacing * 3) / 2;
      const cellHeight = (canvas.height - spacing * 3) / 2;

      for (let i = 0; i < Math.min(4, videos.length); i++) {
        const video = videos[i];
        if (video) {
          const x = (i % 2) * (cellWidth + spacing) + spacing;
          const y = Math.floor(i / 2) * (cellHeight + spacing) + spacing;
          ctx.drawImage(video, x, y, cellWidth, cellHeight);
        }
      }
    } else {
      // 1x4 레이아웃
      const cellWidth = canvas.width - spacing * 2;
      const cellHeight = (canvas.height - spacing * 5) / 4;

      for (let i = 0; i < Math.min(4, videos.length); i++) {
        const video = videos[i];
        if (video) {
          const y = i * (cellHeight + spacing) + spacing;
          ctx.drawImage(video, spacing, y, cellWidth, cellHeight);
        }
      }
    }

    // 캔버스를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      const filename = `chupbox_live_photo_${Date.now()}.png`;

      // 모바일 환경에서 Web Share API 지원 확인
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'CHUPBOX 라이브 포토',
              text: '촬영 전 준비하는 모습을 담은 라이브 포토'
            });
            return;
          }
        } catch (error) {
          console.log('공유 취소 또는 실패:', error);
        }
      }

      // Web Share API를 지원하지 않거나 실패한 경우 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (videoBlobs.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">라이브 포토를 불러오는 중...</p>
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

      {/* 동영상 그리드 */}
      <div className={`grid ${getGridStyle()} gap-2 bg-black p-4 rounded-xl w-full ${
        layoutType === '2x2' ? 'max-w-md' : 'max-w-sm'
      }`}>
        {videoBlobs.map((blob, index) => {
          const videoUrl = URL.createObjectURL(blob);
          return (
            <div
              key={index}
              className="relative bg-gray-900 rounded overflow-hidden"
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
                className={`w-full h-full object-cover transition-opacity duration-500 ${
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

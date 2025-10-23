'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 완성된 4컷 사진 위에 동영상을 오버레이하는 컴포넌트
 * - 5초 대기 후 자동 재생
 * - 레이아웃(1x4 / 2x2)에 맞춰 동영상 위치 조정
 */
export default function VideoOverlay({
  videoBlobs = [],
  layoutType = '1x4',
  onClose
}) {
  const [showVideos, setShowVideos] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const videoRefs = useRef([]);

  // 5초 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowVideos(true);
    }
  }, [countdown]);

  // 동영상이 표시되면 재생 시작
  useEffect(() => {
    if (showVideos) {
      // 약간의 딜레이 후 재생 (동영상 로드 대기)
      const playTimeout = setTimeout(() => {
        videoRefs.current.forEach(async (video) => {
          if (video) {
            try {
              // 동영상이 로드될 때까지 대기
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

  // 레이아웃에 따른 그리드 스타일
  const getGridStyle = () => {
    if (layoutType === '2x2') {
      return 'grid-cols-2 grid-rows-2';
    }
    return 'grid-cols-1 grid-rows-4'; // 1x4
  };

  // 동영상이 없으면 렌더링하지 않음
  if (videoBlobs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl hover:text-red-500 transition-colors"
        >
          ✕ 닫기
        </button>

        {/* 카운트다운 표시 */}
        {!showVideos && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50 rounded-xl">
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
        <div className={`grid ${getGridStyle()} gap-2 bg-white p-4 rounded-xl shadow-2xl`}>
          {videoBlobs.map((blob, index) => {
            const videoUrl = URL.createObjectURL(blob);
            return (
              <div
                key={index}
                className={`relative ${layoutType === '1x4' ? 'aspect-[3/4]' : 'aspect-square'} bg-gray-100 rounded overflow-hidden`}
              >
                {/* 동영상 라벨 */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
                  {index + 1}번째 순간
                </div>

                {/* 동영상 */}
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

                {/* 재생 아이콘 (카운트다운 중) */}
                {!showVideos && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        {showVideos && (
          <div className="mt-4 text-center text-white text-sm">
            🎥 촬영 전 준비하는 모습을 담은 라이브 포토입니다
          </div>
        )}
      </div>
    </div>
  );
}

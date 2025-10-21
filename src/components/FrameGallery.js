'use client';

import { useState } from 'react';

const FrameGallery = ({
  frames = [],
  selectedFrame = null,
  onSelectFrame,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState({});

  // 프레임 선택 핸들러
  const handleFrameSelect = (frame) => {
    onSelectFrame && onSelectFrame(frame);
  };

  // 이미지 로딩 핸들러
  const handleImageLoad = (frameId) => {
    setIsLoading(prev => ({ ...prev, [frameId]: false }));
  };

  const handleImageLoadStart = (frameId) => {
    setIsLoading(prev => ({ ...prev, [frameId]: true }));
  };

  // 이미지 에러 핸들러
  const handleImageError = (frameId) => {
    setIsLoading(prev => ({ ...prev, [frameId]: false }));
    console.warn(`프레임 이미지 로드 실패: ${frameId}`);
  };

  return (
    <div className={`frame-gallery ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🖼️ 프레임 선택
        </h3>
        <div className="text-sm text-gray-500">
          {frames.length}개
        </div>
      </div>

      {/* 프레임 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* 프레임 없음 옵션 */}
        <div
          onClick={() => handleFrameSelect(null)}
          className={`
            relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 aspect-[3/4]
            ${!selectedFrame
              ? 'ring-4 ring-blue-500 shadow-xl'
              : 'hover:shadow-lg border-2 border-gray-200'
            }
          `}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">🚫</div>
              <div className="text-xs font-medium text-gray-600">프레임 없음</div>
            </div>
          </div>

          {/* 선택 표시 */}
          {!selectedFrame && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 프레임 목록 */}
        {frames.map((frame) => (
          <div
            key={frame.id}
            onClick={() => handleFrameSelect(frame)}
            className={`
              relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 aspect-[3/4]
              ${selectedFrame?.id === frame.id
                ? 'ring-4 ring-blue-500 shadow-xl'
                : 'hover:shadow-lg border-2 border-gray-200'
              }
            `}
          >
            {/* 로딩 상태 */}
            {isLoading[frame.id] && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* 프레임 썸네일 이미지 */}
            <div className="relative w-full h-full bg-gray-100">
              <img
                src={frame.src}
                alt={frame.name}
                className="w-full h-full object-cover"
                onLoadStart={() => handleImageLoadStart(frame.id)}
                onLoad={() => handleImageLoad(frame.id)}
                onError={() => handleImageError(frame.id)}
              />

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

              {/* 프레임 정보 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-white text-xs font-medium truncate">
                  {frame.name}
                </div>
              </div>
            </div>

            {/* 선택 표시 */}
            {selectedFrame?.id === frame.id && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 프레임이 없을 때 */}
      {frames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            사용 가능한 프레임이 없습니다
          </h3>
          <p className="text-gray-500">
            프레임을 추가해주세요.
          </p>
        </div>
      )}

      {/* 선택된 프레임 정보 */}
      {selectedFrame && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={selectedFrame.src}
                alt={selectedFrame.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">{selectedFrame.name}</h4>
              <p className="text-sm text-blue-600">선택된 프레임</p>
            </div>
          </div>
        </div>
      )}

      {/* 프레임 없음 선택 시 안내 */}
      {!selectedFrame && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">프레임 없음</h4>
              <p className="text-sm text-gray-600">
                원본 사진 그대로 사용합니다
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameGallery;
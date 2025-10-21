'use client';

import { useState, useEffect } from 'react';
import Camera from '../../components/Camera';
import FrameGallery from '../../components/FrameGallery';
import { applyFrame, downloadImage, generateFilename } from '../../utils/imageProcessing';
import { FRAMES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

export default function BoothPage() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFrameGallery, setShowFrameGallery] = useState(true);
  const [notification, setNotification] = useState(null);

  // 사진 촬영 핸들러
  const handlePhotoCapture = async (photoDataUrl) => {
    setCapturedPhoto(photoDataUrl);

    // 프레임이 선택되어 있으면 자동으로 적용
    if (selectedFrame) {
      await processPhotoWithFrame(photoDataUrl, selectedFrame);
    } else {
      setProcessedPhoto(photoDataUrl);
    }

    showNotification(SUCCESS_MESSAGES.PHOTO_CAPTURED, 'success');
  };

  // 프레임 선택 핸들러
  const handleFrameSelect = async (frame) => {
    setSelectedFrame(frame);

    // 촬영된 사진이 있으면 프레임 적용
    if (capturedPhoto) {
      await processPhotoWithFrame(capturedPhoto, frame);
    }
  };

  // 프레임 적용 처리
  const processPhotoWithFrame = async (photoDataUrl, frame) => {
    setIsProcessing(true);

    try {
      let result;
      if (frame && frame.src) {
        result = await applyFrame(photoDataUrl, frame.src);
      } else {
        result = photoDataUrl; // 프레임 없음
      }

      setProcessedPhoto(result);
    } catch (error) {
      console.error('프레임 적용 실패:', error);
      setProcessedPhoto(photoDataUrl); // 실패 시 원본 사용
      showNotification(ERROR_MESSAGES.PROCESSING_FAILED, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 이미지 다운로드 핸들러
  const handleDownload = () => {
    if (!processedPhoto) return;

    try {
      const filename = generateFilename('photobooth');
      const success = downloadImage(processedPhoto, filename);

      if (success) {
        showNotification(SUCCESS_MESSAGES.DOWNLOAD_COMPLETED, 'success');
      } else {
        showNotification(ERROR_MESSAGES.DOWNLOAD_FAILED, 'error');
      }
    } catch (error) {
      console.error('다운로드 실패:', error);
      showNotification(ERROR_MESSAGES.DOWNLOAD_FAILED, 'error');
    }
  };

  // 다시 촬영
  const handleRetake = () => {
    setCapturedPhoto(null);
    setProcessedPhoto(null);
    setIsProcessing(false);
  };

  // 알림 표시
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 프레임 갤러리 토글
  const toggleFrameGallery = () => {
    setShowFrameGallery(!showFrameGallery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📸</div>
              <h1 className="text-xl font-bold text-gray-900">SnapBooth</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* 프레임 갤러리 토글 */}
              <button
                onClick={toggleFrameGallery}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                  ${showFrameGallery
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                프레임 {showFrameGallery ? '숨기기' : '선택'}
              </button>

              {/* 홈으로 돌아가기 */}
              <a
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                홈으로
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showFrameGallery ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>

          {/* 카메라 영역 */}
          <div className={`${showFrameGallery ? 'lg:col-span-2' : 'max-w-2xl mx-auto'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <Camera
                onCapture={handlePhotoCapture}
                selectedFrame={selectedFrame}
                className="w-full"
              />

              {/* 촬영된 사진이 있을 때 액션 버튼들 */}
              {capturedPhoto && (
                <div className="mt-6 space-y-4">
                  {/* 처리 중 표시 */}
                  {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">프레임 적용 중...</span>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {/* 다운로드 버튼 */}
                    <button
                      onClick={handleDownload}
                      disabled={!processedPhoto || isProcessing}
                      className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                        ${processedPhoto && !isProcessing
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      이미지 다운로드
                    </button>

                    {/* 다시 촬영 버튼 */}
                    <button
                      onClick={handleRetake}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      다시 촬영
                    </button>

                    {/* 프레임 변경 버튼 (모바일에서 갤러리가 숨겨졌을 때) */}
                    {!showFrameGallery && (
                      <button
                        onClick={toggleFrameGallery}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        프레임 변경
                      </button>
                    )}
                  </div>

                  {/* 현재 선택된 프레임 정보 */}
                  {selectedFrame && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-white rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={selectedFrame.src}
                            alt={selectedFrame.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">
                            현재 프레임: {selectedFrame.name}
                          </p>
                          <p className="text-sm text-blue-600">
                            사진에 자동으로 적용됩니다
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 프레임 갤러리 영역 */}
          {showFrameGallery && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <FrameGallery
                  frames={FRAMES}
                  selectedFrame={selectedFrame}
                  onSelectFrame={handleFrameSelect}
                />
              </div>
            </div>
          )}
        </div>

        {/* 사용 가이드 (촬영 전) */}
        {!capturedPhoto && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
                📖 사용 방법
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📷</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">1. 카메라 켜기</h3>
                  <p className="text-gray-600 text-sm">
                    초록색 버튼을 눌러 카메라를 켜고 촬영 준비를 하세요
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">2. 프레임 선택</h3>
                  <p className="text-gray-600 text-sm">
                    오른쪽에서 마음에 드는 프레임을 선택하세요
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">3. 촬영 & 다운로드</h3>
                  <p className="text-gray-600 text-sm">
                    중앙 버튼으로 촬영하고 결과를 다운로드하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 알림 토스트 */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`
            px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-80
            ${notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
            }
          `}>
            <div className="text-xl">
              {notification.type === 'success' ? '✅'
               : notification.type === 'error' ? '❌'
               : 'ℹ️'}
            </div>
            <p className="font-medium">{notification.message}</p>

            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
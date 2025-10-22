'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { CAMERA_CONSTRAINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const Camera = ({
  onCapture,
  selectedFrame = null,
  className = '',
  autoCapture = false,
  is4CutMode = false,
  isReviewingPhoto = false,
  reviewPhoto = null,
  onProceedNext = null,
  onRetake = null
}) => {
  const webcamRef = useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true); // 자동으로 켜짐
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = 전면, 'environment' = 후면
  const [cameraResolution, setCameraResolution] = useState(null);

  // 이미지를 4:3 비율로 크롭
  const cropTo4x3 = (imageDataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const targetRatio = 4 / 3;
        const sourceRatio = img.width / img.height;

        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let sourceX = 0;
        let sourceY = 0;

        // 원본이 더 넓은 경우 (16:9 등) - 좌우를 크롭
        if (sourceRatio > targetRatio) {
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
        }
        // 원본이 더 높은 경우 - 상하를 크롭
        else if (sourceRatio < targetRatio) {
          sourceHeight = img.width / targetRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // 4:3 비율로 캔버스 설정
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        // 크롭된 영역을 캔버스에 그리기
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        );

        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  };

  // 사진 촬영
  const capture = useCallback(async () => {
    if (!webcamRef.current || !isWebcamOn) return;

    try {
      setIsCapturing(true);

      // 실제 적용된 해상도 확인 (개발용)
      const video = webcamRef.current.video;
      if (video) {
        const resolution = `${video.videoWidth} x ${video.videoHeight}`;
        console.log('실제 카메라 해상도:', resolution);
        setCameraResolution(resolution);
      }

      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        // 4:3 비율로 크롭
        const croppedImage = await cropTo4x3(imageSrc);

        // 4컷 모드가 아닐 때만 capturedImage를 저장
        if (!is4CutMode) {
          setCapturedImage(croppedImage);
        }
        onCapture && onCapture(croppedImage);

        // 촬영 성공 피드백
        setTimeout(() => {
          setIsCapturing(false);
        }, 200);
      } else {
        throw new Error('Screenshot failed');
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CAPTURE_FAILED);
      setIsCapturing(false);
    }
  }, [isWebcamOn, onCapture, is4CutMode]);

  // 다시 촬영
  const retake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  // 카메라 전환 (전면/후면)
  const switchCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  }, []);

  // 웹캠 에러 처리
  const handleWebcamError = useCallback((error) => {
    console.error('Webcam error:', error);

    if (error.name === 'NotAllowedError') {
      setError(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED);
    } else if (error.name === 'NotFoundError') {
      setError(ERROR_MESSAGES.CAMERA_NOT_FOUND);
    } else if (error.name === 'NotReadableError') {
      setError(ERROR_MESSAGES.CAMERA_IN_USE);
    } else {
      setError(ERROR_MESSAGES.UNSUPPORTED_BROWSER);
    }

    setIsWebcamOn(false);
  }, []);

  // 4컷 모드 자동 촬영
  useEffect(() => {
    if (autoCapture && isWebcamOn) {
      // 약간의 딜레이 후 자동 촬영 (카메라 안정화)
      const timer = setTimeout(() => {
        capture();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoCapture, isWebcamOn]);

  return (
    <div className={`camera-container ${className}`}>
      {/* 메인 카메라 영역 */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* 웹캠 화면 또는 플레이스홀더 */}
        <div className="relative aspect-[4/3] bg-gray-800">
          {isReviewingPhoto && reviewPhoto ? (
            /* 리뷰 모드 - 촬영된 사진 표시 */
            <div className="relative w-full h-full">
              <img
                src={reviewPhoto}
                alt="review"
                className="w-full h-full object-cover"
              />

              {/* 프레임 오버레이 */}
              {selectedFrame && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <img
                    src={selectedFrame.src}
                    alt="frame overlay"
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: 'normal' }}
                  />
                </div>
              )}
            </div>
          ) : isWebcamOn && !capturedImage ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                screenshotQuality={1.0}
                videoConstraints={{
                  ...CAMERA_CONSTRAINTS.video,
                  facingMode: facingMode
                }}
                onUserMediaError={handleWebcamError}
                className="w-full h-full object-cover"
                mirrored={facingMode === 'user'}
              />

              {/* 프레임 오버레이 */}
              {selectedFrame && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <img
                    src={selectedFrame.src}
                    alt="frame overlay"
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: 'normal' }}
                  />
                </div>
              )}

              {/* 촬영 효과 */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white opacity-70 animate-ping" />
              )}
            </>
          ) : capturedImage ? (
            /* 촬영된 사진 미리보기 */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="captured"
                className="w-full h-full object-cover"
              />

              {/* 프레임 오버레이 (캡처된 이미지에도 적용) */}
              {selectedFrame && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <img
                    src={selectedFrame.src}
                    alt="frame overlay"
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: 'normal' }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* 카메라 꺼짐 상태 */
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-medium">카메라를 켜서 시작하세요</p>
                <p className="text-sm mt-2">아래 카메라 버튼을 눌러주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium mb-2">오류가 발생했습니다</p>
              <p className="text-sm opacity-90">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex justify-center items-center gap-4 mt-6">
        {/* 카메라 전환 버튼 */}
        {!capturedImage && (
          <button
            onClick={switchCamera}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            title={facingMode === 'user' ? '후면 카메라로 전환' : '전면 카메라로 전환'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* 중앙: 촬영 버튼 - 리뷰 모드일 때는 다음 단계 진행 */}
        <button
          onClick={isReviewingPhoto && onProceedNext ? onProceedNext : capture}
          disabled={!isWebcamOn || isCapturing}
          className={`
            flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl
            ${isWebcamOn && !isCapturing
              ? 'bg-white hover:bg-gray-100 text-gray-800 border-4 border-gray-300'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }
          `}
          title={isReviewingPhoto ? "다음 사진으로" : "사진 촬영"}
        >
          {isCapturing ? (
            <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full" />
            </div>
          )}
        </button>

        {/* 오른쪽: 다시 찍기 버튼 (리뷰 모드일 때만 표시) */}
        {isReviewingPhoto && onRetake && (
          <button
            onClick={onRetake}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            title="다시 찍기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* 다시 촬영 버튼 제거 (4컷 모드에서는 필요없음) */}
        {false && capturedImage && (
          <button
            onClick={retake}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            title="다시 촬영"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* 카메라 상태 표시 */}
      <div className="flex justify-center mt-4 gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          카메라 켜짐 ({facingMode === 'user' ? '전면' : '후면'})
        </div>
        {cameraResolution && (
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            해상도: {cameraResolution}
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
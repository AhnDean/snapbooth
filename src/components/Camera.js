'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { CAMERA_CONSTRAINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const Camera = ({ onCapture, selectedFrame = null, className = '' }) => {
  const webcamRef = useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = 전면, 'environment' = 후면

  // 카메라 켜기/끄기
  const toggleWebcam = useCallback(async () => {
    try {
      setError(null);
      if (isWebcamOn) {
        // 카메라 끄기
        setIsWebcamOn(false);
        setCapturedImage(null);
      } else {
        // 카메라 켜기
        setIsWebcamOn(true);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED);
      setIsWebcamOn(false);
    }
  }, [isWebcamOn]);

  // 사진 촬영
  const capture = useCallback(() => {
    if (!webcamRef.current || !isWebcamOn) return;

    try {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        setCapturedImage(imageSrc);
        onCapture && onCapture(imageSrc);

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
  }, [isWebcamOn, onCapture]);

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

  return (
    <div className={`camera-container ${className}`}>
      {/* 메인 카메라 영역 */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* 웹캠 화면 또는 플레이스홀더 */}
        <div className="relative aspect-[4/3] bg-gray-800">
          {isWebcamOn && !capturedImage ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
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
        {/* 카메라 on/off 버튼 */}
        <button
          onClick={toggleWebcam}
          className={`
            flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg
            ${isWebcamOn
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
          title={isWebcamOn ? '카메라 끄기' : '카메라 켜기'}
        >
          {isWebcamOn ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        {/* 촬영 버튼 */}
        <button
          onClick={capture}
          disabled={!isWebcamOn || isCapturing}
          className={`
            flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl
            ${isWebcamOn && !isCapturing
              ? 'bg-white hover:bg-gray-100 text-gray-800 border-4 border-gray-300'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }
          `}
          title="사진 촬영"
        >
          {isCapturing ? (
            <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full" />
            </div>
          )}
        </button>

        {/* 카메라 전환 버튼 (카메라가 켜져있고 촬영하지 않았을 때만 표시) */}
        {isWebcamOn && !capturedImage && (
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

        {/* 다시 촬영 버튼 (촬영된 이미지가 있을 때만 표시) */}
        {capturedImage && (
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
      <div className="flex justify-center mt-4">
        <div className={`
          flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
          ${isWebcamOn
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          <div className={`
            w-2 h-2 rounded-full
            ${isWebcamOn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}
          `} />
          {isWebcamOn ? `카메라 켜짐 (${facingMode === 'user' ? '전면' : '후면'})` : '카메라 꺼짐'}
        </div>
      </div>

      {/* 사용 가이드 (카메라가 꺼져있을 때) */}
      {!isWebcamOn && !error && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-center text-blue-800">
            <h3 className="font-semibold mb-2">📝 사용 방법</h3>
            <div className="text-sm space-y-1">
              <p>1. 초록색 버튼을 눌러 카메라를 켜세요</p>
              <p>2. 가운데 큰 버튼으로 사진을 촬영하세요</p>
              <p>3. 마음에 들지 않으면 다시 촬영할 수 있어요</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
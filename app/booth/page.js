'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import Camera from '../../src/components/Camera';
import FrameGallery from '../../src/components/FrameGallery';
import { applyFrame, downloadImage, generateFilename, create4CutLayout } from '../../src/utils/imageProcessing';
import { FRAMES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/utils/constants';
import { uploadPhotoToCloud, uploadVideosToCloud, saveVideoUrls } from '../../src/utils/photoUpload';
import videoRecorder from '../../src/utils/videoRecorder';

// Force dynamic rendering to avoid build-time errors with environment variables
export const dynamic = 'force-dynamic';

export default function BoothPage() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFrameGallery, setShowFrameGallery] = useState(true);
  const [notification, setNotification] = useState(null);

  // 4컷 촬영 상태
  const [fourCutPhotos, setFourCutPhotos] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [isAutoMode, setIsAutoMode] = useState(false); // 자동/수동 모드
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState(null); // 방금 찍은 사진
  const [isReviewingPhoto, setIsReviewingPhoto] = useState(false); // 사진 확인 중
  const [photoCode, setPhotoCode] = useState(null); // 업로드된 사진 코드
  const countdownTimerRef = useRef(null);
  const cameraRef = useRef(null);

  // 새로운 옵션 상태
  const [layoutType, setLayoutType] = useState('1x4'); // 1x4, 2x2
  const [countdownDuration, setCountdownDuration] = useState(5); // 3, 5, 7 초
  const [showFrameModal, setShowFrameModal] = useState(false);

  // 동영상 녹화 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]); // 녹화된 동영상 배열 (4개)
  const [currentVideoBlob, setCurrentVideoBlob] = useState(null); // 현재 녹화 중인 비디오

  // QR 코드 상태
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

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
  const handleDownload = async () => {
    if (!processedPhoto) return;

    try {
      const filename = generateFilename('chupbox_photo');

      // Data URL을 Blob으로 변환
      const response = await fetch(processedPhoto);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      // 모바일에서 Web Share API 사용 가능한지 확인
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'CHUPBOX 포토부스',
          text: '추억의 순간을 담았어요! 📸'
        });
        showNotification('공유 완료!', 'success');
      } else {
        // Web Share 미지원 시 일반 다운로드
        const success = downloadImage(processedPhoto, filename);

        if (success) {
          // 모바일인 경우 가이드 표시
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            showNotification(SUCCESS_MESSAGES.DOWNLOAD_COMPLETED, 'success');
            setTimeout(() => {
              showNotification('💡 다운로드 폴더에서 사진을 길게 눌러 "이미지로 저장"을 선택하면 갤러리에 저장됩니다', 'info');
            }, 2000);
          } else {
            showNotification(SUCCESS_MESSAGES.DOWNLOAD_COMPLETED, 'success');
          }
        } else {
          showNotification(ERROR_MESSAGES.DOWNLOAD_FAILED, 'error');
        }
      }
    } catch (error) {
      // 사용자가 공유 취소한 경우
      if (error.name === 'AbortError') {
        return;
      }
      console.error('다운로드 실패:', error);
      showNotification(ERROR_MESSAGES.DOWNLOAD_FAILED, 'error');
    }
  };

  // 이미지 인쇄 핸들러
  const handlePrint = () => {
    if (!processedPhoto) return;

    try {
      // 새 창에서 인쇄 미리보기 열기
      const printWindow = window.open('', '', 'width=800,height=600');

      if (!printWindow) {
        showNotification('팝업이 차단되었습니다. 팝업을 허용해주세요.', 'error');
        return;
      }

      // 인쇄용 HTML 작성
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>포토부스 인쇄</title>
            <style>
              @media print {
                @page {
                  size: 4in 6in; /* 4x6 inch 포토 용지 */
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f0f0f0;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                display: block;
              }
              @media print {
                body {
                  background: white;
                }
                img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
              }
            </style>
          </head>
          <body>
            <img src="${processedPhoto}" alt="Photobooth" onload="window.print(); setTimeout(() => window.close(), 500);" />
          </body>
        </html>
      `);
      printWindow.document.close();

      showNotification('인쇄 대화상자를 확인하세요', 'info');
    } catch (error) {
      console.error('인쇄 실패:', error);
      showNotification('인쇄에 실패했습니다', 'error');
    }
  };

  // 동영상 녹화 시작 (각 컷마다)
  const startVideoRecording = async () => {
    if (!cameraRef.current || !cameraRef.current.stream) {
      console.error('카메라 스트림을 찾을 수 없습니다');
      return;
    }

    try {
      await videoRecorder.startRecording(cameraRef.current.stream);
      setIsRecording(true);
      console.log(`🎥 동영상 녹화 시작 (${fourCutPhotos.length + 1}/4)`);
    } catch (error) {
      console.error('녹화 시작 실패:', error);
    }
  };

  // 동영상 녹화 종료 및 저장
  const stopVideoRecording = async () => {
    if (!videoRecorder.getIsRecording()) {
      console.warn('녹화 중이 아닙니다');
      return null;
    }

    try {
      const videoBlob = await videoRecorder.stopRecording();
      setIsRecording(false);

      console.log(`✅ ${fourCutPhotos.length + 1}번째 동영상 녹화 완료:`, {
        size: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
        type: videoBlob.type
      });

      return videoBlob;
    } catch (error) {
      console.error('녹화 종료 실패:', error);
      setIsRecording(false);
      return null;
    }
  };

  // 다시 촬영
  const handleRetake = () => {
    setCapturedPhoto(null);
    setProcessedPhoto(null);
    setIsProcessing(false);
    // 4컷 촬영 초기화
    setFourCutPhotos([]);
    setCountdown(5);
    setPhotoCode(null); // 코드 초기화
    // 동영상 초기화
    setRecordedVideos([]);
    setCurrentVideoBlob(null);
    setIsRecording(false);
    videoRecorder.cleanup();
  };

  // 촬영 초기화
  const resetShooting = () => {
    setFourCutPhotos([]);
    setCountdown(0);
    setIsAutoMode(false);
    setLastCapturedPhoto(null);
    setIsReviewingPhoto(false);
    setCapturedPhoto(null);
    setProcessedPhoto(null);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    // 동영상 초기화
    setRecordedVideos([]);
    setCurrentVideoBlob(null);
    setIsRecording(false);
    videoRecorder.cleanup();
  };

  // 4컷 사진 촬영 핸들러
  const handle4CutCapture = useCallback(async (photoDataUrl) => {
    // 이미 4컷 완성되었으면 더 이상 촬영 불가
    if (fourCutPhotos.length >= 4) {
      showNotification('이미 4컷 촬영이 완료되었습니다!', 'info');
      return;
    }

    // 동영상 녹화 중이면 종료하고 저장
    let videoBlob = null;
    if (isRecording) {
      videoBlob = await stopVideoRecording();
      if (videoBlob) {
        setRecordedVideos(prev => [...prev, videoBlob]);
        console.log(`✅ ${fourCutPhotos.length + 1}번째 동영상 저장 완료`);
      }
    }

    // 자동 모드: 바로 배열에 추가하고 다음 촬영
    if (isAutoMode) {
      const newPhotos = [...fourCutPhotos, photoDataUrl];
      setFourCutPhotos(newPhotos);

      if (newPhotos.length < 4) {
        // 다음 촬영 준비
        setTimeout(() => {
          setCountdown(countdownDuration);
          showNotification(`${newPhotos.length}/4 촬영 완료! ${countdownDuration}초 후 다음 촬영`, 'success');
        }, 500);
      } else {
        // 4장 모두 촬영 완료 - 합성 시작
        setCountdown(0);
        setIsAutoMode(false);

        showNotification('4컷 촬영 완료! 이미지 합성 중...', 'success');
        await create4CutImage(newPhotos);
      }
    } else {
      // 수동 모드: 확인 모드 진입
      setLastCapturedPhoto(photoDataUrl);
      setIsReviewingPhoto(true);
      setCountdown(0);
      showNotification('사진이 촬영되었습니다. 다시 찍기를 원하면 버튼을 누르세요.', 'success');
    }
  }, [fourCutPhotos.length, isAutoMode, countdownDuration, isRecording]);

  // 다음 컷으로 진행 (촬영 버튼을 다시 누르면)
  const proceedToNextPhoto = useCallback(async () => {
    if (!isReviewingPhoto || !lastCapturedPhoto) return;

    const newPhotos = [...fourCutPhotos, lastCapturedPhoto];
    setFourCutPhotos(newPhotos);
    setIsReviewingPhoto(false);
    setLastCapturedPhoto(null);

    if (newPhotos.length < 4) {
      // 자동 모드일 때만 카운트다운 시작
      if (isAutoMode) {
        setTimeout(() => {
          setCountdown(countdownDuration);
          showNotification(`${newPhotos.length}/4 촬영 완료! ${countdownDuration}초 후 다음 촬영`, 'success');
        }, 500);
      } else {
        // 수동 모드는 카운트다운 없이 다음 촬영 대기
        showNotification(`${newPhotos.length}/4 촬영 완료! 촬영 버튼을 눌러 다음 사진을 촬영하세요`, 'success');
      }
    } else {
      // 4장 모두 촬영 완료 - 합성 시작
      setCountdown(0);
      setIsAutoMode(false);

      showNotification('4컷 촬영 완료! 이미지 합성 중...', 'success');
      await create4CutImage(newPhotos);
    }
  }, [fourCutPhotos, lastCapturedPhoto, isReviewingPhoto, isAutoMode, countdownDuration]);

  // 촬영한 사진 다시 찍기
  const retakeCurrentPhoto = useCallback(() => {
    setLastCapturedPhoto(null);
    setIsReviewingPhoto(false);

    // 자동 모드면 카운트다운 재시작
    if (isAutoMode) {
      setCountdown(countdownDuration);
      showNotification(`다시 촬영합니다. ${countdownDuration}초 후 촬영`, 'info');
    } else {
      showNotification('촬영 버튼을 눌러 다시 촬영하세요', 'info');
    }
  }, [isAutoMode, countdownDuration]);

  // 자동 촬영 취소
  const cancelAutoMode = useCallback(() => {
    setIsAutoMode(false);
    setCountdown(0);
    showNotification('자동 촬영이 취소되었습니다', 'info');
  }, []);

  // 4컷 이미지 합성
  const create4CutImage = async (photos) => {
    setIsProcessing(true);

    try {
      // 원본 해상도 유지 - photoWidth와 photoHeight를 지정하지 않으면 원본 크기 유지
      const options = {
        // photoWidth와 photoHeight 제거 - imageProcessing.js에서 원본 크기 사용
        spacing: 20,
        padding: 40,
        backgroundColor: backgroundColor,
        footerText: new Date().toLocaleDateString('ko-KR')
      };

      const result = await create4CutLayout(
        photos,
        selectedFrame?.src || null,
        options
      );

      setProcessedPhoto(result);
      setCapturedPhoto(result);
      showNotification('4컷 이미지 생성 완료!', 'success');

      // 클라우드에 자동 업로드
      showNotification('클라우드에 저장 중...', 'info');
      const uploadResult = await uploadPhotoToCloud(result);

      if (uploadResult.success) {
        setPhotoCode(uploadResult.code); // 코드를 state에 저장

        // 동영상도 함께 업로드 (있는 경우)
        if (recordedVideos.length > 0) {
          showNotification(`동영상 업로드 중... (${recordedVideos.length}개)`, 'info');
          console.log(`🎬 동영상 업로드 시작: ${recordedVideos.length}개`);

          const videoUploadResult = await uploadVideosToCloud(recordedVideos, uploadResult.code);

          if (videoUploadResult.success) {
            // DB에 동영상 URL 저장
            const saveResult = await saveVideoUrls(uploadResult.code, videoUploadResult.videoUrls);

            if (saveResult.success) {
              console.log('✅ 동영상 업로드 및 DB 저장 완료');
              showNotification('사진과 라이브 포토가 모두 저장되었습니다!', 'success');
            } else {
              console.error('❌ 동영상 URL DB 저장 실패:', saveResult.error);
              showNotification('라이브 포토 저장 실패', 'error');
            }
          } else {
            console.error('❌ 동영상 업로드 실패:', videoUploadResult.error);
            showNotification('라이브 포토 업로드 실패 (사진은 저장됨)', 'error');
          }
        }

        // QR 코드 생성 (사진 찾기 URL)
        const findUrl = `${window.location.origin}/find?code=${uploadResult.code}`;
        const qrDataUrl = await QRCode.toDataURL(findUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);

        showNotification(`✅ 저장 완료! QR 코드로 사진을 찾을 수 있습니다`, 'success');
        console.log('📸 사진 코드:', uploadResult.code);
        console.log('🔗 사진 URL:', uploadResult.url);
        console.log('📱 QR 코드 URL:', findUrl);
      } else {
        console.error('업로드 실패:', uploadResult.error);
        showNotification(`⚠️ 저장 실패: ${uploadResult.error || '알 수 없는 오류'}`, 'error');
      }
    } catch (error) {
      console.error('4컷 합성 실패:', error);
      showNotification('4컷 이미지 생성 실패', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 카운트다운 타이머 (자동 모드일 때만)
  useEffect(() => {
    if (isAutoMode && countdown > 0) {
      // 카운트다운이 countdownDuration에서 시작할 때 (새로운 컷 시작) 녹화 시작
      if (countdown === countdownDuration && fourCutPhotos.length < 4) {
        startVideoRecording();
      }

      countdownTimerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [isAutoMode, countdown, countdownDuration, fourCutPhotos.length]);

  // 알림 표시
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    // 에러 메시지는 10초, 나머지는 5초 표시
    const duration = type === 'error' ? 10000 : 5000;
    setTimeout(() => setNotification(null), duration);
  };

  // 프레임 갤러리 토글
  const toggleFrameGallery = () => {
    setShowFrameGallery(!showFrameGallery);
  };

  return (
    <div className="min-h-screen bg-[#fef5e7]">
      {/* 헤더 */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-bold">
                <span style={{ color: '#ee5253' }}>CHUP</span>
                <span style={{ color: '#f7d945' }}>BOX</span>
              </h1>
              <p className="hidden sm:block text-sm text-gray-500 ml-2">Capture Memories</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* 홈으로 돌아가기 */}
              <Link
                href="/"
                className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">

          {/* 카메라 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6">

              {/* 설정 영역 */}
              <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* 레이아웃 선택 */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      레이아웃
                    </label>
                    <select
                      value={layoutType}
                      onChange={(e) => setLayoutType(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-700 font-medium"
                    >
                      <option value="1x4">1×4 (세로)</option>
                      <option value="2x2">2×2 (정사각)</option>
                    </select>
                  </div>

                  {/* 촬영 대기시간 선택 */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      대기시간
                    </label>
                    <select
                      value={countdownDuration}
                      onChange={(e) => setCountdownDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-700 font-medium"
                    >
                      <option value={3}>3초</option>
                      <option value={5}>5초</option>
                      <option value={7}>7초</option>
                    </select>
                  </div>

                  {/* 프레임 선택 버튼 */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      프레임
                    </label>
                    <button
                      onClick={() => setShowFrameModal(true)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base text-gray-700 font-medium bg-white hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="truncate">{selectedFrame ? selectedFrame.name : '없음'}</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

              {/* 4컷 모드 컨트롤 버튼들 */}
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 items-center">
                {/* 자동 촬영 버튼 */}
                {!isAutoMode && fourCutPhotos.length === 0 && (
                  <button
                    onClick={() => {
                      setIsAutoMode(true);
                      setCountdown(countdownDuration);
                      showNotification(`자동 촬영 시작! ${countdownDuration}초 후 첫 번째 사진이 촬영됩니다`, 'info');
                      // 동영상 녹화는 카운트다운이 시작되면 자동으로 시작됨
                    }}
                    className="px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ⏱️ 자동 촬영 + 🎥 동영상
                  </button>
                )}

                {/* 자동 촬영 취소 버튼 */}
                {isAutoMode && fourCutPhotos.length < 4 && (
                  <button
                    onClick={cancelAutoMode}
                    className="px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✕ 취소
                  </button>
                )}

                {/* 촬영 진행 상태 및 옵션 */}
                {(
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-base text-white shadow-md" style={{ backgroundColor: '#ee5253' }}>
                      {fourCutPhotos.length}/4 완료
                    </div>
                    {/* 배경 색상 선택 */}
                    <div className="flex gap-1.5 sm:gap-2 bg-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md">
                      {[
                        { color: '#000000', label: '블랙' },
                        { color: '#ee5253', label: '레드' },
                        { color: '#f7d945', label: '옐로우' },
                        { color: '#FFFFFF', label: '화이트' }
                      ].map(({ color, label }) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-3 transition-all hover:scale-110
                            ${backgroundColor === color ? 'ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2' : 'border-2 border-gray-300'}
                          `}
                          style={{
                            backgroundColor: color,
                            ringColor: '#ee5253'
                          }}
                          title={label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 알림 영역 (카메라 프레임 위) */}
              <div className="mb-4 min-h-[60px]">
                {/* 자동 모드 - 카운트다운 표시 */}
                {isAutoMode && countdown > 0 && (
                  <div className="bg-black bg-opacity-90 px-6 py-3 rounded-xl">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="text-5xl font-bold text-white animate-pulse">
                        {countdown}
                      </div>
                      <div className="text-lg text-white font-medium">
                        {fourCutPhotos.length + 1}/4 준비 중...
                      </div>
                    </div>
                    {/* 녹화 중 표시 */}
                    {isRecording && (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">🎥 동영상 녹화중</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 자동 모드 - 촬영 진행 표시 */}
                {isAutoMode && countdown === 0 && fourCutPhotos.length < 4 && (
                  <div className="bg-blue-500 bg-opacity-90 rounded-xl p-4">
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`
                            w-16 h-20 rounded-lg border-2 flex items-center justify-center text-2xl
                            ${index < fourCutPhotos.length
                              ? 'bg-green-100 border-green-500 text-green-600'
                              : index === fourCutPhotos.length
                              ? 'bg-blue-100 border-blue-500 animate-pulse text-blue-600'
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                            }
                          `}
                        >
                          {index < fourCutPhotos.length ? '✓' : index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 수동 모드 - 촬영 안내 */}
                {!isAutoMode && !isReviewingPhoto && fourCutPhotos.length < 4 && (
                  <div className="absolute top-4 left-4 right-4 bg-blue-500 bg-opacity-90 rounded-lg p-3 z-10">
                    <div className="text-center text-white font-semibold">
                      촬영 버튼을 눌러 {fourCutPhotos.length + 1}번째 사진을 촬영하세요
                    </div>
                  </div>
                )}

                {/* 사진 확인 중 - 안내 메시지 */}
                {isReviewingPhoto && lastCapturedPhoto && (
                  <div className="bg-green-500 bg-opacity-90 rounded-xl p-4">
                    <div className="text-center text-white font-semibold text-lg">
                      📸 {fourCutPhotos.length + 1}번째 사진 확인 중 - 다시 찍기 또는 촬영 버튼으로 다음 단계
                    </div>
                  </div>
                )}
              </div>

              {/* 카메라 영역 */}
              <div className="relative">
                <Camera
                  onCapture={handle4CutCapture}
                  selectedFrame={selectedFrame}
                  className="w-full"
                  ref={cameraRef}
                  autoCapture={isAutoMode && countdown === 0 && fourCutPhotos.length < 4 && !isReviewingPhoto}
                  is4CutMode={true}
                  isReviewingPhoto={isReviewingPhoto}
                  reviewPhoto={lastCapturedPhoto}
                  onProceedNext={proceedToNextPhoto}
                  onRetake={retakeCurrentPhoto}
                />
              </div>

              {/* 왼쪽 하단 버튼들 제거 - 우측으로 이동 */}

              {/* 완성된 사진 미리보기 (4컷 모드이므로 우측 모니터링에 표시됨) */}
              {false && processedPhoto && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    📸 완성된 사진
                  </h3>
                  <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-center">
                      <img
                        src={processedPhoto}
                        alt="완성된 사진"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 촬영 모니터링 영역 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:sticky lg:top-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                {processedPhoto && fourCutPhotos.length === 4 ? '📸 완성' : '📸 촬영'}
              </h3>

              {/* 촬영 완료 - 완성된 4컷 이미지 표시 */}
              {processedPhoto && fourCutPhotos.length === 4 ? (
                <div className="space-y-4">
                  <img
                    src={processedPhoto}
                    alt="완성된 4컷 사진"
                    className="w-full rounded-lg shadow-lg"
                  />

                  {/* QR 코드 표시 */}
                  {qrCodeUrl && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 font-semibold">📱 사진 찾기 QR 코드</p>
                      <div className="flex justify-center mb-3">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-40 h-40 border-4 border-white rounded-lg shadow"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        QR 코드를 스캔하면 30일 동안 사진을 찾을 수 있습니다
                      </p>
                    </div>
                  )}

                  {/* 라이브 포토 보기 및 동영상 다운로드 */}
                  {recordedVideos.length > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 text-center font-semibold">
                        🎬 라이브 포토 ({recordedVideos.length}개 순간)
                      </p>

                      {/* 라이브 포토 보기 버튼 */}
                      <button
                        onClick={() => {
                          // photoCode로 라이브 포토 페이지 열기
                          if (photoCode) {
                            const livePhotoUrl = `/live-photo?code=${photoCode}&layout=${layoutType}`;
                            window.open(livePhotoUrl, '_blank');
                          } else {
                            alert('사진 코드가 없습니다. 사진을 먼저 저장해주세요.');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all shadow-lg mb-2"
                      >
                        🎥 라이브 포토 보기
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        촬영 전 준비하는 모습을 담은 라이브 포토
                      </p>
                    </div>
                  )}

                  {/* 녹화 중 표시 */}
                  {isRecording && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-red-600">🎥 동영상 녹화 중... (10초)</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* 사진 인쇄 버튼 */}
                    <button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span className="hidden sm:inline">사진 </span>인쇄
                    </button>

                    {/* 갤러리에 저장 버튼 */}
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">갤러리에 </span>저장
                    </button>

                    {/* 다시 촬영 버튼 */}
                    <button
                      onClick={handleRetake}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      다시 촬영
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-semibold text-blue-800">진행 상황</span>
                    <span className="text-lg font-bold text-blue-600">{fourCutPhotos.length}/4</span>
                  </div>

                  {/* 1x4 레이아웃 */}
                  {layoutType === '1x4' && (
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`
                            relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all
                            ${index < fourCutPhotos.length
                              ? 'border-green-500 shadow-md'
                              : index === fourCutPhotos.length
                              ? 'border-blue-500 animate-pulse'
                              : 'border-gray-300 bg-gray-50'
                            }
                          `}
                        >
                          {fourCutPhotos[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={fourCutPhotos[index]}
                                alt={`촬영 ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* 프레임 오버레이 */}
                              {selectedFrame && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <img
                                    src={selectedFrame.src}
                                    alt={selectedFrame.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ✓ {index + 1}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-3xl font-bold text-gray-400">{index + 1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2x2 레이아웃 */}
                  {layoutType === '2x2' && (
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`
                            relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                            ${index < fourCutPhotos.length
                              ? 'border-green-500 shadow-md'
                              : index === fourCutPhotos.length
                              ? 'border-blue-500 animate-pulse'
                              : 'border-gray-300 bg-gray-50'
                            }
                          `}
                        >
                          {fourCutPhotos[index] ? (
                            <div className="relative w-full h-full">
                              <img
                                src={fourCutPhotos[index]}
                                alt={`촬영 ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* 프레임 오버레이 */}
                              {selectedFrame && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <img
                                    src={selectedFrame.src}
                                    alt={selectedFrame.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ✓ {index + 1}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-3xl font-bold text-gray-400">{index + 1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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

      {/* 프레임 선택 모달 */}
      {showFrameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setShowFrameModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">🖼️ 프레임 선택</h2>
              <button
                onClick={() => setShowFrameModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* 프레임 없음 옵션 */}
                <button
                  onClick={() => {
                    setSelectedFrame(null);
                    setShowFrameModal(false);
                    showNotification('프레임이 제거되었습니다', 'success');
                  }}
                  className={`
                    relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 border-2
                    ${!selectedFrame
                      ? 'ring-4 ring-blue-500 shadow-lg border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <p className="text-xs text-gray-600 font-medium">없음</p>
                    </div>
                  </div>
                  {!selectedFrame && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-500 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* 프레임 옵션들 */}
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      handleFrameSelect(frame);
                      setShowFrameModal(false);
                      showNotification(`${frame.name} 프레임이 선택되었습니다`, 'success');
                    }}
                    className={`
                      relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105
                      ${selectedFrame?.id === frame.id
                        ? 'ring-4 ring-blue-500 shadow-lg'
                        : 'ring-2 ring-gray-200 hover:ring-gray-300'
                      }
                    `}
                  >
                    <img
                      src={frame.src}
                      alt={frame.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedFrame?.id === frame.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-2">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs font-medium py-1 px-2 text-center">
                      {frame.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 토스트 */}
      {notification && (
        <div className="fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`
            px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl shadow-lg flex items-center gap-2 sm:gap-3 max-w-full sm:min-w-80
            ${notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
            }
          `}>
            <div className="text-lg sm:text-xl flex-shrink-0">
              {notification.type === 'success' ? '✅'
               : notification.type === 'error' ? '❌'
               : 'ℹ️'}
            </div>
            <p className="font-medium text-sm sm:text-base flex-1 break-words">{notification.message}</p>

            <button
              onClick={() => setNotification(null)}
              className="ml-auto flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
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
  const [isRecording, setIsRecording] = useState(false); // 녹화 중 상태
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

  // 라이브 포토 저장 (MP4 비디오로 저장)
  const handleSaveLivePhoto = async () => {
    console.log('🎥 라이브 포토 저장 시작...');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    console.log('📱 기기 정보:', {
      userAgent: navigator.userAgent,
      isIOS,
      mediaRecorderSupported: typeof MediaRecorder !== 'undefined'
    });

    if (videoUrls.length === 0) {
      alert('동영상이 로드되지 않았습니다.');
      return;
    }

    // MediaRecorder 지원 확인
    if (typeof MediaRecorder === 'undefined') {
      console.error('❌ MediaRecorder API 미지원');
      alert('죄송합니다. 이 브라우저는 비디오 녹화를 지원하지 않습니다.\n\n최신 Safari 또는 Chrome을 사용해주세요.');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const videos = videoRefs.current;

      // 각 비디오 상태 확인
      const readyVideos = videos.filter(v => v && v.readyState >= 2);
      console.log('✅ 준비된 비디오:', readyVideos.length, '개');

      if (readyVideos.length === 0) {
        alert('비디오가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 모든 비디오를 처음부터 재생
      await Promise.all(readyVideos.map(async (video) => {
        video.currentTime = 0;
        if (video.paused) {
          await video.play().catch(e => console.warn('재생 실패:', e));
        }
      }));

      // 첫 번째 비디오의 원본 크기 가져오기
      const firstVideo = readyVideos[0];
      const videoWidth = firstVideo.videoWidth;
      const videoHeight = firstVideo.videoHeight;

      console.log('📐 원본 비디오 크기:', videoWidth, 'x', videoHeight);

      const spacing = 20;
      const padding = 40;

      // 캔버스 크기 설정
      if (layoutType === '2x2') {
        const size = 280;
        canvas.width = (size * 2) + spacing + (padding * 2);
        canvas.height = (size * 2) + spacing + (padding * 2);
      } else {
        canvas.width = videoWidth + (padding * 2);
        canvas.height = (videoHeight * 4) + (spacing * 3) + (padding * 2);
      }

      console.log('🎨 캔버스 크기:', canvas.width, 'x', canvas.height);

      // MediaRecorder 설정 - 코덱 지원 확인
      const stream = canvas.captureStream(30); // 30 FPS

      // 지원되는 코덱 확인
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ 지원되는 코덱:', mimeType);
          break;
        } else {
          console.log('❌ 미지원 코덱:', mimeType);
        }
      }

      if (!selectedMimeType) {
        throw new Error('지원되는 비디오 코덱이 없습니다.');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      console.log('🎬 MediaRecorder 생성:', {
        mimeType: selectedMimeType,
        state: mediaRecorder.state
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // 녹화 완료 처리
      const recordingComplete = new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: selectedMimeType });
          console.log('📦 Blob 생성 완료:', {
            size: Math.round(blob.size / 1024),
            type: blob.type
          });
          resolve(blob);
        };
      });

      // 비디오 재생 애니메이션 함수
      const drawFrame = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (layoutType === '2x2') {
          const size = 280;
          const positions = [
            { x: padding, y: padding },
            { x: padding + size + spacing, y: padding },
            { x: padding, y: padding + size + spacing },
            { x: padding + size + spacing, y: padding + size + spacing }
          ];

          for (let i = 0; i < Math.min(4, readyVideos.length); i++) {
            const video = readyVideos[i];
            const pos = positions[i];
            const sourceSize = Math.min(video.videoWidth, video.videoHeight);
            const sx = (video.videoWidth - sourceSize) / 2;
            const sy = (video.videoHeight - sourceSize) / 2;
            ctx.drawImage(video, sx, sy, sourceSize, sourceSize, pos.x, pos.y, size, size);
          }
        } else {
          for (let i = 0; i < Math.min(4, readyVideos.length); i++) {
            const video = readyVideos[i];
            const y = padding + (i * (videoHeight + spacing));
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, padding, y, videoWidth, videoHeight);
          }
        }
      };

      // 녹화 시작
      setIsRecording(true);
      mediaRecorder.start();
      console.log('🔴 녹화 시작...');

      // 비디오 재생 중 프레임 그리기
      // 라이브 포토는 항상 10초로 고정 (비디오 루프 재생으로 10초 채움)
      const videoDuration = 10;
      const originalDuration = Math.max(...readyVideos.map(v => v.duration || 5));
      console.log(`⏱️ 라이브 포토 녹화: ${videoDuration}초 (원본 비디오: ${originalDuration.toFixed(1)}초 - 루프 재생으로 10초 채움)`);

      let animationId;
      const animate = () => {
        drawFrame();
        animationId = requestAnimationFrame(animate);
      };
      animate();

      // 비디오 종료 대기
      await new Promise(resolve => {
        setTimeout(() => {
          cancelAnimationFrame(animationId);
          mediaRecorder.stop();
          console.log('⏹️ 녹화 종료');
          resolve();
        }, videoDuration * 1000);
      });

      const blob = await recordingComplete;
      setIsRecording(false);
      console.log('📦 비디오 생성 완료:', Math.round(blob.size / 1024 / 1024), 'MB');

      // 파일 확장자 결정
      const extension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `chupbox_live_photo_${Date.now()}.${extension}`;
      console.log('💾 파일명:', filename);

      // iOS 기기 감지
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);

      // 다운로드 방식 사용 (Web Share API는 사용자 제스처 컨텍스트 손실로 신뢰 불가)
      console.log('💾 다운로드 시작...', { isIOS, isAndroid });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ 다운로드 완료');

      // 기기별 안내 메시지
      if (isIOS) {
        alert('✅ 라이브 포토가 저장되었습니다!\n\n📱 Safari 다운로드 버튼을 눌러\n파일 앱에서 확인하세요.\n\n💡 갤러리에 저장하려면:\n1. 파일 앱 > 다운로드 폴더\n2. 영상을 길게 눌러 공유\n3. "비디오 저장" 선택');
      } else if (isAndroid) {
        alert('✅ 라이브 포토가 저장되었습니다!\n\n📱 다운로드 폴더에서 확인하세요.\n\n💡 일부 브라우저는 파일 앱이나\n갤러리 앱에서 확인 가능합니다.');
      } else {
        alert('✅ 다운로드 완료!\n\n💻 다운로드 폴더를 확인하세요.');
      }

    } catch (error) {
      console.error('❌ 저장 실패:', error);
      console.error('에러 스택:', error.stack);
      setIsRecording(false);
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
    <div className="min-h-screen bg-black flex flex-col items-center p-4 overflow-y-auto">
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

      {/* 녹화 중 오버레이 - fixed positioning for iOS */}
      {isRecording && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <div className="text-2xl font-bold text-white mb-2">
              🎥 비디오 생성 중...
            </div>
            <div className="text-sm text-gray-400">
              잠시만 기다려주세요
            </div>
          </div>
        </div>
      )}

      {/* 비디오 그리드 - 4컷 사진과 정확히 동일한 레이아웃 */}
      <div
        ref={containerRef}
        className="bg-white rounded-xl mt-4 mb-4 flex-shrink-0"
        style={{
          padding: '20px',
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: layoutType === '2x2' ? 'repeat(2, 140px)' : '1fr',
          gridTemplateRows: layoutType === '2x2' ? 'repeat(2, 140px)' : 'repeat(4, auto)',
          maxWidth: '90vw',
          width: layoutType === '2x2' ? 'auto' : '300px'
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

      <div className="text-center mt-2 mb-4">
        <p className="text-white text-sm">
          🎥 촬영 전 준비하는 모습을 담은 라이브 포토
        </p>
        <p className="text-gray-400 text-xs mt-1">
          💡 비디오를 탭하면 재생/일시정지됩니다
        </p>
      </div>

      {/* 하단 버튼 - 고정 */}
      {showVideos && (
        <div className="mt-auto w-full max-w-md flex flex-col gap-3 px-4">
          <button
            onClick={handleSaveLivePhoto}
            disabled={isRecording}
            className={`w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold shadow-lg text-lg transition-opacity ${
              isRecording ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            📥 라이브 포토 저장하기
          </button>
          <button
            onClick={() => window.close()}
            disabled={isRecording}
            className={`w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-opacity ${
              isRecording ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            닫기
          </button>
        </div>
      )}

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

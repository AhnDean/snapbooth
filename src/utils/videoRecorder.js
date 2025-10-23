/**
 * 동영상 녹화 유틸리티
 * - 촬영 전 10초 동안 준비하는 모습을 녹화
 * - 해상도를 낮춰서 파일 크기 절약 (640x480)
 */

class VideoRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.autoStopTimer = null; // 자동 종료 타이머
  }

  /**
   * 녹화 시작
   * @param {MediaStream} stream - 카메라 스트림
   * @returns {Promise<void>}
   */
  async startRecording(stream) {
    if (this.isRecording) {
      console.warn('이미 녹화 중입니다');
      return;
    }

    try {
      this.stream = stream;
      this.recordedChunks = [];

      // MediaRecorder 설정
      const options = {
        mimeType: 'video/webm;codecs=vp8', // WebM 형식 (브라우저 호환성 좋음)
        videoBitsPerSecond: 1000000 // 1 Mbps (파일 크기 절약)
      };

      // mimeType 지원 확인
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn('VP8 코덱 미지원, 기본 설정 사용');
        delete options.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(stream, options);

      // 데이터 수집
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // 녹화 시작
      this.mediaRecorder.start(100); // 100ms마다 데이터 수집
      this.isRecording = true;

      console.log('✅ 녹화 시작:', {
        mimeType: this.mediaRecorder.mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond
      });

    } catch (error) {
      console.error('❌ 녹화 시작 실패:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * 녹화 중지
   * @returns {Promise<Blob>} - 녹화된 동영상 Blob
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.mediaRecorder) {
        reject(new Error('녹화 중이 아닙니다'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder.mimeType || 'video/webm'
          });

          const durationInSeconds = (this.recordedChunks.length * 100) / 1000; // 대략적인 시간
          const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);

          console.log('✅ 녹화 완료:', {
            duration: `약 ${durationInSeconds.toFixed(1)}초`,
            fileSize: `${fileSizeMB} MB`,
            type: blob.type,
            chunks: this.recordedChunks.length
          });

          this.isRecording = false;
          resolve(blob);
        } catch (error) {
          console.error('❌ 녹화 종료 처리 실패:', error);
          reject(error);
        }
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder 오류:', error);
        this.isRecording = false;
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 녹화된 동영상을 Data URL로 변환
   * @param {Blob} blob - 동영상 Blob
   * @returns {Promise<string>} - Data URL
   */
  async blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 녹화 상태 확인
   * @returns {boolean}
   */
  getIsRecording() {
    return this.isRecording;
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.recordedChunks = [];
    this.isRecording = false;
    console.log('🧹 VideoRecorder 정리 완료');
  }
}

// 싱글톤 인스턴스 생성
const videoRecorder = new VideoRecorder();

export default videoRecorder;

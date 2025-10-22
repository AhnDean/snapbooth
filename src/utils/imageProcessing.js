// 이미지 처리 유틸리티 함수들

import { IMAGE_CONFIG, FILTERS, OUTPUT_RESOLUTION } from './constants';

/**
 * 이미지에 프레임을 합성하는 함수
 * @param {string} photoDataUrl - 촬영한 사진의 Data URL
 * @param {string} frameImageUrl - 프레임 이미지 URL
 * @returns {Promise<string>} - 합성된 이미지의 Data URL
 */
export const applyFrame = (photoDataUrl, frameImageUrl) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const photo = new Image();
    const frame = new Image();

    photo.onload = () => {
      // 캔버스 크기를 사진 크기에 맞춤
      canvas.width = photo.width;
      canvas.height = photo.height;

      // 사진 그리기
      ctx.drawImage(photo, 0, 0);

      if (frameImageUrl) {
        frame.onload = () => {
          // 프레임 오버레이 (사진과 같은 크기로 스케일링)
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png', IMAGE_CONFIG.quality));
        };

        frame.onerror = () => {
          console.warn('프레임 로드 실패, 원본 이미지 반환');
          resolve(canvas.toDataURL('image/png', IMAGE_CONFIG.quality));
        };

        frame.src = frameImageUrl;
      } else {
        // 프레임이 없으면 원본 이미지 반환
        resolve(canvas.toDataURL('image/png', IMAGE_CONFIG.quality));
      }
    };

    photo.onerror = () => {
      reject(new Error('사진 로드에 실패했습니다.'));
    };

    photo.src = photoDataUrl;
  });
};

/**
 * 이미지에 필터를 적용하는 함수
 * @param {string} imageDataUrl - 원본 이미지 Data URL
 * @param {string} filterId - 적용할 필터 ID
 * @returns {Promise<string>} - 필터가 적용된 이미지 Data URL
 */
export const applyFilter = (imageDataUrl, filterId) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 필터 찾기
      const filter = FILTERS.find(f => f.id === filterId);

      if (filter && filter.css) {
        // CSS 필터 적용
        ctx.filter = filter.css;
      }

      ctx.drawImage(img, 0, 0);

      // 특별한 필터 처리 (픽셀 조작이 필요한 경우)
      if (filterId === 'grayscale' || filterId === 'sepia') {
        applyPixelFilter(ctx, canvas.width, canvas.height, filterId);
      }

      resolve(canvas.toDataURL('image/png', IMAGE_CONFIG.quality));
    };

    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다.'));
    };

    img.src = imageDataUrl;
  });
};

/**
 * 픽셀 단위 필터 적용 (고급 필터용)
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} width - 캔버스 너비
 * @param {number} height - 캔버스 높이
 * @param {string} filterType - 필터 타입
 */
const applyPixelFilter = (ctx, width, height, filterType) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    switch (filterType) {
      case 'grayscale':
        const gray = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = gray;
        break;

      case 'sepia':
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        break;

      default:
        break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * 4컷 세로 레이아웃 생성
 * @param {string[]} photos - 4장의 사진 Data URL 배열
 * @param {string} frameUrl - 적용할 프레임 URL (선택사항)
 * @param {Object} options - 레이아웃 옵션
 * @returns {Promise<string>} - 4컷 이미지 Data URL
 */
export const create4CutLayout = async (photos, frameUrl = null, options = {}) => {
  if (!photos || photos.length !== 4) {
    throw new Error('정확히 4장의 사진이 필요합니다.');
  }

  // 첫 번째 사진의 원본 크기를 얻기 위해 먼저 로드
  const firstImg = await loadImage(photos[0]);
  const originalWidth = firstImg.width;
  const originalHeight = firstImg.height;

  const {
    photoWidth = originalWidth,  // 원본 해상도 유지
    photoHeight = originalHeight, // 원본 해상도 유지
    spacing = 20,
    padding = 40,
    backgroundColor = '#ffffff',
    headerText = '',
    footerText = ''
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 헤더/푸터 텍스트 높이
  const textHeight = 60;
  const headerHeight = headerText ? textHeight : 0;
  const footerHeight = footerText ? textHeight : 0;

  // 캔버스 전체 크기 계산
  canvas.width = photoWidth + (padding * 2);
  canvas.height = (photoHeight * 4) + (spacing * 3) + (padding * 2) + headerHeight + footerHeight;

  // 배경색 설정
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 헤더 텍스트
  if (headerText) {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(headerText, canvas.width / 2, padding + 35);
  }

  // 각 사진을 순서대로 배치
  for (let i = 0; i < photos.length; i++) {
    try {
      let processedPhoto = photos[i];

      // 프레임이 있으면 적용
      if (frameUrl) {
        processedPhoto = await applyFrame(photos[i], frameUrl);
      }

      const img = await loadImage(processedPhoto);
      const y = padding + headerHeight + (i * (photoHeight + spacing));

      // 사진을 지정된 크기로 리사이즈해서 그리기
      ctx.drawImage(img, padding, y, photoWidth, photoHeight);

    } catch (error) {
      console.error(`사진 ${i + 1} 처리 중 오류:`, error);

      // 오류가 발생한 사진 자리에 플레이스홀더 표시
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(padding, padding + headerHeight + (i * (photoHeight + spacing)), photoWidth, photoHeight);

      ctx.fillStyle = '#999999';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('사진 로드 실패', canvas.width / 2, padding + headerHeight + (i * (photoHeight + spacing)) + photoHeight / 2);
    }
  }

  // 푸터 텍스트
  if (footerText) {
    ctx.fillStyle = '#666666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(footerText, canvas.width / 2, canvas.height - padding / 2);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
};

/**
 * 2x2 그리드 레이아웃 생성
 * @param {string[]} photos - 4장의 사진 Data URL 배열
 * @param {string} frameUrl - 적용할 프레임 URL (선택사항)
 * @param {Object} options - 레이아웃 옵션
 * @returns {Promise<string>} - 2x2 그리드 이미지 Data URL
 */
export const create2x2Layout = async (photos, frameUrl = null, options = {}) => {
  if (!photos || photos.length !== 4) {
    throw new Error('정확히 4장의 사진이 필요합니다.');
  }

  const {
    photoSize = 280,
    spacing = 20,
    padding = 40,
    backgroundColor = '#ffffff'
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 캔버스 크기 (2x2 그리드)
  canvas.width = (photoSize * 2) + spacing + (padding * 2);
  canvas.height = (photoSize * 2) + spacing + (padding * 2);

  // 배경색
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2x2 위치 계산
  const positions = [
    { x: padding, y: padding }, // 왼쪽 위
    { x: padding + photoSize + spacing, y: padding }, // 오른쪽 위
    { x: padding, y: padding + photoSize + spacing }, // 왼쪽 아래
    { x: padding + photoSize + spacing, y: padding + photoSize + spacing } // 오른쪽 아래
  ];

  // 각 사진 배치
  for (let i = 0; i < photos.length; i++) {
    try {
      let processedPhoto = photos[i];

      // 프레임 적용
      if (frameUrl) {
        processedPhoto = await applyFrame(photos[i], frameUrl);
      }

      const img = await loadImage(processedPhoto);
      const pos = positions[i];

      ctx.drawImage(img, pos.x, pos.y, photoSize, photoSize);

    } catch (error) {
      console.error(`사진 ${i + 1} 처리 중 오류:`, error);

      // 플레이스홀더
      const pos = positions[i];
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(pos.x, pos.y, photoSize, photoSize);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9);
};

/**
 * 이미지 로드 헬퍼 함수
 * @param {string} src - 이미지 소스 URL
 * @returns {Promise<HTMLImageElement>} - 로드된 이미지 엘리먼트
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = src;
  });
};

/**
 * 이미지 다운로드 함수
 * @param {string} dataUrl - 다운로드할 이미지 Data URL
 * @param {string} filename - 파일명 (확장자 포함)
 */
export const downloadImage = (dataUrl, filename) => {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename || `photobooth_${Date.now()}.png`;

    // 임시로 DOM에 추가
    document.body.appendChild(link);
    link.click();

    // DOM에서 제거
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('다운로드 실패:', error);
    return false;
  }
};

/**
 * 현재 날짜시간으로 파일명 생성
 * @param {string} prefix - 파일명 접두사
 * @param {string} extension - 파일 확장자
 * @returns {string} - 생성된 파일명
 */
export const generateFilename = (prefix = 'photobooth', extension = 'png') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
};

/**
 * 이미지 크기 조정 함수
 * @param {string} dataUrl - 원본 이미지 Data URL
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 품질 (0.0 ~ 1.0)
 * @returns {Promise<string>} - 리사이즈된 이미지 Data URL
 */
export const resizeImage = (dataUrl, maxWidth, maxHeight, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 비율을 유지하면서 크기 계산
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 고품질 스케일링
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png', quality));
    };

    img.onerror = () => {
      reject(new Error('이미지 리사이즈 실패'));
    };

    img.src = dataUrl;
  });
};

/**
 * 이미지에 텍스트 추가하는 함수
 * @param {string} imageDataUrl - 원본 이미지 Data URL
 * @param {string} text - 추가할 텍스트
 * @param {Object} options - 텍스트 옵션
 * @returns {Promise<string>} - 텍스트가 추가된 이미지 Data URL
 */
export const addTextToImage = (imageDataUrl, text, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      x = 50,
      y = 50,
      fontSize = 24,
      fontFamily = 'Arial',
      color = '#ffffff',
      backgroundColor = 'rgba(0,0,0,0.5)',
      padding = 10,
      position = 'top-left' // top-left, top-right, bottom-left, bottom-right, center
    } = options;

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0);

      // 텍스트 설정
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // 텍스트 크기 측정
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // 위치 계산
      let textX = x;
      let textY = y;

      switch (position) {
        case 'top-right':
          textX = canvas.width - textWidth - padding;
          textY = padding;
          break;
        case 'bottom-left':
          textX = padding;
          textY = canvas.height - textHeight - padding;
          break;
        case 'bottom-right':
          textX = canvas.width - textWidth - padding;
          textY = canvas.height - textHeight - padding;
          break;
        case 'center':
          textX = (canvas.width - textWidth) / 2;
          textY = (canvas.height - textHeight) / 2;
          break;
        default: // top-left
          textX = padding;
          textY = padding;
      }

      // 배경 그리기 (선택사항)
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(
          textX - padding,
          textY - padding,
          textWidth + (padding * 2),
          textHeight + (padding * 2)
        );
      }

      // 텍스트 그리기
      ctx.fillStyle = color;
      ctx.fillText(text, textX, textY);

      resolve(canvas.toDataURL('image/png', IMAGE_CONFIG.quality));
    };

    img.onerror = () => {
      reject(new Error('이미지 로드 실패'));
    };

    img.src = imageDataUrl;
  });
};

/**
 * 이미지 품질 검사 함수
 * @param {string} dataUrl - 검사할 이미지 Data URL
 * @returns {Object} - 이미지 정보 객체
 */
export const analyzeImage = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 기본 정보
      const info = {
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2),
        dataSize: dataUrl.length,
        estimatedFileSize: Math.round(dataUrl.length * 0.75 / 1024) + 'KB'
      };

      // 밝기 분석
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
      }
      info.averageBrightness = Math.round(totalBrightness / (data.length / 4));

      resolve(info);
    };

    img.onerror = () => {
      reject(new Error('이미지 분석 실패'));
    };

    img.src = dataUrl;
  });
};

/**
 * 표준 해상도로 이미지 정규화
 * @param {string} imageDataUrl - 원본 이미지 Data URL
 * @returns {Promise<string>} - 정규화된 이미지 Data URL
 */
export const normalizeResolution = (imageDataUrl) => {
  const { width, height, quality, format } = OUTPUT_RESOLUTION;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      // 고품질 리샘플링 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 4:3 비율 유지하며 크롭
      const sourceRatio = img.width / img.height;
      const targetRatio = width / height;

      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (sourceRatio > targetRatio) {
        // 좌우 크롭 (원본이 더 넓은 경우)
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        // 상하 크롭 (원본이 더 높은 경우)
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      // 크롭된 영역을 표준 해상도로 그리기
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

      // 포맷에 따라 Data URL 생성
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      resolve(canvas.toDataURL(mimeType, quality));
    };

    img.onerror = () => {
      reject(new Error('이미지 정규화 실패'));
    };

    img.src = imageDataUrl;
  });
};
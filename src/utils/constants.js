// 포토부스 앱 상수 정의

// 카메라 설정 (동적 해상도 감지를 위한 기본값)
export const CAMERA_CONSTRAINTS = {
  video: {
    // 해상도는 동적으로 감지하도록 하고, 여기서는 기본값만 설정
    // Camera 컴포넌트에서 getUserMedia 전에 getSupportedConstraints로 최적 해상도 선택
    facingMode: "user", // 전면 카메라
    frameRate: { ideal: 30, min: 24 }
  },
  audio: false
};

// 선호 해상도 목록 (4:3 비율, 높은 순서대로)
export const PREFERRED_RESOLUTIONS = [
  { width: 1920, height: 1440, label: 'Full HD+ (1920x1440)' },
  { width: 1600, height: 1200, label: 'UXGA (1600x1200)' },
  { width: 1280, height: 960, label: 'HD+ (1280x960)' },
  { width: 1024, height: 768, label: 'XGA (1024x768)' },
  { width: 800, height: 600, label: 'SVGA (800x600)' },
  { width: 640, height: 480, label: 'VGA (640x480)' }
];

// 프레임 목록 (5개)
export const FRAMES = [
  {
    id: 'frame-01',
    name: '기본 프레임',
    src: '/frames/frame-01.svg'
  },
  {
    id: 'frame-02',
    name: '하트 프레임',
    src: '/frames/frame-02.svg'
  },
  {
    id: 'frame-03',
    name: '별 프레임',
    src: '/frames/frame-03.svg'
  },
  {
    id: 'frame-04',
    name: '꽃 프레임',
    src: '/frames/frame-04.svg'
  },
  {
    id: 'frame-05',
    name: '빈티지 프레임',
    src: '/frames/frame-05.svg'
  }
];

// 스티커 목록
export const STICKERS = [
  {
    id: 'heart',
    name: '하트',
    src: '/stickers/heart.png'
  },
  {
    id: 'star',
    name: '별',
    src: '/stickers/star.png'
  },
  {
    id: 'smile',
    name: '웃는 얼굴',
    src: '/stickers/smile.png'
  },
  {
    id: 'crown',
    name: '왕관',
    src: '/stickers/crown.png'
  },
  {
    id: 'sunglasses',
    name: '선글라스',
    src: '/stickers/sunglasses.png'
  },
  {
    id: 'flower',
    name: '꽃',
    src: '/stickers/flower.png'
  }
];

// 필터 목록
export const FILTERS = [
  {
    id: 'none',
    name: '원본',
    css: null
  },
  {
    id: 'grayscale',
    name: '흑백',
    css: 'grayscale(100%)'
  },
  {
    id: 'sepia',
    name: '세피아',
    css: 'sepia(100%)'
  },
  {
    id: 'vintage',
    name: '빈티지',
    css: 'sepia(50%) contrast(120%) brightness(110%)'
  },
  {
    id: 'bright',
    name: '밝게',
    css: 'brightness(130%)'
  },
  {
    id: 'dark',
    name: '어둡게',
    css: 'brightness(70%)'
  }
];

// 이미지 설정
export const IMAGE_CONFIG = {
  width: 1920,
  height: 1440,
  quality: 0.95,
  format: 'png'
};

// 출력 해상도 표준화 (4-5MB 목표)
export const OUTPUT_RESOLUTION = {
  width: 1600,
  height: 1200,
  quality: 0.95,
  format: 'png'
};

// 에러 메시지
export const ERROR_MESSAGES = {
  CAMERA_NOT_FOUND: '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.',
  CAMERA_PERMISSION_DENIED: '카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.',
  CAMERA_IN_USE: '다른 앱에서 카메라를 사용 중입니다. 다른 앱을 종료한 후 다시 시도해주세요.',
  UNSUPPORTED_BROWSER: '이 브라우저는 카메라 기능을 지원하지 않습니다. Chrome, Firefox, Safari, Edge 등의 최신 브라우저를 사용해주세요.',
  CAPTURE_FAILED: '사진 촬영에 실패했습니다. 다시 시도해주세요.',
  DOWNLOAD_FAILED: '이미지 다운로드에 실패했습니다. 다시 시도해주세요.',
  PROCESSING_FAILED: '이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
  PHOTO_CAPTURED: '사진이 성공적으로 촬영되었습니다!',
  DOWNLOAD_COMPLETED: '이미지가 다운로드되었습니다!',
  SETTINGS_SAVED: '설정이 저장되었습니다!'
};
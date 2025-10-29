export const ko = {
  // 공통
  common: {
    close: '닫기',
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    download: '다운로드',
    delete: '삭제',
    edit: '수정',
    loading: '로딩 중...',
  },

  // 네비게이션
  nav: {
    home: '홈',
    booth: '포토부스',
    find: '사진 찾기',
  },

  // 홈페이지
  home: {
    title: 'CHUPBOX',
    subtitle: '추억을 담는 포토부스',
    startBooth: '포토부스 시작',
    findPhoto: '내 사진 찾기',
    features: {
      instant: '즉석 촬영',
      instantDesc: '4컷 사진을 즉시 촬영하고 저장하세요',
      livePhoto: '라이브 포토',
      livePhotoDesc: '촬영 전 준비하는 모습을 영상으로',
      frames: '다양한 프레임',
      framesDesc: '취향에 맞는 프레임을 선택하세요',
    },
  },

  // 포토부스
  booth: {
    title: '포토부스',
    layout: '레이아웃',
    layoutVertical: '1×4 (세로)',
    layoutSquare: '2×2 (정사각)',
    waitTime: '대기시간',
    seconds: '초',
    frame: '프레임',
    frameNone: '없음',
    selectFrame: '프레임 선택',

    // 촬영 모드
    autoCapture: '⏱️ 자동 촬영 + 🎥 동영상',
    cancelAuto: '❌ 자동 촬영 취소',
    retake: '🔄 다시 촬영',

    // 상태 메시지
    autoStarting: '자동 촬영 시작! {seconds}초 후 첫 번째 사진이 촬영됩니다',
    photoComplete: '{current}/4 촬영 완료! {seconds}초 후 다음 촬영',
    allComplete: '4컷 촬영 완료! 이미지 합성 중...',
    reviewing: '{number}번째 사진 확인 중 - 다시 찍기 또는 촬영 버튼으로 다음 단계',

    // 카운트다운
    countdown: '{seconds}초 후 촬영',
    getReady: '준비하세요!',
    smile: '찰칵!',

    // 버튼
    capture: '촬영',
    nextPhoto: '다음 사진',
    retakePhoto: '다시 찍기',

    // 힌트 메시지
    hintPressAuto: '* 자동 촬영 버튼을 눌러주세요',
    hintPressCapture: '* 촬영 버튼을 눌러 {number}번째 사진을 촬영하세요',
    progressComplete: '{current}/4 완료',
    cameraStatus: '카메라 켜짐 (전면)',
    progressTitle: '진행 상황',
    photoTitle: '촬영',

    // 사용 가이드
    guideTitle: '📖 사용 방법',
    guideStep1Title: '1. 카메라 켜기',
    guideStep1Desc: '초록색 버튼을 눌러 카메라를 켜고 촬영 준비를 하세요',
    guideStep2Title: '2. 프레임 선택',
    guideStep2Desc: '오른쪽에서 마음에 드는 프레임을 선택하세요',
    guideStep3Title: '3. 촬영 & 다운로드',
    guideStep3Desc: '중앙 버튼으로 촬영하고 결과를 다운로드하세요',

    // 카메라
    cameraOn: '카메라 켜짐',
    cameraFront: '전면',
    cameraRear: '후면',
    cameraSwitchDisabled: '자동 촬영 중에는 카메라 전환 불가',
    switchCamera: '카메라 전환',

    // 결과
    result: {
      title: '촬영 완료!',
      code: '사진 코드',
      codeDesc: '이 코드로 나중에 사진을 찾을 수 있어요',
      copyCode: '코드 복사',
      codeCopied: '코드가 복사되었습니다',
      viewLivePhoto: '📹 라이브 포토 보기',
      downloadPhoto: '💾 사진 다운로드',
      downloadSuccess: '사진이 다운로드되었습니다!',
      printPhoto: '🖨️ 사진 인쇄',
      sharePhoto: '📤 사진 공유',
      newPhoto: '🎬 새로운 사진 촬영',
    },
  },

  // 라이브 포토
  livePhoto: {
    title: '라이브 포토',
    loading: '라이브 포토를 불러오는 중...',
    notFound: '라이브 포토가 없습니다',
    countdown: '🎬 라이브 포토가 곧 재생됩니다',
    description: '🎥 촬영 전 준비하는 모습을 담은 라이브 포토',
    tapToPlay: '💡 비디오를 탭하면 재생/일시정지됩니다',
    moment: '{number}번째 순간',

    // 저장
    save: '📥 라이브 포토 저장하기',
    saving: '🎥 비디오 생성 중...',
    savingDesc: '잠시만 기다려주세요',

    // 저장 완료 메시지
    savedIOS: '✅ 라이브 포토가 저장되었습니다!\n\n📱 Safari 다운로드 버튼을 눌러\n파일 앱에서 확인하세요.\n\n💡 갤러리에 저장하려면:\n1. 파일 앱 > 다운로드 폴더\n2. 영상을 길게 눌러 공유\n3. "비디오 저장" 선택',
    savedAndroid: '✅ 라이브 포토가 저장되었습니다!\n\n📱 다운로드 폴더에서 확인하세요.\n\n💡 일부 브라우저는 파일 앱이나\n갤러리 앱에서 확인 가능합니다.',
    savedPC: '✅ 다운로드 완료!\n\n💻 다운로드 폴더를 확인하세요.',

    // 에러 메시지
    errorUnsupported: '이 기기는 비디오 녹화를 지원하지 않습니다.\n\n대신 스크린샷을 촬영해주세요.',
    errorBrowser: '이 브라우저는 비디오 녹화를 지원하지 않습니다.\n\n최신 Chrome 또는 Safari를 사용해주세요.',
  },

  // 사진 찾기
  find: {
    title: '내 사진 찾기',
    inputCode: '사진 코드 입력',
    codePlaceholder: '6자리 코드를 입력하세요',
    search: '🔍 사진 찾기',
    searching: '사진을 찾는 중...',
    found: '사진을 찾았습니다!',
    notFound: '사진을 찾을 수 없습니다',
    notFoundDesc: '코드를 다시 확인해주세요',
    invalidCode: '올바른 코드 형식이 아닙니다',
  },

  // 에러 메시지
  error: {
    cameraPermission: '카메라 권한이 거부되었습니다',
    cameraNotFound: '카메라를 찾을 수 없습니다',
    cameraInUse: '카메라가 다른 앱에서 사용 중입니다',
    unsupportedBrowser: '지원하지 않는 브라우저입니다',
    captureFailed: '사진 촬영에 실패했습니다',
    uploadFailed: '업로드에 실패했습니다',
    networkError: '네트워크 오류가 발생했습니다',
  },

  // 알림
  notification: {
    copied: '복사되었습니다',
    saved: '저장되었습니다',
    deleted: '삭제되었습니다',
    error: '오류가 발생했습니다',
  },
};

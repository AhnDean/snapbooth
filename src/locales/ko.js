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
    selectFrame: '🖼️ 프레임 선택',
    frameRemoved: '프레임이 제거되었습니다',
    frameSelected: '{name} 프레임이 선택되었습니다',

    // 촬영 모드
    autoCapture: '⏱️ 자동 촬영 + 🎥 동영상',
    cancelAuto: '❌ 자동 촬영 취소',
    retake: '다시 촬영',

    // 상태 메시지
    autoStarting: '자동 촬영 시작! {seconds}초 후 첫 번째 사진이 촬영됩니다',
    photoComplete: '{current}/4 촬영 완료! {seconds}초 후 다음 촬영',
    allComplete: '4컷 촬영 완료! 이미지 합성 중...',
    reviewing: '사진이 촬영되었습니다. 다시 찍기를 원하면 버튼을 누르세요.',
    manualNext: '{current}/4 촬영 완료! 촬영 버튼을 눌러 다음 사진을 촬영하세요',
    retaking: '다시 촬영합니다. {seconds}초 후 촬영',
    retakeManual: '촬영 버튼을 눌러 다시 촬영하세요',
    autoCancelled: '자동 촬영이 취소되었습니다',
    fourCutComplete: '4컷 촬영 완료! 이미지 합성 중...',
    alreadyComplete: '이미 4컷 촬영이 완료되었습니다!',

    // Web Share
    shareTitle: 'CHUPBOX 포토부스',
    shareText: '추억의 순간을 담았어요! 📸',
    shareComplete: '공유 완료!',
    downloadGuide: '💡 다운로드 폴더에서 사진을 길게 눌러 "이미지로 저장"을 선택하면 갤러리에 저장됩니다',

    // 업로드
    uploadSaving: '클라우드에 저장 중...',
    uploadSuccess: '✅ 저장 완료! QR 코드로 사진을 찾을 수 있습니다',
    uploadFailed: '⚠️ 저장 실패: {error}',
    uploadUnknownError: '알 수 없는 오류',
    videoUploading: '동영상 업로드 중... ({count}개)',
    videoUploadComplete: '사진과 라이브 포토가 모두 저장되었습니다!',
    videoUploadFailed: '라이브 포토 업로드 실패 (사진은 저장됨)',
    videoSaveFailed: '라이브 포토 저장 실패',

    // 인쇄
    print: '사진 인쇄',
    printDialogCheck: '인쇄 대화상자를 확인하세요',
    printFailed: '인쇄에 실패했습니다',
    printPopupBlocked: '팝업이 차단되었습니다. 팝업을 허용해주세요.',

    // 저장
    save: '갤러리에 저장',

    // 카운트다운
    countdown: '{seconds}초 후 촬영',
    getReady: '준비 중...',
    recording: '🎥 동영상 녹화중',

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
    completed: '완성',

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

    // QR 코드
    qrPhoto: '📸 사진 보기',
    qrPhotoDesc: '사진 다운로드',
    qrLivePhoto: '🎥 라이브 포토',
    qrLivePhotoDesc: '동영상 재생',
    livePhotoMoments: '🎬 라이브 포토 ({count}개 순간)',
    livePhotoView: '🎥 라이브 포토 보기',
    livePhotoDesc: '촬영 전 준비하는 모습을 담은 라이브 포토',
    noPhotoCode: '사진 코드가 없습니다. 사진을 먼저 저장해주세요.',

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
    title: '🔍 내 사진 찾기',
    subtitle: '6자리 코드를 입력하여 촬영한 사진 찾기',
    inputCode: '사진 코드 입력',
    codePlaceholder: '예: A3K9B2',
    search: '🔍 검색',
    searching: '⏳ 찾는 중...',
    found: '사진을 찾았습니다!',
    notFound: '사진을 찾을 수 없습니다',
    notFoundDesc: '코드를 다시 확인해주세요',
    invalidCode: '6자리 코드를 입력해주세요',
    error: '오류',
    capturedDate: '촬영일: {date}',
    photoCode: '사진 코드',
    size: '크기',
    fileSize: '용량',
    downloadCount: '다운로드',
    livePhotoView: '🎥 라이브 포토 보기',
    downloadPhoto: '📥 사진 다운로드',
    expiresOn: '💡 사진 보관 기간: {date} (30일)',
    howToFindTitle: '❓ 사진 코드는 어떻게 찾나요?',
    howToFindStep1: '사진 촬영 후 6자리 코드를 받습니다',
    howToFindStep2: '코드를 메모하거나 스크린샷으로 저장하세요',
    howToFindStep3: '이 페이지에서 코드를 입력하면 사진을 다운로드할 수 있습니다',
    booth: '📸 사진 찍기',
    home: '홈',
    findYourPhoto: 'Tìm ảnh của bạn',
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

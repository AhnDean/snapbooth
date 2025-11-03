export const vi = {
  // Chung
  common: {
    close: 'Đóng',
    confirm: 'Xác nhận',
    cancel: 'Hủy bỏ',
    save: 'Lưu',
    download: 'Tải xuống',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    loading: 'Đang tải...',
  },

  // Điều hướng
  nav: {
    home: 'Trang chủ',
    booth: 'Phòng chụp',
    find: 'Tìm ảnh',
  },

  // Trang chủ
  home: {
    title: 'CHUPBOX',
    subtitle: 'Phòng chụp ảnh lưu giữ kỷ niệm',
    startBooth: 'Bắt đầu chụp',
    findPhoto: 'Tìm ảnh của tôi',
    features: {
      instant: 'Chụp ngay',
      instantDesc: 'Chụp 4 ảnh liên tiếp và lưu ngay lập tức',
      livePhoto: 'Live Photo',
      livePhotoDesc: 'Video ghi lại khoảnh khắc chuẩn bị trước khi chụp',
      frames: 'Nhiều khung hình',
      framesDesc: 'Chọn khung hình theo sở thích của bạn',
    },
  },

  // Phòng chụp
  booth: {
    title: 'Phòng chụp',
    layout: 'Bố cục',
    layoutVertical: '1×4 (Dọc)',
    layoutSquare: '2×2 (Vuông)',
    waitTime: 'Thời gian chờ',
    seconds: 'giây',
    frame: 'Khung hình',
    frameNone: 'Không có',
    selectFrame: '🖼️ Chọn khung hình',
    frameRemoved: 'Đã bỏ khung hình',
    frameSelected: 'Đã chọn khung hình {name}',

    // Chế độ chụp
    autoCapture: '⏱️ Tự động chụp + 🎥 Video',
    cancelAuto: '❌ Hủy chụp tự động',
    retake: 'Chụp lại',

    // Thông báo trạng thái
    autoStarting: 'Bắt đầu chụp tự động! Ảnh đầu tiên sẽ được chụp sau {seconds} giây',
    photoComplete: '{current}/4 hoàn thành! Chụp tiếp sau {seconds} giây',
    allComplete: 'Hoàn thành 4 ảnh! Đang ghép ảnh...',
    reviewing: 'Đã chụp ảnh. Nhấn nút để chụp lại nếu cần.',
    manualNext: '{current}/4 hoàn thành! Nhấn nút chụp để chụp ảnh tiếp theo',
    retaking: 'Chụp lại. Sẽ chụp sau {seconds} giây',
    retakeManual: 'Nhấn nút chụp để chụp lại',
    autoCancelled: 'Đã hủy chụp tự động',
    fourCutComplete: 'Hoàn thành 4 ảnh! Đang ghép ảnh...',
    alreadyComplete: 'Đã hoàn thành 4 ảnh!',

    // Web Share
    shareTitle: 'CHUPBOX Phòng chụp',
    shareText: 'Lưu giữ khoảnh khắc đáng nhớ! 📸',
    shareComplete: 'Đã chia sẻ!',
    downloadGuide: '💡 Giữ ảnh trong thư mục tải xuống và chọn "Lưu ảnh" để lưu vào thư viện',

    // Tải lên
    uploadSaving: 'Đang lưu vào cloud...',
    uploadSuccess: '✅ Lưu thành công! Dùng mã QR để tìm ảnh',
    uploadFailed: '⚠️ Lưu thất bại: {error}',
    uploadUnknownError: 'Lỗi không xác định',
    videoUploading: 'Đang tải video lên... ({count} video)',
    videoUploadComplete: 'Đã lưu ảnh và Live Photo!',
    videoUploadFailed: 'Tải Live Photo thất bại (ảnh đã được lưu)',
    videoSaveFailed: 'Lưu Live Photo thất bại',

    // In ảnh
    print: 'In ảnh',
    printDialogCheck: 'Vui lòng kiểm tra hộp thoại in',
    printFailed: 'In thất bại',
    printPopupBlocked: 'Popup bị chặn. Vui lòng cho phép popup.',

    // Lưu
    save: 'Lưu vào thư viện',

    // Đếm ngược
    countdown: 'Chụp sau {seconds} giây',
    getReady: 'Đang chuẩn bị...',
    recording: '🎥 Đang quay video',

    // Nút bấm
    capture: 'Chụp',
    nextPhoto: 'Ảnh tiếp theo',
    retakePhoto: 'Chụp lại',

    // Thông báo gợi ý
    hintPressAuto: '* Vui lòng nhấn nút chụp tự động',
    hintPressCapture: '* Nhấn nút chụp để chụp ảnh thứ {number}',
    progressComplete: '{current}/4 hoàn thành',
    cameraStatus: 'Camera đang bật (Trước)',
    progressTitle: 'Tiến trình',
    photoTitle: 'Chụp ảnh',
    completed: 'Hoàn thành',

    // Hướng dẫn sử dụng
    guideTitle: '📖 Hướng dẫn sử dụng',
    guideStep1Title: '1. Bật camera',
    guideStep1Desc: 'Nhấn nút xanh lá để bật camera và chuẩn bị chụp',
    guideStep2Title: '2. Chọn khung hình',
    guideStep2Desc: 'Chọn khung hình bạn thích ở bên phải',
    guideStep3Title: '3. Chụp & Tải xuống',
    guideStep3Desc: 'Chụp ảnh bằng nút giữa và tải kết quả xuống',

    // Camera
    cameraOn: 'Camera đang bật',
    cameraFront: 'Trước',
    cameraRear: 'Sau',
    cameraSwitchDisabled: 'Không thể chuyển camera khi đang chụp tự động',
    switchCamera: 'Chuyển camera',

    // Mã QR
    qrPhoto: '📸 Xem ảnh',
    qrPhotoDesc: 'Tải ảnh xuống',
    qrLivePhoto: '🎥 Live Photo',
    qrLivePhotoDesc: 'Phát video',
    livePhotoMoments: '🎬 Live Photo ({count} khoảnh khắc)',
    livePhotoView: '🎥 Xem Live Photo',
    livePhotoDesc: 'Live Photo ghi lại khoảnh khắc chuẩn bị trước khi chụp',
    noPhotoCode: 'Không có mã ảnh. Vui lòng lưu ảnh trước.',

    // Kết quả
    result: {
      title: 'Chụp xong!',
      code: 'Mã ảnh',
      codeDesc: 'Bạn có thể dùng mã này để tìm ảnh sau',
      copyCode: 'Sao chép mã',
      codeCopied: 'Đã sao chép mã',
      viewLivePhoto: '📹 Xem Live Photo',
      downloadPhoto: '💾 Tải ảnh xuống',
      downloadSuccess: 'Đã tải ảnh xuống!',
      printPhoto: '🖨️ In ảnh',
      sharePhoto: '📤 Chia sẻ ảnh',
      newPhoto: '🎬 Chụp ảnh mới',
    },
  },

  // Live Photo
  livePhoto: {
    title: 'Live Photo',
    loading: 'Đang tải Live Photo...',
    notFound: 'Không tìm thấy Live Photo',
    countdown: '🎬 Live Photo sẽ phát ngay',
    description: '🎥 Live Photo ghi lại khoảnh khắc chuẩn bị trước khi chụp',
    tapToPlay: '💡 Nhấn vào video để phát/tạm dừng',
    moment: 'Khoảnh khắc thứ {number}',

    // Lưu
    save: '📥 Lưu Live Photo',
    saving: '🎥 Đang tạo video...',
    savingDesc: 'Vui lòng chờ trong giây lát',

    // Thông báo lưu thành công
    savedIOS: '✅ Đã lưu Live Photo!\\n\\n📱 Nhấn nút tải xuống Safari\\nvà kiểm tra trong ứng dụng Files.\\n\\n💡 Để lưu vào thư viện ảnh:\\n1. Files > Thư mục Downloads\\n2. Giữ video và chia sẻ\\n3. Chọn "Lưu video"',
    savedAndroid: '✅ Đã lưu Live Photo!\\n\\n📱 Kiểm tra trong thư mục Downloads.\\n\\n💡 Một số trình duyệt có thể\\nxem trong Files hoặc Gallery.',
    savedPC: '✅ Tải xuống hoàn tất!\\n\\n💻 Kiểm tra thư mục Downloads.',

    // Thông báo lỗi
    errorUnsupported: 'Thiết bị này không hỗ trợ quay video.\\n\\nVui lòng chụp màn hình thay thế.',
    errorBrowser: 'Trình duyệt này không hỗ trợ quay video.\\n\\nVui lòng sử dụng Chrome hoặc Safari mới nhất.',
  },

  // Tìm ảnh
  find: {
    title: '🔍 Tìm ảnh của bạn',
    subtitle: 'Nhập mã 6 ký tự để tìm ảnh đã chụp',
    inputCode: 'Nhập mã ảnh',
    codePlaceholder: 'VD: A3K9B2',
    search: '🔍 Tìm kiếm',
    searching: '⏳ Đang tìm...',
    found: 'Tìm thấy ảnh!',
    notFound: 'Không tìm thấy ảnh',
    notFoundDesc: 'Vui lòng kiểm tra lại mã',
    invalidCode: 'Vui lòng nhập mã 6 ký tự',
    error: 'Lỗi',
    capturedDate: 'Chụp ngày: {date}',
    photoCode: 'Mã ảnh',
    size: 'Kích thước',
    fileSize: 'Dung lượng',
    downloadCount: 'Lượt tải',
    livePhotoView: '🎥 Xem Live Photo',
    downloadPhoto: '📥 Tải xuống ảnh',
    expiresOn: '💡 Ảnh sẽ được lưu trữ đến ngày: {date} (30 ngày)',
    howToFindTitle: '❓ Làm sao để tìm mã ảnh?',
    howToFindStep1: 'Sau khi chụp ảnh tại photobooth, bạn sẽ nhận được mã 6 ký tự',
    howToFindStep2: 'Ghi lại mã hoặc chụp màn hình',
    howToFindStep3: 'Quay lại trang này và nhập mã để tải ảnh',
    booth: '📸 Chụp ảnh',
    home: 'Trang chủ',
    findYourPhoto: 'Tìm ảnh của bạn',
  },

  // Thông báo lỗi
  error: {
    cameraPermission: 'Quyền truy cập camera bị từ chối',
    cameraNotFound: 'Không tìm thấy camera',
    cameraInUse: 'Camera đang được sử dụng bởi ứng dụng khác',
    unsupportedBrowser: 'Trình duyệt không được hỗ trợ',
    captureFailed: 'Chụp ảnh thất bại',
    uploadFailed: 'Tải lên thất bại',
    networkError: 'Lỗi mạng',
  },

  // Thông báo
  notification: {
    copied: 'Đã sao chép',
    saved: 'Đã lưu',
    deleted: 'Đã xóa',
    error: 'Đã xảy ra lỗi',
  },
};

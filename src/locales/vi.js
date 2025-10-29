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
    selectFrame: 'Chọn khung hình',

    // Chế độ chụp
    autoCapture: '⏱️ Tự động chụp + 🎥 Video',
    cancelAuto: '❌ Hủy chụp tự động',
    retake: '🔄 Chụp lại',

    // Thông báo trạng thái
    autoStarting: 'Bắt đầu chụp tự động! Ảnh đầu tiên sẽ được chụp sau {seconds} giây',
    photoComplete: '{current}/4 hoàn thành! Chụp tiếp sau {seconds} giây',
    allComplete: 'Hoàn thành 4 ảnh! Đang ghép ảnh...',
    reviewing: 'Đang xem ảnh thứ {number} - Chụp lại hoặc nhấn nút chụp để tiếp tục',

    // Đếm ngược
    countdown: 'Chụp sau {seconds} giây',
    getReady: 'Chuẩn bị!',
    smile: 'Click!',

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
    title: 'Tìm ảnh của tôi',
    inputCode: 'Nhập mã ảnh',
    codePlaceholder: 'Nhập mã 6 ký tự',
    search: '🔍 Tìm ảnh',
    searching: 'Đang tìm ảnh...',
    found: 'Đã tìm thấy ảnh!',
    notFound: 'Không tìm thấy ảnh',
    notFoundDesc: 'Vui lòng kiểm tra lại mã',
    invalidCode: 'Định dạng mã không đúng',
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

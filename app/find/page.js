'use client';

import { useState } from 'react';
import Link from 'next/link';
import { findPhotoByCode } from '../../src/utils/photoUpload';
import { downloadImage } from '../../src/utils/imageProcessing';

export default function FindPhotoPage() {
  const [code, setCode] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError('6자리 코드를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setPhoto(null);

    const result = await findPhotoByCode(code);

    if (result.success) {
      setPhoto(result.photo);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!photo) return;

    const filename = `chupbox_${photo.code}_${Date.now()}.png`;
    downloadImage(photo.file_url, filename);
  };

  return (
    <div className="min-h-screen bg-[#fef5e7]">
      {/* 헤더 */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                <span style={{ color: '#ee5253' }}>CHUP</span>
                <span style={{ color: '#f7d945' }}>BOX</span>
              </h1>
              <p className="text-sm text-gray-500 ml-2">Tìm ảnh của bạn</p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/booth"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                📸 Chụp ảnh
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-2">
            🔍 Tìm ảnh của bạn
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Nhập mã 6 ký tự để tìm ảnh đã chụp
          </p>

          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: A3K9B2"
                maxLength={6}
                className="flex-1 px-6 py-4 text-2xl text-center font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  loading || code.length !== 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">❌</span>
                <div>
                  <p className="font-semibold text-red-800">Lỗi</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 사진 결과 */}
          {photo && (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">Tìm thấy ảnh!</p>
                    <p className="text-green-600 text-sm">
                      Chụp ngày: {new Date(photo.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 사진 표시 */}
              <div className="relative">
                <img
                  src={photo.file_url}
                  alt={`Photo ${photo.code}`}
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>

              {/* 사진 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Mã ảnh</p>
                  <p className="text-lg font-bold font-mono">{photo.code}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Kích thước</p>
                  <p className="text-lg font-bold">{photo.width} × {photo.height}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Dung lượng</p>
                  <p className="text-lg font-bold">{(photo.file_size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Lượt tải</p>
                  <p className="text-lg font-bold">{photo.download_count + 1}</p>
                </div>
              </div>

              {/* 다운로드 버튼 */}
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                📥 Tải xuống ảnh
              </button>

              {/* 만료 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800">
                  💡 Ảnh sẽ được lưu trữ đến ngày:{' '}
                  <strong>{new Date(photo.expires_at).toLocaleDateString('vi-VN')}</strong>
                  {' '}(30 ngày)
                </p>
              </div>
            </div>
          )}

          {/* 도움말 */}
          {!photo && !error && (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-bold mb-4">❓ Làm sao để tìm mã ảnh?</h3>
              <div className="text-left max-w-2xl mx-auto space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <p className="text-gray-700">
                    Sau khi chụp ảnh tại photobooth, bạn sẽ nhận được <strong>mã 6 ký tự</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <p className="text-gray-700">
                    Ghi lại mã hoặc chụp màn hình
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <p className="text-gray-700">
                    Quay lại trang này và nhập mã để tải ảnh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

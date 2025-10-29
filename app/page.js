'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('home.subtitle')}
          </p>
        </div>

        {/* 메인 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/booth">
            <button className="w-full sm:w-64 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              {t('home.startBooth')}
            </button>
          </Link>
          <Link href="/find">
            <button className="w-full sm:w-64 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200">
              {t('home.findPhoto')}
            </button>
          </Link>
        </div>

        {/* 기능 소개 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {t('home.features.instant')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.instantDesc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {t('home.features.livePhoto')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.livePhotoDesc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {t('home.features.frames')}
            </h3>
            <p className="text-gray-600">
              {t('home.features.framesDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

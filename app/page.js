'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function Home() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* 언어 선택 드롭다운 - 우측 상단 고정 */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
          >
            <span className="text-2xl">{language === 'ko' ? '🇰🇷' : '🇻🇳'}</span>
            <span className="font-medium text-gray-700">
              {language === 'ko' ? '한국어' : 'Tiếng Việt'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => {
                  changeLanguage('ko');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                  language === 'ko' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-2xl">🇰🇷</span>
                <span className="font-medium">한국어</span>
                {language === 'ko' && (
                  <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  changeLanguage('vi');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                  language === 'vi' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-2xl">🇻🇳</span>
                <span className="font-medium">Tiếng Việt</span>
                {language === 'vi' && (
                  <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

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

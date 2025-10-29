'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ko } from '@/locales/ko';
import { vi } from '@/locales/vi';

const translations = {
  ko,
  vi,
};

/**
 * useTranslation hook
 * 현재 언어에 맞는 번역 문자열을 가져오는 훅
 *
 * 사용 예시:
 * const { t } = useTranslation();
 * t('common.close') // '닫기' 또는 'Đóng'
 * t('booth.autoStarting', { seconds: 5 }) // '자동 촬영 시작! 5초 후...'
 */
export function useTranslation() {
  const { language } = useLanguage();

  /**
   * 번역 키를 현재 언어의 문자열로 변환
   * @param {string} key - 번역 키 (예: 'common.close', 'booth.autoCapture')
   * @param {object} params - 문자열 보간을 위한 파라미터 (예: { seconds: 5 })
   * @returns {string} 번역된 문자열
   */
  const t = (key, params = {}) => {
    // 현재 언어의 번역 객체 가져오기
    const translation = translations[language] || translations.ko;

    // 키를 점(.)으로 분리하여 중첩된 객체 탐색
    const keys = key.split('.');
    let value = translation;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // 키를 찾을 수 없으면 키 자체를 반환
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // 값이 문자열이 아니면 키 반환
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // 파라미터 보간 (예: '{seconds}초' → '5초')
    let result = value;
    Object.keys(params).forEach((param) => {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });

    return result;
  };

  return { t, language };
}

import { supabase } from '../lib/supabase';

/**
 * 사진을 Supabase Storage에 업로드하고 DB에 저장
 * @param {string} imageDataUrl - Base64 이미지 Data URL
 * @returns {Promise<Object>} - { success, code, url, error }
 */
export async function uploadPhotoToCloud(imageDataUrl) {
  try {
    // 1. Base64 Data URL을 Blob으로 변환
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    // 2. 파일 크기 검증 (10MB 제한)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (blob.size > MAX_SIZE) {
      throw new Error('파일 크기는 10MB를 초과할 수 없습니다');
    }

    // 3. 파일 타입 검증
    if (!blob.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다');
    }

    // 4. 안전한 파일명 생성 (타임스탬프 + UUID)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}.jpg`;
    const filePath = `uploads/${fileName}`;

    console.log('📤 업로드 시작:', filePath);

    // 5. Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false // 덮어쓰기 방지
      });

    if (uploadError) {
      console.error('❌ 업로드 실패:', uploadError);
      throw uploadError;
    }

    console.log('✅ 업로드 성공:', uploadData);

    // 6. Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', publicUrl);

    // 7. DB에 메타데이터 저장 (code는 트리거로 자동 생성)
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        file_url: publicUrl,
        file_path: filePath,
        file_size: blob.size,
        width: 1600,
        height: 1200
      })
      .select('code, id')
      .single();

    if (dbError) {
      console.error('❌ DB 저장 실패:', dbError);
      throw dbError;
    }

    console.log('✅ DB 저장 성공:', photoData);

    // 8. 성공 결과 반환
    return {
      success: true,
      code: photoData.code,
      url: publicUrl,
      photoId: photoData.id
    };

  } catch (error) {
    console.error('💥 업로드 오류:', error);
    return {
      success: false,
      error: error.message || '업로드에 실패했습니다'
    };
  }
}

/**
 * 6자리 코드로 사진 찾기
 * @param {string} code - 6자리 코드 (예: A3K9B2)
 * @returns {Promise<Object>} - { success, photo, error }
 */
export async function findPhotoByCode(code) {
  try {
    if (!code || code.length !== 6) {
      throw new Error('올바른 6자리 코드를 입력해주세요');
    }

    // 코드로 사진 검색
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('사진을 찾을 수 없습니다. 코드를 확인해주세요.');
      }
      throw error;
    }

    // 만료 확인
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('이 사진은 만료되었습니다 (30일 경과)');
    }

    // 다운로드 카운트 증가
    await supabase
      .from('photos')
      .update({ download_count: data.download_count + 1 })
      .eq('id', data.id);

    return {
      success: true,
      photo: data
    };

  } catch (error) {
    console.error('🔍 사진 찾기 오류:', error);
    return {
      success: false,
      error: error.message || '사진을 찾을 수 없습니다'
    };
  }
}

/**
 * QR 코드 생성용 URL
 * @param {string} code - 6자리 코드
 * @returns {string} - 사진 찾기 URL
 */
export function getPhotoUrl(code) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/find?code=${code}`;
}

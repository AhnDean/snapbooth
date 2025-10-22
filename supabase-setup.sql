-- CHUPBOX Supabase Database Setup
-- Supabase Dashboard → SQL Editor에서 이 쿼리를 실행하세요

-- 1. 사진 테이블 생성
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER DEFAULT 1600,
  height INTEGER DEFAULT 1200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  download_count INTEGER DEFAULT 0,
  event_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. 인덱스 생성 (검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_photos_code ON photos(code);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);

-- 3. 6자리 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_photo_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 헷갈리는 문자 제외 (I, O, 0, 1)
  result TEXT := '';
  i INTEGER;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- 코드 중복 확인
    IF NOT EXISTS (SELECT 1 FROM photos WHERE code = result) THEN
      RETURN result;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 트리거: 코드 자동 생성
CREATE OR REPLACE FUNCTION set_photo_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_photo_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_photo_code
  BEFORE INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION set_photo_code();

-- 5. Row Level Security (RLS) 활성화
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 모든 사람이 코드로 사진 조회 가능
CREATE POLICY "Anyone can view photos by code"
ON photos FOR SELECT
TO public
USING (true);

-- 7. RLS 정책: 익명 사용자도 사진 삽입 가능 (포토부스 촬영)
CREATE POLICY "Anyone can insert photos"
ON photos FOR INSERT
TO public
WITH CHECK (true);

-- 8. RLS 정책: 만료된 사진만 삭제 가능
CREATE POLICY "Delete expired photos only"
ON photos FOR DELETE
TO public
USING (expires_at < NOW());

-- 9. 만료된 사진 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_expired_photos()
RETURNS void AS $$
BEGIN
  DELETE FROM photos WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 10. 통계 조회 함수 (선택사항)
CREATE OR REPLACE FUNCTION get_photo_stats()
RETURNS TABLE(
  total_photos BIGINT,
  total_downloads BIGINT,
  photos_today BIGINT,
  average_file_size NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_photos,
    SUM(download_count)::BIGINT as total_downloads,
    COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::BIGINT as photos_today,
    ROUND(AVG(file_size)::NUMERIC, 2) as average_file_size
  FROM photos;
END;
$$ LANGUAGE plpgsql;

-- 완료!
-- 다음 단계: Supabase Dashboard → Storage에서 'photos' 버킷 생성

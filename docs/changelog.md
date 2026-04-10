# 작업 이력 (Changelog)

## 2026-04-10

### 1. cheongan_db.py 생성 — 천간(天干) DB

- **CHEONGAN**: 천간 10개(甲~癸) 기본 성향 DB
  - 한글, 음양, 오행, 상징, 성향, 키워드
- **천간 관계 DB**
  - 오행 상생상극 관계 매핑 (`_get_oheng_relation`)
  - 십성(十星) 산출 (`_get_sipsung`)
  - 천간합(天干合) 5쌍 (`CHEONGAN_HAP`)
  - 천간충(天干沖) 4쌍 (`CHEONGAN_CHUNG`)
  - 십성 해석 (`SIPSUNG_DESC`)
- **해석 엔진**
  - `interpret_ilgan()` — 일간 기본 해석
  - `interpret_relation()` — 일간 vs 타 천간 관계 해석
  - `demo()` — 병화(丙) 일간 예시

### 2. jiji_db.py 생성 — 지지(地支) DB

- **JIJI**: 지지 12개(子~亥) 기본 성향 DB
  - 한글, 음양, 오행, 동물, 시간, 월, 상징, 성향, 키워드, 지장간
- **지지 관계 DB**
  - 육합(六合) 6쌍 (`JIJI_YUKHAP`)
  - 삼합(三合) 4조 (`JIJI_SAMHAP`)
  - 방합(方合) 4조 (`JIJI_BANGHAP`)
  - 충(沖) 6쌍 (`JIJI_CHUNG`)
  - 형(刑) 삼형+자형 (`JIJI_HYUNG`)
  - 파(破) 6쌍 (`JIJI_PA`)
  - 해(害) 6쌍 (`JIJI_HAE`)
- **해석 엔진**
  - `interpret_jiji()` — 지지 기본 해석
  - `interpret_jiji_relation()` — 두 지지 관계 해석
  - `check_samhap()` / `check_jahyung()` — 삼합/자형 확인

### 3. ILGAN_DETAIL 추가 — 천간 일간 심층 해석

- 천간 10개(甲~癸) 각각에 대해 일간 기준 6개 항목 작성:
  1. 특성 총합 및 총평
  2. 표현 / 행동 양식
  3. 사람들과 교류하는 방식
  4. 강점 (5개), 약점 (5개), 개선 방안
  5. 추천 직업과 이유 (5개, 분야/역할/이유)
  6. 종합 요약 (강점 살리기 + 약점 보완하기)
- `interpret_ilgan_detail()` 함수 추가

### 4. 천간 원전(原典) 인용 추가

- **적천수(滴天髓) 천간론** 10간 원문 + 해석 삽입
  - ctext.org, 古诗文网, 太极书馆, Wikisource에서 교차 검증
  - 임철초(任鐵樵) 주석본 「滴天髓闡微」 기준
- 파일 상단에 출처 주석 명시
- `interpret_ilgan_detail()`에 원전 출력 섹션 추가

### 5. ILJI_DETAIL 추가 — 지지 일지 심층 해석

- 지지 12개(子~亥) 각각에 대해 일지 기준 6개 항목 작성:
  1. 특성 총합 및 총평
  2. 표현 / 행동 양식
  3. 사람들과 교류하는 방식
  4. 강점 (5개), 약점 (5개), 개선 방안
  5. 추천 직업과 이유 (5개, 분야/역할/이유)
  6. 종합 요약 (강점 살리기 + 약점 보완하기)
- **원전 인용 포함**:
  - 연해자평(淵海子平) — 지지 상(象) 정의
  - 삼명통회(三命通會) — 논십이지(論十二支) 편
- `interpret_ilji_detail()` 함수 추가

### 6. docs/ 작업 문서 작성

- `docs/db_structure.md` — DB 구조 및 원전 출처 문서
- `docs/changelog.md` — 작업 이력 (본 파일)

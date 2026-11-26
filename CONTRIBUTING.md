# 함께 작업하는 방법

main 에는 직접 올리지 않고, 작업마다 브랜치를 만들어 PR(Pull Request)로 합칩니다.

## 작업 순서

### 1. 시작 전에 main 을 최신으로

```
git checkout main
git pull
```

### 2. 작업용 브랜치 만들기

이름은 `edit/할일` 형식으로 짓습니다.

```
git checkout -b edit/delta-wording
```

### 3. 수정하고 커밋하기

CSS·JS 를 고쳤다면 **커밋 전에 꼭** 아래를 실행합니다.

```
python tools/stamp-assets.py
```

HTML 이 불러오는 CSS·JS 주소 뒤의 `?v=` 값을 새로 매기는 스크립트입니다.
빠뜨리면 다른 사람 브라우저에는 캐시된 예전 CSS·JS 가 그대로 남아 화면이 어긋나 보입니다.

```
git add .
git commit -m "무엇을 왜 바꿨는지 한 줄"
```

### 4. 올리고 PR 열기

```
git push -u origin edit/delta-wording
```

GitHub 저장소에 뜨는 **Compare & pull request** 버튼을 눌러 `main` 으로 PR 을 엽니다.
PR 설명에는 바뀐 화면과 이유를 짧게 적습니다.

### 5. 확인 뒤 합치기

검토가 끝나면 **Merge pull request** 로 합치고, **Delete branch** 로 브랜치를 지웁니다.

## 지켜 주세요

- **PR 하나에 작업 하나.** 이미지 교체와 문구 수정처럼 성격이 다른 일은 PR 을 나눕니다.
- **다시 고칠 때는 같은 브랜치에 커밋을 더합니다.** `-2` 같은 새 브랜치를 만들지 않습니다.
  PR 이 열려 있으면 같은 브랜치에 push 한 내용이 그 PR 에 자동으로 붙습니다.
- **PR 을 연 사이 main 이 바뀌었다면** 브랜치에서 최신 main 을 합친 뒤 push 합니다.

  ```
  git pull origin main
  git push
  ```

  충돌이 나면 혼자 정하기 어려운 부분은 PR 댓글로 물어봐 주세요.
- **main 에 직접 push 하지 않습니다.**
- `_backup/` 폴더와 `archive/` 폴더(얼린 예전 버전)는 고치지 않습니다.

## 예전 버전 보관 (archive)

목록(index)의 v1~v5 화면은 `archive/<버전>/` 에 그때 모습 그대로 얼려 두었습니다(2026-11-24). 공용 JS, CSS 를 고쳐도 예전 버전 화면은 바뀌지 않습니다.

- 구조: `archive/v5/screens/main-v5.html` + 그 화면이 쓰는 파일만 `archive/v5/assets/...` (지금 `screens/`, `assets/` 와 같은 모양)
- 옛 주소(`screens/main-v5.html`)는 안내 파일이 `archive/` 로 넘겨 줍니다(주소 뒤 `?`, `#` 그대로). 예전에 공유한 링크도 계속 열립니다
- 목록 모양은 그대로이고, 예전 버전 링크만 `archive/` 주소를 가리킵니다
- 그대로 둔 것: 스플래시, 로그인, 비밀번호 변경 강제(v1, v2 모두), 모든 화면의 v6, v7

새 버전이 나와 한 버전을 얼릴 때:

1. `node tools/archive-version.mjs v6 main-v6 safety-v6 report-v6 ...` (그 버전 화면 이름을 모두 적음)
2. index.html 의 그 버전 링크를 `./archive/v6/screens/...` 로 바꿈
3. 얼린 화면을 열어 빠진 파일(404)이 없는지 확인. 코드가 이름을 이어 붙여 만드는 파일은 도구가 놓칠 수 있음
4. 커밋하고 `git tag v6` 으로 그 시점에 이름표를 붙임

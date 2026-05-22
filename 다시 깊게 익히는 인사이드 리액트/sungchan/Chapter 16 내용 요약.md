# React 고급 패턴 정리

> Error Boundary · Context API · Suspense · use() API

---

## 1. 에러 바운더리 (Error Boundary)

렌더링 중 발생한 에러를 포착해 **폴백 UI**를 보여주는 특수 컴포넌트.  
현재 훅으로는 구현 불가 → **클래스 컴포넌트** 필수.

### 핵심 생명주기 메서드

| 메서드 | 호출 시점 | 역할 | 부수효과 |
|--------|-----------|------|----------|
| `getDerivedStateFromError(error)` | 렌더 단계 (동기) | 상태 갱신 → 폴백 UI 렌더링 | ❌ 금지 |
| `componentDidCatch(error, info)` | 커밋 단계 | Sentry 등 외부 서비스에 에러 전송 | ✅ 허용 |

### 에러 전파 방식

```
ThrowError (에러 발생)
  └── ComponentC (ErrorBoundary ✅ → 여기서 포착, 전파 중단)
        └── ComponentB (ErrorBoundary — 도달 안 함)
              └── ComponentA (ErrorBoundary — 도달 안 함)
```

DOM 버블링과 유사하게 가장 가까운 에러 바운더리에서 멈춤.

### 에러 바운더리가 감지하지 못하는 케이스

```
❌ 이벤트 핸들러    → 렌더링과 별개의 이벤트 루프에서 실행
❌ 비동기 (fetch)   → 태스크 큐에서 실행, 렌더링 사이클과 분리
❌ setTimeout 콜백  → 브라우저 타이머 API로 독립 실행
✅ useEffect 동기 에러 → 리액트가 컴포넌트 생명주기의 일부로 처리
```

### 이벤트 핸들러 에러를 에러 바운더리로 전달하는 방법

```tsx
const useThrowError = () => {
  const [, setErrorState] = useState<Error | null>(null);
  return (error: Error) => {
    setErrorState(() => {
      throw error; // 상태 업데이터 안에서 throw → 렌더링 에러로 전환
    });
  };
};
```

> 💡 직접 구현 대신 `react-error-boundary` 라이브러리 사용 권장 (Sentry도 내부적으로 사용)

---

## 2. 컨텍스트 API (Context API)

프롭스 드릴링 없이 컴포넌트 트리 전체에 데이터를 공유하는 메커니즘.

### 기본 구조

```tsx
// 1. 컨텍스트 생성
const SidebarContext = React.createContext<SidebarContext | null>(null);

// 2. 커스텀 훅으로 래핑
function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("Provider 외부에서 사용 불가");
  return context;
}

// 3. Provider로 값 공급
const SidebarProvider = ({ children }) => (
  <SidebarContext value={contextValue}>
    {children}
  </SidebarContext>
);
```

### 리렌더링 최적화 3가지 방법

#### ① useMemo로 value 메모이제이션

```tsx
const contextValue = useMemo(() => ({
  loading, error, data, refetch: fetchData
}), [loading, error, data, fetchData]);
// → Provider를 포함하는 컴포넌트가 리렌더링되어도 자식 리렌더 최소화
```

#### ② 컨텍스트 분리

```tsx
// ❌ 하나의 거대한 컨텍스트 → 어느 하나만 바뀌어도 모두 리렌더링
<AppSettingsContext value={{ theme, notificationsEnabled }}>

// ✅ 관심사별로 분리 → 변경된 컨텍스트 구독자만 리렌더링
<ThemeContext.Provider value={themeValue}>
  <NotificationsContext.Provider value={notificationsValue}>
```

#### ③ HOC + memo() 활용

```tsx
const withCounter = (HeavyComponent: React.ComponentType<any>) => {
  const HeavyComponentMemo = React.memo(HeavyComponent); // 프롭스 변경시만 리렌더
  return (props: any) => {
    const { count } = useContext(CounterContext);
    return <HeavyComponentMemo {...props} count={count} />;
  };
};
```

> ⚠️ 셀렉터 패턴은 컨텍스트 API에서 공식 미지원 → `use-context-selector` 라이브러리 활용

---

## 3. 서스펜스 (Suspense)

비동기 작업 완료 전까지 렌더링을 **선언적으로 중단**하고 폴백 UI를 표시.

### 버전별 발전

| 버전 | 특징 |
|------|------|
| React 16 | `React.lazy()` + 코드 분할 전용, SSR 미지원 |
| React 17 이하 | 형제 컴포넌트가 폴백 중에도 마운트·useEffect 실행 |
| React 18 | SSR 지원, 형제 컴포넌트 렌더링·이펙트 함께 지연 |
| React 19 | 형제 컴포넌트 기다리지 않고 폴백 UI 즉시 커밋 → 체감 성능 향상 |

### 작동 원리 (throw/catch 기반)

```
1. 컴포넌트가 데이터 미준비 → Promise를 throw (에러가 아닌 '대기 신호')
2. React 조정자가 catch로 Promise 가로챔
3. WIP 트리에서 자식을 폴백 UI로 교체 후 커밋 → 스피너 표시
4. Promise에 .then() 부착 → 완료 시 리렌더링 예약 (push 방식)
5. 데이터 준비 완료 → 원래 자식 복원 후 재커밋
```

### 에러 바운더리와 함께 사용 (권장 패턴)

```tsx
<ErrorBoundary fallbackRender={...}>   {/* 에러 발생 시 폴백 */}
  <Suspense fallback={<Spinner />}>    {/* 로딩 중 폴백 */}
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

---

## 4. use() API (React 19)

`useContext` + `Suspense`를 통합한 새 API.  
**조건문·반복문 안에서도 호출 가능**한 것이 기존 훅과의 핵심 차이.

### 컨텍스트 읽기

```tsx
// ❌ useContext: 항상 최상위에서 호출해야 해서 isActive=false여도 컨텍스트 읽음
const theme = useContext(ThemeContext);
if (!isActive) return null;

// ✅ use(): 조건부로 읽기 가능
if (!isActive) return null;
const theme = use(ThemeContext); // isActive=true일 때만 실행
```

### 프로미스 결과 읽기 (Render-as-You-Fetch 패턴)

```tsx
// 컴포넌트 렌더링 전에 데이터 요청 시작 (병렬)
const resource = createProfileResource(); // userPromise + postsPromise 동시 시작

function ProfileDetails({ userPromise }) {
  const user = use(userPromise); // 준비 전 → Suspense 폴백 / 준비 후 → 값 반환
  return <h1>{user.name}</h1>;
}

// 중첩 Suspense로 점진적 로딩 구현
<Suspense fallback={<p>페이지 로딩 중...</p>}>
  <ProfileDetails userPromise={resource.userPromise} />
  <Suspense fallback={<p>게시물 로딩 중...</p>}>
    <ProfilePosts postsPromise={resource.postsPromise} />
  </Suspense>
</Suspense>
```

### useEffect vs Suspense + use() 비교

```
useEffect 방식:
  렌더링 → 마운트 → fetch 시작 → 리렌더링 (순차적, 워터폴 발생)

Suspense + use() 방식:
  fetch 시작과 렌더링 병렬 진행 → 완성된 UI 빠르게 노출
```

### ⚠️ 안티패턴 — 무한 로딩 주의

```tsx
// ❌ 렌더링마다 새 Promise 생성 → 영원히 pending
function UserProfileWrong() {
  const userPromise = fetchUser(); // 매 렌더링마다 새 Promise!
  const user = use(userPromise);  // 항상 새 Promise → 무한 Suspense
}

// ✅ Promise는 컴포넌트 외부에서 생성하거나 캐싱 라이브러리 사용
const userPromise = fetchUser(); // 외부에서 한 번만 생성
function UserProfile() {
  const user = use(userPromise);
}
```

### use() 내부 동작 원리

| 인자 타입 | 동작 방식 |
|-----------|-----------|
| Promise | Promise 객체 자체에 `status / value / reason` 부착해 상태 추적 (훅 리스트 무관) |
| Context | 파이버 트리를 부모 방향으로 탐색해 가장 가까운 Provider 값 반환 |

기존 훅은 파이버 노드의 **연결 리스트(memoizedState)** 순서에 의존하지만,  
`use()`는 인자를 즉시 풀어내는 **독립 처리기**로 동작 → 조건부 호출 가능.

---

## 전체 구조 한눈에 보기

```
<ErrorBoundary>          ← 렌더링 에러 포착 · 폴백 UI 표시
  <Suspense>             ← 비동기 로딩 대기 · 폴백 UI 표시
    <ContextProvider>    ← 전역 상태 공급 (프롭스 드릴링 제거)
      <AsyncComponent>   ← use()로 Context · Promise 읽기
    </ContextProvider>
  </Suspense>
</ErrorBoundary>
```

| 메커니즘 | 해결하는 문제 | 핵심 API |
|----------|--------------|----------|
| 에러 바운더리 | 렌더링 에러 격리 | `getDerivedStateFromError` `componentDidCatch` |
| 컨텍스트 API | 프롭스 드릴링 제거 | `createContext` `useContext` `useMemo` |
| 서스펜스 | 비동기 로딩 상태 선언적 처리 | `<Suspense fallback>` `React.lazy` |
| use() | 조건부 컨텍스트·프로미스 읽기 | `use(context)` `use(promise)` |
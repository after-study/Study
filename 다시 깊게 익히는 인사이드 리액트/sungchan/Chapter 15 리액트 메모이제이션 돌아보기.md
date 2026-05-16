## 학습 목표
- 리액트에서 제공하는 메모이제이션을 사용해 상황에 맞는 최적화된 앱을 만들 수 있는 능력을 기른다.
- useMemo(), useCallback(), React.memo()의 차이점을 알고 있다.
- **리액트 컴파일러**를 사용해 애플리케이션을 최적화할 수 있다.

불필요한 리렌더링과 그로 인한 연산 비용 증가 -> UX 저해 원인 
성능 문제를 해결하는 핵심 전략 -> 메모이제이션
차세대 최적화 솔루션: 리액트 컴파일러

## 15.1 리액트 메모이제이션을 돌아봐야 하는 이유
'왜 사용해야 하는가', '사용했을 때 어떤 비용이 발생하는가'를 깊이 있게 이해해야 함.

## 15.2 memo()를 사용한 렌더링 최적화
부모 컴포넌트 리렌더링 -> 자식 컴포넌트 리렌더링
자식 컴포넌트가 이전과 동일하다면 리렌더링을 생략할 수 있도록 `memo()` 사용 가능함.
`memo()`는 컴포넌트를 감싸서 **프롭스를 비교**하고, 변경되지 않았다면 이전에 렌더링한 결과를 **재사용**

### 15.2.1 memo() 사용법

```tsx

React.memo(Component, arePropsEqual?)
```
두 번째 인자 arePropsEqual를 생략하면, memo()는 얕은 비교를 수행합니다. 이는 Object.is(prevProps, nextProps)처럼 객체 자체를 비교하는 것이 아니라, **prevProps와 nextProps 객체에 포함된 각각의 속성을 Object.is()로 비교**하는 방식입니다. 모든 속성 값이 이전과 같다면, memo()는 리렌더링을 건너뜁니다.
**arePropsEqual() 함수**를 직접 제공한다면, 이 함수가 **true를 반환할 때 리렌더링을 생략하고, false를 반환할 때 리렌더링을 수행**합니다. 이는 얕은 비교로는 부족한, 깊은 비교나 특정 프롭스만 비교해야 하는 복잡한 로직을 구현할 때 유용합니다. 다음 예제를 통해 memo()의 효과를 직접 확인해보겠습니다.

```tsx
// whack-a-mole/src/react-memo/memo-title.tsx

// ➊ props로 title만 받는 간단한 자식 컴포넌트
const TitleComponent = ({ title }: { title: string }) => {
  // 렌더링이 발생할 때마다 콘솔에 로그 출력
  console.log(`${title} 렌더링`)
  return <h4 className="text-lg font-bold">{title}</h4>
}

// ➋ React.memo로 감싼 자식 컴포넌트
const MemoizedTitleComponent = React.memo(({ title }: { title: string }) => {
  // 렌더링이 발생할 때마다 콘솔에 로그 출력
  console.log(`${title} (메모이즈) 렌더링`)
  return <h4 className="text-lg font-bold">{title}</h4>
})

// 부모 컴포넌트
export const MemoExample = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        카운트 증가: {count}
      </button>

      <hr />

      {/* ➌ 부모가 리렌더링될 때마다 함께 렌더링됨 */}
      <TitleComponent title="일반 타이틀" />

      {/* ➍ 부모가 리렌더링되어도 props가 그대로이므로 첫 렌더링 이후에는 렌더링되지 않음 */}
      <MemoizedTitleComponent title="메모이즈된 타이틀" />
    </div>
  )
}
```
TitleComponent는 버튼을 클릭할 때마다 리렌더링되지만 MemoizedTitleComponent는 처음 한 번만 렌더링하고 더 이상 리렌더링되지 않습니다.

### 15.2.2 성급한 최적화의 함정
모든 컴포넌트에 무분별하게 적용하면 오히려 프롭스 비교에 비용이 들어 성능에 악영향을 미칠 수 있습니다.
memo()를 적용하기 전 아래와 같은 기준을 적용해보시기 바랍니다.
1. 컴포넌트가 순수하고, 렌더링 비용이 비싸다: 컴포넌트가 **복잡한 계산**을 수행하거나 **무거운 UI 요소를 렌더링**한다면, 불필요한 리렌더링을 막는 것이 효과적
2. 컴포넌트가 동일한 프롭스로 자주 렌더링된다: **부모의 상태 변화**때문에 자식 컴포넌트가 **자신과 상관 없는 이유로 자주 리렌더링**될 때 memo()를 사용하는 것을 고려
3. 프롭스가 복잡한 객체를 포함한다: 함수나 객체처럼 **참조 동일성이 쉽게 깨지는 프롭스**를 받는다면 memo()만으로 부족하며 **useCallback()**, **useMemo()** 와 같은 다른 최적화 기법을 **함께 고려**
### 15.2.3 중첩 구조와 children 프롭스의 함정
부모, 자식 컴포넌트에 모두 memo()를 적용했는데도 부모컴포넌트의 리렌더링이 방지되지 않는 상황. children프롭스를 사용할 때 이런 현상이 자주 발생함.

```tsx
// whack-a-mole/src/react-memo/memo-caveat.tsx

import React, { useState, useMemo } from 'react'

// 부모 컴포넌트: React.memo로 감쌈
const MemoizedParent = React.memo(({ children }: { children: React.ReactNode }) => {
  console.log('부모 컴포넌트 렌더링')
  return <div style={{ border: '1px solid red', padding: 8 }}>{children}</div>
})

// 자식 컴포넌트: React.memo로 감쌈
const MemoizedChild = React.memo(() => {
  console.log('자식 컴포넌트 렌더링')
  return <div>자식 컴포넌트</div>
})

export default function MemoChildrenDemo() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        리렌더 트리거 (count: {count})
      </button>

      <MemoizedParent>
        <MemoizedChild/>
      </MemoizedParent>
    </div>
  )
}
```

버튼을 클릭하면 부모 컴포넌트 렌더링을 계속 출력되고 자식 컴포넌트 렌더링은 최초에 한 번만 출력됩니다.

이 현상의 원인은 children 프롭스의 참조 동일성에 있습니다. 
```tsx
      <MemoizedParent>
        <MemoizedChild/>
      </MemoizedParent>
```
위 코드가 내부적으로 어떻게 변환되는지 봅시다.
```tsx
// 매 렌더링 시, React.createElement(MemoizedChild)가 호출되어 새로운 객체를 생성
React.createElement(
  MemoizedParent,
  {
    children: React.createElement(MemoizedChild) // 이 부분이 매번 새로운 객체
  }
)
```

부모 컴포넌트인 MemoChildrenDemo가 리렌더링 될 때마다 JSX는 새로운 리액트 엘리먼트 객체를 생성하며, `React.createElement(MemoizedChild)`가 다시 실행되어 새로운 children 객체를 생성합니다. memo()는 얕은 비교를 수행하므로, 이전 children과 새 children이 참조값이 다른 별 개의 객체라고 판단하여 MemoizedParent를 리렌더링 합니다.

`memo()`는 둘러싸인 컴포넌트의 입장에서 **전달받는 프롭스가 변경되지 않으면 리렌더링을 시키지 않는 역할**을 하는 것이지, 컴포넌트의 프롭스로 **전달되는 children 프롭스 자체를 메모이제이션해주지는 않습니다**.

`MemoizedChild`가 리렌더링되지 않는 이유는 전달되는 프롭스가 없다는동일함을 인지하고 렌더링 과정을 생략하기 때문입니다.

MemoizedParent의 리렌더링을 막으려면, children 프롭스로 전달되는 값을 안정화 시켜야 합니다.
MemoChildrenDemo가 리렌더링 되어도 children 프롭스의 참조값이 동일하게 유지되도록 만들어야 합니다. 이때 useMemo() 훅을 사용할 수 있습니다.
```tsx
export default function MemoChildrenDemo() {
  const [count, setCount] = useState(0)

  // ➊ useMemo를 사용해 자식 엘리먼트를 메모이제이션
  const memoizedChild = useMemo(() => <MemoizedChild />, [])

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        리렌더 트리거 (count: {count})
      </button>

      <MemoizedParent>
        {/* ➋ 메모이제이션된 엘리먼트를 children으로 전달 */}
        {memoizedChild}
      </MemoizedParent>
    </div>
  )
}
```

useMemo()를 사용해 메모이제이션하면, 의존성 배열이 변하지 않는 한 이 값은 컴포넌트 생애주기 동안 단 한번만 생성되어 동일한 참조를 유지합니다.
이 변수를 children으로 전달하면 MemoizedPrarent는 더 이상 프롭스가 변경되었다고 인식하지 않으므로 불필요한 리렌더링을 방지할 수 있습니다.

memo()는 컴포넌트의 렌더링 결과를 메모이제이션할 뿐, 전달되는 프롭스를 안정화해주지는 않습니다.
함수, 객체, JSX 엘리먼트를 프롭스로 전달할 때는 useCallback()이나 useMemo()를 함께 사용해 프롭스의 참조 안정성을 보장해야 memo()가 의도대로 동작합니다.

## 15.3 useMemo(): 값 메모이제이션
memo()가 컴포넌트의 렌더링 결과를 메모이제이션하는 고차 컴포넌트였다면, useMemo()는 **컴포넌트 내부에서 사용하는 특정 값이나 연산의 결과를 메모이제이션**하는 훅입니다. useMemo()의 주된 목적은 렌더링 시마다 반복될 필요가 없는 비용이 큰 연산을 피하는 겁니다.

```ts
// whack-a-mole/src/useMemo/signature.ts
/**
 * useMemo 훅의 타입 시그니처
 * @param factory - 연산 결과를 반환하는 함수. 이 함수의 반환값이 메모이제이션됨
 * @param deps - 의존성 배열. 배열 내 값이 변경될 때만 factory 함수가 다시 실행됨
 * @returns factory 함수의 반환값(메모이제이션된 값)
 */
export function useMemo<T>(
  factory: () => T, // ➊ 연산 결과를 반환하는 함수
  deps: DependencyList // ➋ 의존성 배열 (값이 변경될 때만 factory 재실행)
): T {
  throw new Error("This is only a type signature stub. 실제 구현이 아님");
}

```
1. 연산 결과를 반환하는 함수:  첫 렌더링 시에 이 함수를 실행하고, 그 결과를 저장
2. 의존성 배열: 리렌더링될 때, 의존성 값을 Object.is()로 비교하여 factory() 함수를 다시 실행하거나 저장해둔 값을 그대로 반환
### 15.3.1 useMemo() 내부 동작 들여다보기

useMemo()를 간소화해 구현해본 코드
```ts
// whack-a-mole/src/useMemo/simulator.ts

// ➊ 리액트 내부에서 컴포넌트별 훅 상태를 저장하는 가상의 저장소
const componentHooks: Map<any, { list: HookState[]; index: number }> = new Map();

// ➋ 현재 렌더링 중인 컴포넌트를 가리키는 포인터
let currentComponent: any = null;

// 훅의 상태를 표현하는 타입
interface HookState {
  memoizedValue: any; // 캐시된 값
  deps: any[] | undefined; // 이전 렌더링의 의존성 배열
}

function createHook(): HookState {
  return { memoizedValue: null, deps: undefined };
}

/**
 * useMemo 훅의 간소화된 의사 코드
 */
function useMemo<T>(callback: () => T, dependencies: any[] | undefined): T {
  // ➌ 훅은 반드시 컴포넌트 내부에서만 호출되어야 함
  if (!currentComponent) {
    throw new Error("훅은 컴포넌트 렌더링 중에만 호출될 수 있습니다.");
  }

  // ➍ 현재 컴포넌트에 해당하는 훅 저장소를 가져오거나 새로 생성함
  if (!componentHooks.has(currentComponent)) {
    componentHooks.set(currentComponent, { list: [], index: 0 });
  }
  const hooks = componentHooks.get(currentComponent)!;
  
  // ➎ 현재 훅의 순서(인덱스)를 가져오고, 다음 훅을 위해 인덱스를 1 증가시킴
  const hookIndex = hooks.index++;
  let hook = hooks.list[hookIndex] as HookState | undefined;

  // ➏ 이 훅이 처음 호출되었다면 상태를 초기화함
  if (!hook) {
    hook = createHook();
    hooks.list[hookIndex] = hook;
  }

  // ➐ 의존성 배열 비교: 메모이제이션의 핵심
  // 이전 의존성(hook.deps)이 없거나(첫 렌더링), 현재와 다르다면 값을 새로 계산함
  if (!hook.deps || !dependencies || !depsEqual(dependencies, hook.deps)) {
    hook.memoizedValue = callback(); // 콜백을 실행해 새로운 값을 계산
    hook.deps = dependencies;         // 새로운 값과 의존성을 저장
  }

  // ➑ 의존성이 같다면, 저장된 이전 값을 그대로 반환함
  return hook.memoizedValue;
}

/**
 * ➒ 두 의존성 배열을 비교하는 헬퍼 함수
 */
function depsEqual(newDeps: any[], oldDeps: any[] | null): boolean {
  if (oldDeps === null) return false;
  if (newDeps.length !== oldDeps.length) return false;
  
  // 모든 배열 요소를 Object.is 기준으로 비교
  return newDeps.every((dep, i) => Object.is(dep, oldDeps[i]));
}
```

1. 상태는 컴포넌트 외부에 저장된다
2. 메모이제이션은 의존성 비교로부터 시작된다

### 15.3.2 useMemo()를 활용한 연산 최적화 예제

연산 비용이 높게 설계된 함수 - 재귀 호출을 사용하는 피보나치 수열은 n이 커질수록 연산량이 기하급수적으로 증가.
```tsx
// whack-a-mole/src/useMemo/UnoptimizedRabbitPattern.tsx

// ➊ 피보나치 수를 계산하는 함수
function calculateFibonacci(n: number): number {
  if (n <= 1) return 1;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

// ➋ 복잡한 패턴을 생성하는 함수
// seed 값과 크기를 기반으로 HSL 색상 문자열 배열을 생성함
function generateComplexPattern(seed: number, size: number): string[] {
  let pattern: string[] = []; // 생성될 패턴을 저장할 배열
  for (let i = 0; i < size; i++) {
    // 피보나치 수열을 사용하여 값 생성
    let value = calculateFibonacci(seed + (i % 10));
    // HSL 색상 문자열로 변환하여 패턴 배열에 추가
    pattern.push(`hsl(${value % 360}, 70%, 50%)`);
  }
  return pattern; // 생성된 패턴 배열 반환
}
```

위 `generateComplexPattern()`함수를 사용하는 컴포넌트를 만들고 seed를 25 이상으로 높인 상태에서 렌더링될 때마다 호출하면 UI가 잠시 멈추는 현상을 경험할 수 있습니다.

이를 useMemo()를 사용해, `generateComplexPattern()` 호출 부분을 감싸고, 의존성 배열에 seed를 전달하여 불필요한 연산을 건너뛸 수 있습니다.

## 15.4 useCallback(): 함수 메모이제이션

첫 인수는 메모이제이션을 수행할 함수, 두 번째 인수는 의존성 배열
```ts
// useCallback의 타입 시그니처 정의함
declare function useCallback<
  // T는 콜백 함수의 타입을 나타내는 제네릭 매개변수임
  // 모든 종류의 함수 시그니처를 받을 수 있도록 정의됨
  T extends (...args: any[]) => any
>(
  // ➊첫 번째 인수는 메모이제이션할 콜백 함수임
  callback: T,
  // ➋두 번째 인수는 의존성 배열임
  // 이 배열의 값들이 변경될 때만 콜백 함수가 새로 생성됨
  deps: ReadonlyArray<any>
  // 메모이제이션된 콜백 함수를 반환하며, 타입은 원본 콜백 함수와 동일함
): T;



// 이 두 코드는 완전히 동일하게 동작
const memoizedFn = useCallback(fn, deps);

const memoizedFn2 = useMemo(() => fn, deps);
```

차이는 표현 방식과 가독성에서 오는데, useCallback()은 콜백 함수를 자식 컴포넌트에 프롭스로 전달하거나 그 외 다른 곳에서 사용할 때 참조를 고정하고 싶을 때 사용하고, 만약 값의 계산이 목적이라면 useMemo()를 사용하는 것이 관례입니다.

### 15.4.1 useCallback()으로 커스텀 훅에 안정적인 콜백 전달하기

'useEffect() 사용법과 의존성 배열 돌아보기'에서 onClose()를 인자로 받는 useEsacpeKey() 커스텀 훅이 있습니다.
onClose()를 의존성 배열 값으로 가지고 있는 useEffect()를 내부적으로 사용했었습니다.
```ts
// whack-a-mole/src/useEffect/cleanup.ts

// 부모로부터 onClose 콜백 함수를 prop으로 받음
export function useEscapeKey(onClose: () => void) {
  useEffect(() => {
    // 'Escape' 키 입력 시 onClose 함수를 호출하는 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 클린업 함수: effect가 다시 실행되기 전, 또는 컴포넌트가 언마운트될 때 실행
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]); // ➊ 의존성 배열에 onClose 함수를 포함
}
```

만약 useEscapeKey()를 사용하는 컴포넌트에서 onClose()를 메모이제이션하지 않고 함수 인자로 전달했다고 가정하면, 부모가 리렌더링될 때마다 onClose로 전달되는 함수가 새로 생성됩니다. 그래서 이벤트 리스너를 제거하고 다시 등록하는 작업을 반복합니다.

useCallback()을 사용하면 이 문제를 해결할 수 있습니다.

### 15.4.2 useCallback()으로 프롭스 메모이제이션하기
memo()로 자식 컴포넌트를 최적화하더라도 부모가 자식에게 함수를 프롭스로 전달하면 최적화가 깨지는 경우가 많습니다. 그 이유는 부모 컴포넌트가 리렌더링을 할 때마다 내부에 선언된 함수는 기능이 동일해도 참조가 다른 새로운 함수로 매번 다시 만들어지기 때문입니다. 그 결과 memo()는 자식 컴포넌트에 전달된 프롭스가 변경되었다고 판단하여 자식 컴포넌트를 불필요하게 리렌더링하게 됩니다.

이 경우 프롭스로 전달되는 함수 역시 useCallback()을 사용하여 메모이제이션해야 합니다. 그러면 함수의 참조 일관성이 보장되어 자식 컴포넌트의 불필요한 렌더링을 막을 수 있습니다.

useCallback()을 사용해 메모이제이션된 이벤트 핸들러를 프롭스로 전달하기
```tsx
// whack-a-mole/src/useCallback/ParentComponentForMemo.tsx

// 부모 컴포넌트 정의함
const ParentComponentForMemo = () => {
  const [count, setCount] = useState(0);
  const [unrelatedState, setUnrelatedState] = useState(0);

  // ➊useCallback을 사용하여 handleClick 함수를 메모이제이션함
  // 의존성 배열이 비어 있으므로, 이 함수는 컴포넌트 최초 렌더링 시에만 생성됨
  // 이후 부모 컴포넌트가 리렌더링 되어도 이 함수의 참조는 동일하게 유지됨
  const memoizedHandleClick = useCallback(() => {
    console.log('메모이즈된 핸들러 (MemoizedChild With Callback) 호출됨');
    // 이 함수는 외부 상태에 의존하지 않으므로 의존성 배열이 비어있음
  }, []); // 빈 의존성 배열

  // 일반 함수로 정의된 핸들러
  // ParentComponentForMemo 컴포넌트가 리렌더링될 때마다 이 함수는 새로 생성됨
  const unmemoizedHandleClick = () => {
    console.log('일반 핸들러 (MemoizedChild Without Callback) 호출됨');
  };

  return (
      <div>
        <div>
          {/* ➋ memoizedHandleClick은 참조가 안정적이므로 'MemoizedChild With Callback'는 부모가 리렌더링 되어도 불필요하게 리렌더링되지 않음 */}
          <MemoizedChild onClick={memoizedHandleClick} name="MemoizedChild With Callback" />
        </div>
        <div>
          {/* unmemoizedHandleClick은 부모가 리렌더링될 때마다 새로 생성되므로 'MemoizedChild Without Callback'는 항상 리렌더링됨 */}
          <MemoizedChild onClick={unmemoizedHandleClick} name="MemoizedChild Without Callback" />
        </div>
      </div>
  );
};
```
MemoizedChild 컴포넌트의 onClick() 프롭스로 전달되는 memoizedHandleClick()은 부모 컴포넌트가 리렌더링되더라도 다시 참조가 생성되지 않기 때문에 MemoizedChild 컴포넌트는 ParentComponentForMemo 컴포넌트가 리렌더링되더라도 다시 리렌더링되지 않습니다.

useCallback()이 불필요한 사용예시
```tsx
// whack-a-mole/src/useCallback/ParentComponentForMemo.tsx

<button 
  onClick={unmemoizedHandleClick} 
  style={{ padding: '8px 12px', backgroundColor: '#ffdddd', border: '1px solid #ffaaaa' }}
>
  useCallback 사용 버튼 (HTML 요소 - 안티 패턴)
</button>
```
HTML 기본 요소를 렌더링하거나 React.memo()로 감싸지 않은 컴포넌트에 useCallback()으로 메모이제이션된 콜백을 전달하는 것은 성능상 이점을 제공하지 않으며 오히려 복잡성을 높이고 개발자에게 혼란을 줄 수 있습니다. 함수 재생성 자체가 반드시 성능 문제를 일으키는 것은 아니므로 리액트에게 불필요한 일을 추가로 시키는 것일 뿐입니다.

### 15.4.3 useCallback() 활용: 디바운스 올바르게 동작하게 하기
useCallback()은 setTimeout(), setInterval()과 같은 타이머 함수나, debounce(), throttle()처럼 특정 함수의 실행 빈도를 제어하는 유틸리티 함수와 함께 사용될 때 특히 유용합니다. 
컴포넌트 내에서 디바운스된 함수를 정의할 때 useCallback()을 사용하면, 부모 컴포넌트가 리렌더링될 때마다 이 디바운스 함수가 새롭게 생성되는 것을 방지하고 참조 안정성을 보장할 수 있습니다.

명언 검색 컴포넌트 만들기
```tsx
// whack-a-mole/src/useCallback/QuoteSearchComponent.tsx
import { debounce } from 'lodash-es'; // ➊ lodash-es에서 debounce 함수를 가져옴

const MemoizedQuoteList = memo(QuoteList);
MemoizedQuoteList.displayName = 'MemoizedQuoteList';

// 명언 검색 기능을 제공하는 메인 컴포넌트
const QuoteSearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [results, setResults] = useState<Quote[]>([]); // 검색 결과 상태 (API 응답 타입으로 명시)

  // ➋ debouncedSearch 함수를 useCallback으로 메모이제이션함
  // 의존성 배열이 비어 있으므로, 이 함수는 컴포넌트 최초 렌더링 시에만 생성됨
  // 디바운스 기능을 통해 API 호출 빈도를 제어함
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '') { // 빈 문자열 검색 방지
        setResults([]);
        return;
      }
      try {
        const response = await fetch(`https://api.quotable.io/search/quotes?query=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          // API 응답 구조에 맞게 results를 가져옴 (quotable.io는 results 필드에 배열을 담아줌)
          setResults(data.results || []); 
        } else {
          console.error('API 에러:', response.statusText);
          setResults([]);
        }
      } catch (error) {
        console.error('네트워크 또는 API 호출 에러:', error);
        setResults([]);
      }
    }, 300), // 300ms 디바운스 시간 설정
    [] // 의존성 배열: setResults는 React에 의해 참조 안정성이 보장되므로 포함하지 않아도 됨
  );

  // ➌ handleChange 함수를 useCallback으로 메모이제이션함
  // 입력 값이 변경될 때마다 searchTerm 상태를 업데이트하고, debouncedSearch 함수를 호출함
  const handleChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch] // 의존성 배열: debouncedSearch 함수가 변경될 경우에만 이 함수를 재생성함
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '15px' }}>명언 검색 (useCallback + debounce)</h2>
      {/* ➍ 검색어 입력 필드 */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="검색어를 입력하세요..."
        style={{ 
          width: '100%', 
          padding: '10px', 
          marginBottom: '20px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          boxSizing: 'border-box'
        }}
      />
      {/* ➎ 메모이제이션된 명언 리스트 컴포넌트에 검색 결과를 전달함 */}
      <MemoizedQuoteList quotes={results} />
    </div>
  );
};
```

1. loadsh에서 debounce() 함수 가져오기
2. debouncedSearch()는 API 호출 로직을 담고 있으며 debounce() 함수로 감싸져 있음. 검색어 입력할 때 마지막 입력 300ms 동안 추가 입력 없으면 API 호출
3. 인풋창의 검색 쿼리 값 업데이트 -> searchTerm 업데이트, debouncedSearch() 함수를 호출
4. 검색어 input 태그
5. 메모이제이션된 QuoteList 컴포넌트


## 15.5 리액트 컴파일러를 이용한 자동 메모이제이션
리액트 컴파일러는 수동 최적화의 고충을 해결하기 위해 등장했습니다. 이전에는 리액트 포겟`React forget`이라는 코드명으로 알려졌으며, 리액트의 핵심 철학인 UI를 상태의 함수로 간결하게 표현하고, 평범한 자바스크립트 문법을 그대로 사용하는 원칙을 지키면서 개발자의 부담을 덜어주는 것을 목표로 합니다. 컴파일러는 개발자가 작성한 코드를 깊이 있게 분석하여, 어떤 값이 변경될 수 있고 어떤 값이 그대로 유지되는지를 스스로 이해합니다.

### 15.5.1 수동 메모이제이션의 한계
메모이제이션 API를 사용한 수동 메모이제이션은 다음과 같은 트레이드오프를 강요했습니다.
1. 코드 복잡성 증가
2. 실수하기 쉬움
3. 유지보수의 어려움

수동 메모이제이션은 '성능 개선'이라는 이점을 얻기 위해 '가독성 및 부가적인 버그 양산'을 감수해야 하는 일종의 타협이었지만, 컴파일러가 자동으로 이런 최적화를 수행하도록 하는 것을 목표로 삼았습니다.

### 15.5.2 컴파일러 개발의 역사
2021에 시작. 필요성은 인지하고 있었으나 자바스크립트의 동적인 특성 때문에 컴파일러를 만든느 것은 매우 어려운 과제.
과거에도 프리팩`prepack`과 같은 컴파일러 시도가 있었지만 실패.
컴파일러 개발에는 자바스크립트 규칙과 리액트 규칙, 그리고 컴파일러 이론 모두 깊이 이해하는전문적인 개발팀이 필요했음.
몇 년 이후 개념 증명 단계를 넘어 실제 대중에게 공개할 수 있을 수준으로 발전함.

현재 RC`Release candidate`버전으로 사용해볼 수 있음. 리액트 19버전과 함께 대중에게 처음으로 발표되었지만, 19버전 자체에 포함된 것은 아니며 별도로 정식 버전이 출시 될 예정임. 

>https://ko.react.dev/learn/react-compiler/installation
>19버전은 'babel-plugin-react-compiler' 플러그인 설치만으로 작동
>17, 18버전은 'react-compiler-runtime@latest' 런타임 패키지와 target 설정이 필요

### 15.5.3 리액트 컴파일러의 역할과 기능
1. 자동 메모이제이션: 컴파일러는 리액트 컴포넌트 내의 값, 즉 프롭스나 리액트 훅의 의존성, 그리고 컴포넌트 그 자체를 자동으로 메모이제이션합니다.
2. 캐스케이딩(Cascading) 렌더링 방지: 캐스케이딩 렌더링은 JSX 엘리먼트 트리의 부모 컴포넌트가 리렌더링되면서 자식 컴포넌트가 자동으로 리렌더링되는 현상. 컴파일러가 적용되면 자식 컴포넌트는 프롭스나 상태가 변경될 때만 리렌더링됩니다.
3. 코드의 가독성 향상: 메모이제이션 API들이 사라지게 되어 가독성 향상. 의존성 배열 추적하는 작업에서 벗어남.

결론적으로 성능 걱정없이 '상태를 기반으로 UI를 선언적으로 표현하는 것'에 집중할 수 있게 됨.

### 15.5.4 리액트 컴파일러의 원리 및 동작 방식
다음과 같은 리액트의 규칙을 활용하여 최적화가 가능한 가능성을 만들어냄
1. 컴포넌트는 멱등적이어야 합니다: 컴포넌트는 같은 프롭스, 상태, 컨텍스트와 같은 입력값에 대해 항상 같은 리액트 엘리먼트를 반환
2. 컴포넌트는 순수 함수여야 합니다: 렌더링 중에 부수 효과를 발생시키면 안됩니다. 특히 프롭스나 상탯값을 직접 변경하면 안 됩니다.
3. 리액트 훅의 규칙을 준수해야 합니다: 훅은 컴포넌트나 커스텀 훅의 최상위에서만 호출해야 하며 조건문, 반복문 등 안에서는 호출될 수 없습니다.

컴파일러는 **코드를 분석하여 빌드 시점에 정적으로 리액트 규칙을 준수하여 코드가 작성되었는지 확인**합니다. 규칙 위반이 감지되면, 해당 컴포넌트나 훅에 대해서는 최적화를 건너뛰고 안전하게 컴파일되지 않은 상태를 유지합니다.

개별 제품을 표시하는 간단한 컴포넌트
```tsx

interface ProductItemProps {
  product: { id: number; name: string; price: number };
  onAddToCart: (productId: number) => void;
}

// 개별 제품을 표시하는 간단한 컴포넌트
const ProductItem = ({ product, onAddToCart }: ProductItemProps) => {
  // 이 로그는 ProductItem이 실제로 다시 렌더링될 때만 출력됨
  console.log(`[ProductItem] 렌더링됨: ${product.name}`);
  return (
    <div className="border border-gray-200 p-2.5 my-1.5 rounded bg-white text-gray-900">
      <p className="m-0 mb-1">
        {/* 프롭스를 참조하여 렌더링하는 부분 */}
        <strong>{product.name}</strong>
         - {product.price.toLocaleString()}원
      </p>
      <button
        onClick={() => onAddToCart(product.id)}
        className="py-1 px-2.5 text-sm bg-gray-100 text-gray-800 border border-gray-300 rounded hover:bg-gray-200"
      >
        장바구니에 추가
      </button>
    </div>
  );
};
```

리액트 컴파일러로 변경된 `<ProductItem>`
```js
import { c as _c } from "react/compiler-runtime";


const ProductItem = (t0) => {
 const $ = _c(13); // ➊
 const { product, onAddToCart } = t0;


 console.log(`[ProductItem] 렌더링됨: ${product.name}`);
 let t1;
 if ($[0] !== product.name) { // ➋ product.name이 이전 렌더링과 다르면
   t1 = <strong>{product.name}</strong>; // JSX 새로 생성
   $[0] = product.name; // 현재 product.name 값을 캐시의 1번 슬롯에 저장 (의존성)
   $[1] = t1; // 생성된 JSX를 캐시의 2번 슬롯에 저장 (결과)
 } else {
   t1 = $[1]; // product.name이 같으면 캐시된 JSX(t1) 재사용
 }
// 생략

```

1. 컴파일된 코드에서 `c()`는 메모이제이션 캐시를 생성하는 역할을 합니다. 이 캐시는 개별 컴포넌트 단위로 만들어지며 13개의 슬롯을 가진 배열인 `'$'`를 만듭니다. `'$'` 배열은 컴포넌트가 렌더링되는 동안 **계산된 값인 JSX 엘리먼트, 함수 참조, 배열 등이나 이 값들을 계산하는 데 사용된 프롭스, 상태와 같은 의존성을 저장**하는 데 사용됩니다. 리액트 컴파일러는 이 캐시를 활용하여, 이전 렌더링과 현재 렌더링 사이에 어떤 값이 변경되었는지, 어떤 값을 재사용할 수 있는지 판단합니다.
2. 프롭스로 전달되는 product.name 변경 여부를 판단하고 캐싱

`<strong>{product.name}</strong>`은 React.createElement() 혹은 jsx()과 같은 변환되어야 하는데 product.name 값이 같다면 캐시되었던 JSX인 t1을 재사용합니다.

JSX로 작성된 각 라인은 실제 사용되는 프롭스가 변경될 때만 재생성되며, 리액트 컴파일러가 의존성 변경을 추적하고 불필요한 렌더링을 최소화하는 것을 알수 있습니다.

### 15.5.5 리액트 컴파일러의 수동 메모이제이션 대체 가능여부
컴파일러가 수동 메모이제이션을 완전히 대체할 수 있을까요?
상황에 따라 개발자가 직접 메모이제이션을 수행하는 게 더 합리적인 결과물을 가져다주기도 합니다.

```tsx
// whack-a-mole/src/react-compiler/ProductCatalog.tsx

function ProductList({ products, searchTerm, onAddToCart }: ProductListProps) {
  console.log(`[ProductList] 렌더링 시작 - 현재 검색어: "${searchTerm}"`);

  // ➊ 비용이 높은 연산이 될 수 있는 필터링 로직
  //    ProductList가 리렌더링될 때마다 searchTerm이나 products가 변경되지 않았더라도 항상 재실행됨.
  //    products 배열이 매우 크거나 필터링 로직이 복잡할 경우 성능에 영향을 줄 수 있음.
  const filteredProducts = products.filter(product => {
    console.log(`[ProductList] "${product.name}" 필터링 중...`); // 개별 필터링 확인용 로그
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  console.log(`[ProductList] 필터링된 제품 개수: ${filteredProducts.length}`);

  /*
    // 💡 useMemo 적용 고려 지점:
    // products나 searchTerm이 변경될 때만 필터링 로직을 다시 실행하도록 메모이제이션 가능
    const filteredProducts = useMemo(() => {
      console.log("[ProductList] useMemo: 제품 필터링 실행됨");
      return products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [products, searchTerm]);
  */

  // ➋ 조기 반환 로직
  if (filteredProducts.length === 0 && searchTerm) {
    return <p>"{searchTerm}"에 해당하는 제품이 없습니다.</p>;
  }

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductItem key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
```

1. products.filter()는 ProductList가 리렌더링될 때마다 실행됨. 관련 없는 프롭스가 변경되어도 products 배열 전체를 다시 순회하므로, 잠재적인 성능 병목 지점이 될 수 있습니다.
2. filteredProducts가 비어 있고 검색어를 뜻하는 searchTerm이 존재할 때 조기 반환을 수행합니다.

```js
// whack-a-mole/src/react-compiler/ProductCardList_compiled.js

  // 1. 핵심 최적화: 주 의존성 변경 감지 (useMemo()와 유사)
  // products, searchTerm, onAddToCart 중 하나라도 이전 렌더링과 다르면 내부 로직 실행
  if ($[1] !== onAddToCart || $[2] !== products || $[3] !== searchTerm) {
    // 의존성 중 하나라도 변경되었으므로, 관련 값들을 재계산

    t2 = Symbol.for("react.early_return_sentinel"); // 기본적으로 조기 반환하지 않음을 표시

    bb0: { // 레이블 블록 (break bb0;으로 탈출 가능)
      let t32; // 필터링 콜백 함수를 담을 변수

      // 2. 필터링 콜백 함수 메모이제이션 (useCallback(..., [searchTerm])과 유사)
      if ($[6] !== searchTerm) { // searchTerm이 변경되었을 때만 필터링 함수 재생성
        t32 = (product) => {
          console.log(`[ProductList] "${product.name}" 필터링 중...`);
          return product.name.toLowerCase().includes(searchTerm.toLowerCase());
        };
        $[6] = searchTerm; // 현재 searchTerm을 캐시에 저장 (다음 비교용)
        $[7] = t32;        // 생성된 필터링 함수를 캐시에 저장
      } else {
        // searchTerm이 변경되지 않았으면 캐시된 필터링 함수 재사용
        t32 = $[7];
      }
      
      const filteredProducts = products.filter(t32); // 필터링 실행
	
	  // ...(조기 반환, 매핑 등)
  } else {
    // 3-else. 의존성이 변경되지 않았으므로 캐시된 값 재사용
    t1 = $[4];
    t2 = $[5];
  }
```

1, 5 전체 메모이제이션: 컴포넌트 핵심 로직 전체를 if로 감쌉니다. 바뀐게 없으면 캐시해둔 5 최종 결과를 즉시 반환.
2 부분 메모이제이션: searchTerm이 변경 될 때만 필터링 함수를 새로 생성. useCallback()을 자동으로 적용한 것과 동일

그런데 원본 코드 3 필터링은 products와 searchTerm에만 의존하지만 1 컴파일된 코드의 의존성 검사에는 상관없는 onAddToCart함수까지 포함되어 있습니다. 이것이 바로 컴파일러가 선택한 블록 단위 의존성 추론의 결과이자 트레이드 오프입니다. **컴파일러는 코드 한 줄 한 줄이 아닌, 연관된 코드 블록 전체를 하나의 최적화 단위**로 봅니다. 필터링 로직과 그 결과를 사용하는 map() 로직이 같은 블록에 있는데, map()에서 onAddToCart를 사용하므로 컴파일러는 이 블록 전체가 products, searchterm, onAddTodCart를 사용하므로 모두에 의존한다고 판단합니다.

onAddTodCart 함수가 매우 자주 바뀌는 프롭스라면 어떻게 될까요? 그럴 때마다 불필요한 제품 필터링이 재실행될 겁니다. 이런 상황에서는 수동 메모이제이션이 더 좋을 선택지가 될 수 있습니다.

이상적인 수동 최적화
```tsx

    // products나 searchTerm이 변경될 때만 필터링 로직을 다시 실행하도록 메모이제이션 가능
    const filteredProducts = useMemo(() => {
      console.log("[ProductList] useMemo: 제품 필터링 실행됨");
      return products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [products, searchTerm]);
```

useMemo()를 사용하면 filteredProducts의 계산을 onAddTodCart의 변경으로부터 명확하게 분리하여 더 정교한 최적화를 달성할 수 있습니다.

### 15.5.6 리액트 컴파일러 사용해보기
'babel-plugin-react-compiler' 설치하고 비트 환경에서 컴파일러를 적용
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const ReactCompilerConfig = { target: '18' }; // 1. 사용하는 리액트 버전 명시


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', ReactCompilerConfig], // 2. must run first!
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

ESLint 플러그인으로 컴파일러 사용에 필요한 올바르지 않은 리액트 코드 작성 부분을 개발단계에서 검출 가능합니다. 'eslint-plugin-react-hooks'를 사용하고 6버전 이상으로 업데이트하면 별도의 플러그인을 설치하지 않아도 됩니다.


```js
module.exports = {
  // ..
   plugins: [
    // .. ,
    “react-compiler”
  ],
   rules: {
     // ..
     "react-compiler/react-compiler": "error"
   },
  }
  
```

컴파일러 적용은 일 부파일에 대해서만 진행할 수도 있습니다. 

```ts
const ReactCompilerConfig = { 
	target: '18',
	sources: (filename: string) => {
		// 1. 파일이름 예시: my-project/src/main.tsx
		return filename.indexOf('my-project/src/calculator') !== -1;
	}
};
```
calculator폴더와 연관없는 파일들에는 리액트 컴파일러를 적용시키지 않습니다.

## 학습 마무리

## 학습목표
useState(), useReduce() 로 **컴포넌트 지역 상태 관리**
useEffect()를 사용해 **부수효과** 다루고 **엄격 모드**일 때의 동작 방식 설명
useRef() 사용, **리렌더링 발생없이** 값을 관리
forwardRef()의 필요성과 리액트 19버전부터 달라지는 내용
리액트 포탈 - 모달

#### useState()
상태 초기화 및 업데이트, 함수형 업데이트와 클로저, 지연 초기화 기법
#### useEffect()
의존성 배열의 올바른 사용법과 클린업 함수의 중요성. 엄격 모두에서의 동작 방식
#### useRef()
DOM 접근, 렌더링과 관계 없이 값을 유지하는 방법

#### forwardRef()
#### useReducer()
#### 리액트 포탈

## 14.1 리액트 필수 훅을 돌아봐야 하는 이유
`setState(count + 1)` 대신 `setState(prevCount => prevCount + 1)` 과 같은 **함수형 업데이트**를 사용해야 하는 이유
`useEffect()`의 의존성 배열에 함수를 전달했다가 **무한 렌더링**의 늪에 빠지는 경험
`useEffect()`의 의존성 배열이 존재하지 않음에도 **두 번씩 호출**되는 이유
`useRef()`가 단지 DOM요소에 접근하기 위한 도구라고만 생각하고, **리렌더링을 유발하지 않는 '인스턴스 변수'**처럼 활용할 수 있다는 사실

## 14.2 useState(): 리액트 상태 관리의 시작과 핵심
### 14.2.1 상태 초기화와 지연 초기화

```ts
// whack-a-mole/src/useState/signature.ts
// useState() 기본 문법

const [state, setState] = useState(initialState)
```

초깃값을 계산하는 데 비용이 많이 든다면 지연 초기화 기법(단순한 값 대신 함수를 전달)을 사용할 수 있음
```ts
// whack-a-mole/src/useState/initialize.ts

const [highScore, setHighScore] = useState(() => {
	const saved = localStorage.getItem('whckHighScore')
	return saved ? parseInt(saved) : 0;
})
```

`localStorage.getItem('whckHighScore')` 과 같은 I/O 작업은 동기적을 동작하여 메인 스레드를 차단할 수 있음. `useState()`에 함수를 전달하면, 이 함수는 오직 컴포넌트가 마운트될 때 한 번만 호출되므로 리렌더링 시 불필요한 초기화 비용을 피하고 성능을 최적화할 수 있음.
### 14.2.2 상태 업데이트와 업데이트 함수
`setState()`호출 즉시 상태가 바뀌지 않고 스케줄링되어 여러 업데이트를 묶어서 처리하는 배치 업데이트를 수행함.
따라서 `setState()`호출 직후에 상태를 읽으면 이전 값을 보게 됨.

```ts
// whack-a-mole/src/useState/initialize.ts
const [count, setCount] = useState(0)

const handleClick = () => {
	setCount(count + 1)
	console.log(count) // 0
}
```
이러한 동작 방식 때문에, 이전 상태에 의존하여 다음 상태를 계산해야 할 때는 **함수형 업데이트**를 사용해야 함.

```ts
// whack-a-mole/src/useState/updater.ts
setTasks(prevTasks => [...prevTasks, task])
```
여기서 주목할 점은 새로운 배열을 만들어 반환했다는 점. 리액트가 상태변화를 감지할 때 참조를 비교하기 때문에 기존 배열을 직접 수정하면 리렌더링이 발생하지 않을 수 있음.
### 14.2.3 업데이트 함수와 클로저
`useState()` 사용시 이벤트 핸들러나 setTimeout() 같은 비동기 콜백 함수가 있다면, 그 콜백 함수는 자신이 생성된 시점의 렌더링 스냅샷을 기억합니다. 따라서 콜백 함수가 나중에 실행될 때, 콜백 함수는 최신 상태가 아닌, 자신이 기억하는 **과거의 상태를 참조**하게 됩니다. 이 문제를 해결하는 열쇠로 함수형 업데이트를 사용할 수 있습니다.

리액트가 내부적으로 업데이트를 처리할 때 아래와 같은 로직을 통해 처리합니다.

```ts
// whack-a-mole/src/useState/updater.ts
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
	return typeof action === 'function' ? action(state) : action;
}
```

setState()에 전달된 인자가 **함수**이면 리액트는 그 함수를 실행 시점의 **최신 상태와 함께 호출**합니다.

이 원리를 의사코드를 통해 더 깊이 살펴보겠습니다.
```tsx
// whack-a-mole/src/useState/closure/tsx

// ➊ 리액트 내부 어딘가에 컴포넌트의 실제 상태를 저장하는 중앙 저장소가 있다고 가정
// (실제로는 파이버 노드의 memoizedState에 저장됨)
let componentStateStorage = {}; // 예: { count: 0 }
let updateQueue = []; // setState 호출을 저장하는 큐
let isRendering = false; // 현재 렌더링 중인지 여부를 나타내는 플래그

// 사용자가 호출하는 useState
function useState(initialValue) {
  const componentId = getCurrentComponentId(); // 편의상 컴포넌트를 구분하는 ID

  if (componentStateStorage[componentId] === undefined) {
    componentStateStorage[componentId] = initialValue;
  }

  // ➋ 이 변수는 렌더링 시점의 상태를 클로저에 캡처함
  const currentStateForThisRender = componentStateStorage[componentId];

  function setState(newStateOrUpdaterFn) {
    // 업데이트 요청(값 또는 함수)을 큐에 추가
    updateQueue.push({
      componentId: componentId,
      payload: newStateOrUpdaterFn,
    });
    scheduleReRender(); // ➌ 리렌더링을 예약함
  }

  return [currentStateForThisRender, setState];
}

// 업데이트 큐를 처리하고 컴포넌트를 리렌더링하는 함수 (리액트 내부 로직)
function processUpdateQueueAndReRender() {
  if (isRendering) return;
  isRendering = true;

  for (let update of updateQueue) {
    const { componentId, payload } = update;
    // 큐를 처리하는 시점의 '최신' 상태를 저장소에서 가져옴 // <-----------------------------------
    const currentActualState = componentStateStorage[componentId];

    if (typeof payload === 'function') { // <-----------------------------------
      // ➍ payload가 함수인 경우 (예: prev => prev + 1)
      // *** '최신 상태'를 인자로 함수를 실행하여 새 상태를 계산함 ***
      componentStateStorage[componentId] = payload(currentActualState);
    } else { // <-----------------------------------
      // payload가 값인 경우 (예: count + 1)
      // *** 클로저에 캡처된 '오래된 상태'로 계산된 값(payload)을 그대로 할당함 ***
      componentStateStorage[componentId] = payload;
    }
  }

  updateQueue = []; // 큐 비우기
  isRendering = false;

  // 이 시점 이후, 컴포넌트 리렌더링이 트리거됨
  // renderComponent(componentId);
}
```

## 14.3 `useEffect()`: 컴포넌트를 외부 세계와 동기화하기
`useEffect()` 는 '**특정 상태가 변경될 때마다 외부 시스템과 상태를 일치시키기**'라는 동기화 관점으로 이해하는 것이 정확합니다.

### 14.3.1 useEffect() 사용법과 의존성 배열 돌아보기
```ts
useEffect(
	setup, // 필수인자: 실행할 부수 효과 함수. 선택적으로 cleanup 함수를 반환할 수 있음.
	dependencies?, // 선택인자: 의존성 배열
)
```

1. 의존성 배열 생략: 매 렌더링마다 부수 효과 함수 실행
2. 의존성 배열 비움: 마운트시 단 한번 실행
3. 의존성 배열에 특정 값 추가: 값이 변경될 때마다 실행

콜백 함수가 사용하는 반응형 값을 배열에 포함하지 않으면, 콜백은 오래된 값을 참조하여 버그를 유발함.
다음 예제를 통해 클린업 함수와 올바른 의존성 관리를 살펴봅시다.
```ts
// whack-a-mole/src/useEffect/cleanup.ts
import { useEffect } from 'react';

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
의존성 배열에 onClose() 함수를 포함한 것은 매우 중요합니다. 외부 스코프의 onClose()를 사용하고 있으므로 onClose()가 변경될 때마다 새로운 함수로 이벤트 리스너를 다시 등록하여 최신 onClose() 로직을 실행하도록 보장해야 합니다.
하지만 **부모 컴포넌트 리렌더링될 때마다 onClose()는 새로운 참조값으로 재생성**될 수 있습니다. 불필요하게 이벤트 리스너를 제거하고 다시 등록하게 되어 **성능 저하를 유발**할 수 있습니다. 이러한 문제를 해결하기 위해 부모 컴포넌트에서는 **useCallback()** 훅을 사용해 메모이제이션해야 합니다.

### 14.3.2 부수 효과의 뒷정리: useEffect()의 클린업 함수
클린업 함수는 useEffect() 내부에서 외부 자원을 사용하거나 구독을 설정했을 때 이를 정리하는 용도로 사용되는데, 콜백 함수 내에서 또 다른 함수를 반환하여 사용할 수 있습니다. 클린업 함수의 중요성은 타이머와 같이 시간에 따라 동작하는 UI를 구현할 때 명확히 드러납니다. 게임이 실행 중일 때만 타이머가 동작하고, 중지되면 타이머도 멈춰야하는 상황을 코드로 살펴보겠습니다.

```ts
// whack-a-mole/src/hooks/useGameState.ts
  
  // 게임 타이머 처리
  useEffect(() => {
    let timerId: number;
    
    if (state.isGameRunning) {
      timerId = window.setInterval(() => {
        dispatch({ type: 'DECREMENT_TIME' });
      }, 1000);
    }
    
    // 컴포넌트 언마운트 시 인터벌 정리를 위한 클린업 함수
    // 또는 의존성 변경 시
    return () => {
      window.clearInterval(timerId);
    };
  }, [state.isGameRunning]); // isGameRunning 상태에 의존
```

1. 게임 시작(isGameRunning이 false -> true로 변경)
	1. useEffect() 실행
	2. 이전 이팩트의 클린업 함수가 실행되지만, 이전에 timerId가 없으므로 아무 일도 일어나지 않습니다.
	3. state.isGameRunning이 true 이므로 setInterval()이 호출되고, 새로운 timerId가 생성됩니다. 1초마다 시간이 감소하기 시작합니다.
2. 게임 중지(isGameRunning이 true -> false로 변경)
	1. useEffect()가 다시 실행됩니다.
	2. 이전 이팩트(게임이 실행 중이던 시점)의 클린업 함수가 먼저 호출됩니다. window.clearInterval(timerId)가 실행되어 이전에 설정된 타이머가 즉시 정지됩니다.
	3. state.isGameRunning이 false 이므로 새로운 setInterval()은 호출되지 않습니다.

**클린업 함수**로 부수 효과 중복이나 메모리 누수 문제를 방지 합니다.
**이벤트 리스너, 타이머, 웹소켓 구독** 등 외부 자원을 등록했다면, 클린업 함수를 통해 해제하는 습관을 들이는 것이 필수 조건입니다.

### 14.3.3 부수 효과 다루기: 외부 시스템과 동기화
useEffect()는 기본적으로 비동기로 동작. 브라우저 화면 업데이트를 막지 않기 위해 **백그라운드에서 실행됨**.
상태 업데이트 중간에 그려진 UI가 한 번 더 갱신되는 원리로 **메인 스레드 동작을 막지 않고 자연스럽게 처리됨**.

예시: ignore 플래그를 이용해 **비동기 응답**이 오기 전에 유저가 다른 페이지로 이동하여 **컴포넌트가 언마운트 되더라도 에러 발생을 막음**.
```ts
// whack-a-mole/src/useEffect/side-effect.ts
useEffect(() => {
  // 이 effect의 실행이 유효한지를 추적하는 플래그
  let ignore = false;

  async function fetchData() {
    const data = await fetchScoreBoard();
    // ➊ API 응답이 도착했을 때, 이 effect가 여전히 유효한 경우에만 상태를 업데이트
    if (!ignore) {
      setScores(data);
    }
  }

  fetchData();

  // ➋ 클린업 함수: 컴포넌트가 언마운트되거나, 의존성이 변해 effect가 다시 실행될 때 호출됨
  return () => {
    ignore = true; // 이 effect의 결과는 이제 무시되어야 함을 표시
  };
}, []); // 마운트 시 한 번만 실행
```

또 다른 흔한 부수효과는 리액트 상태를 브라우저의 localStorage와 같은 외부 스토리지와 동기화 하는 것.
```ts
// whack-a-mole/src/hooks/useGameState.ts

// 최고 점수가 변경될 때마다 localStorage에 저장
  useEffect(() => {
	// state.highScore가 변경될 때마다 이 부수 효과가 실행됨 
    localStorage.setItem('whackHighScore', state.highScore.toString());
  }, [state.highScore]);
```

--> useStorage 훅을 만들어 쓸 수 있음
### 14.3.4 엄격 모드에서의 useEffect()
리액트 18버전부터 `<StrictMode>`를 사용하면, `useEffect()`가 의도적으로 두 번 실행되어 테스트하는 기능이 있음.
1. 마운트
2. useEffect() 내부의 함수 실행(console.log)
3. 리액트가 즉시 **컴포넌트를 시뮬레이션 목적으로 언마운트**
4. 클린업 함수 실행
5. 리액트가 다시 컴포넌트 마운트
6. 함수 다시 실행됨(console.log)
잠재적 버그를 개발 단계에서 미리 발견하도록 돕는 안전장치

## 14.4 useRef(): 렌더링을 넘어 값을 기억하는 법
### 14.4.1 리렌더링을 발생시키지 않는 useRef()
```ts
const refContainer = useRef(initialValue)
```
initialValue는 ref 객체의 .current 프로퍼티에 할당될 초깃값. 이 값은 초기 렌더링시에만 한 번 사용됨.
useRef()는 항상 `{ current: initialValue }` 형태의 일반 자바스크립트 객체를 반환함.

ref.current 프로퍼티를 변경해도 리액트가 리렌더링을 트리거하지 않음.
1. 렌더링과 무관한 값 저장: 타이머ID, 소켓 연결 객체, 수동관리 캐시 등
2. useEffect() 클로저의 한계 극복: useEffect() 내 **이벤트 핸들러나 비동기 콜백**에서 **최신 상태를 참조**해야 할 때, 의존성 배열에 상태를 추가하여 **이팩트를 불필요하게 재실행하는 것을 피하고 싶을 때** 사용

```tsx
// whack-a-mole/src/useRef/re-render.tsx

const [count, setCount] = useState<number>(0);
const latestCountRef = useRef<number>(count); // count 상태를 추적하는 ref 생성

 // "최신 상태를 참조": count 상태가 변경될 때마다 ref의 current 값도 업데이트함. 
 useEffect(() => {
   latestCountRef.current = count;
 }, [count]);

 useEffect(() => {
   // "이벤트 핸들러나 비동기 콜백"
   const handleDocumentClick = () => {
     console.log(`현재 클릭 시점의 count (ref 사용): ${latestCountRef.current}`);
   };
   
   document.addEventListener('click', handleDocumentClick);
   console.log('클릭 이벤트 리스너 등록됨');

   // 클린업 함수: 컴포넌트 언마운트 시 또는 useEffect가 재실행되기 전에 이벤트 리스너를 제거함
   return () => {
     document.removeEventListener('click', handleDocumentClick);
     console.log('클릭 이벤트 리스너 제거됨');
   };
 }, []); 
 // "이팩트를 불필요하게 재실행하는 것을 피하고 싶을 때": count를 의존성 배열에 넣으면 이벤트 핸들러가 제거되었다가 다시 등록되는 과정을 반복하게 됨
 // 의존성 배열이 비어있으므로, 이 useEffect는 마운트 시 한 번만 실행되고 언마운트 시 클린업됨
 
 
const handleIncrement = () => {
   setCount(c => c + 1);
 };

```


### 14.4.2 useRef()를 사용한 DOM 요소 접근
리액트는 상태를 통해 선언적으로 UI를 관리하는 것을 권장하지만, 때로는 특정 DOM 노드에 직접 접근하여 메서드를 호출해야만 하는 상황이 있습니다.
- 입력 필드에 자동으로 포커스 맞추기
- 스크롤 위치 제어하기
- DOM 요소의 크기나 위치 측정하기
- 리액트로 관리되지 않는 서드파티 DOM 라이브러리 연동하기 --> jQuery + Backbone + ... ----> + React 
	- SlickGrid 테이블 라이브러리
		- ref -> $(gridRef).slickGrid({ ... })

포커싱 예제
```ts
// whack-a-mole/src/useRef/dom.tsx
import { useRef, useEffect } from 'react';

function SearchInput() {
  // ➊ HTMLInputElement 타입을 가진 ref 객체를 생성. 초깃값은 null.
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // ➌ useEffect는 컴포넌트가 렌더링되고, ref가 연결된 후에 실행됨
    // 이 시점에는 inputRef.current가 실제 <input> DOM 노드를 가리킴
    inputRef.current?.focus(); // 옵셔널 체이닝(?.)으로 안전하게 focus() 호출
  }, []); // 마운트 시 한 번만 실행

  // ➋ JSX의 ref 속성을 통해 inputRef와 실제 DOM 노드를 연결
  return <input ref={inputRef} type="text" placeholder="검색어 입력" />;
}
```

DOM 요소에 접근하는 로직은 반드시 useEffect() 내부에서 수행되어야 합니다. **렌더링 과정 중에는 ref.current가 아직 null일 수 있기** 때문입니다.

### 14.4.3 forwardRef(): 부모가 자식의 DOM에 접근하는 방법
ref는 key와 마찬가지로 리액트에서 특별하게 다루어지는 속성.
리액트 18버전까지는 일반적인 프롭스처럼 컴포넌트에 직접 전달할 수 없고 forwardRef()를 이용해야함. useRef()와 함께 사용되어 부모 컴포넌트로부터 전달된 ref를 받아 자식의 특정 JSX요소에 연결해주는 매우 중요한 함수.

```tsx
// whack-a-mole/src/forwardRef/ForwardRefExample.tsx

// ➊ forwardRef를 사용. 두 번째 인자로 ref를 받음
const MyInput = forwardRef<HTMLInputElement, { label: string }>((props, ref) => {
  return (
    <div>
      <label>{props.label}</label>
      {/* ➋ 부모로부터 전달받은 ref를 실제 input 요소에 연결 */}
      <input ref={ref} type="text" />
    </div>
  );
});
```
forwardRef()로 컴포넌트를 감싸면, 함수는 프롭스와 함께 두 번째 인자로 ref를 받게됨. 부모로 부터 전달받은 ref를 자식 컴포넌트 내부의 원하는 DOM요소의 ref 속성에 할당.

```tsx
const GameBoard: React.FC<GameBoardProps> = ({ activeHoles, onWhack, gameSpeed }) => {
  // 각 두더지에 대한 ref 배열
  const moleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    console.log(moleRefs.current);
  },[activeHoles]);

  return (

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {activeHoles.map((_, index) => (
            // 1. 자식 컴포넌트 <Hole>에 ref를 전달
            <Hole 
              key={index}
              ref={(el) => { moleRefs.current[index] = el; }} // ref에 함수형태로 값을 전달(ref 콜백)
			  // ... other props
            />
          ))}
        </div>

  );
};
```

```tsx
// whack-a-mole/src/components/Hole.tsx

const Hole = forwardRef<HTMLDivElement, HoleProps>(
  ({ isActive, onWhack, index, speed }, ref) => {
    return (
        
        {/* Mole 컴포넌트를 렌더링하는 컨테이너 */}
        {/* 부모로부터 전달받은 ref를 Mole 컴포넌트로 전달함 (ref={ref}) */}
        {/* 이를 통해 Hole의 부모 컴포넌트는 Mole 컴포넌트 내부의 DOM 엘리먼트에 접근 가능함 */}
        <div className="absolute inset-0 mt-10">
          <Mole ref={ref} isVisible={isActive} onClick={onWhack} speed={speed} />
        </div>

    );
  }
);
```

```tsx
// whack-a-mole/src/components/Mole.tsx

const Mole = forwardRef<HTMLDivElement, MoleProps>(
  ({ isVisible, onClick, speed }, ref) => {

    return (

          {isVisible && (
            <div
              ref={moleRef} // 로컬 ref를 motion.div에 연결하여 DOM 엘리먼트를 직접 참조함
			  // Other props
            >
            </div>
          )}

    );
  }
);
```

### 14.4.4 리액트 19버전에서의 forwardRef()

```tsx
// whack-a-mole/src/forwardRef/React19RefComponent.tsx

// props 객체를 통해 직접 'ref' prop을 수신함
const React19RefComponent = (props: React19RefComponentProps) => {
  // 전달받은 ref (props.ref)를 내부의 div 엘리먼트의 ref 속성에 할당함
  // 이를 통해 부모 컴포넌트에서 이 div 엘리먼트에 직접 접근 가능하게 됨
  return <div ref={props.ref}>React 19 Ref Component</div>;
};

// React19RefComponent를 사용하는 부모 컴포넌트 예시
const ParentComponent = () => {
  // useRef를 사용하여 HTMLDivElement를 참조할 수 있는 ref 객체(myRef)를 생성함
  // 초기값은 null로 설정됨. 이 ref는 React19RefComponent 내부의 div를 가리키게 됨
  const myRef = useRef<HTMLDivElement | null>(null);

  // React19RefComponent에 myRef를 'ref'라는 이름의 prop으로 전달함
  // React 19에서는 이것이 자동으로 올바르게 처리되어 자식 컴포넌트의 DOM에 연결됨
  return <React19RefComponent ref={myRef} />;
};

```

## 14.5 useReducer()와 리액트 포탈

### 14.5.1 useReducer() 알아보기
useState()의 대체 훅. 복잡한 상태 로직을 관리하거나 상태 업데이트를 분기 로직을 통해 추상화할 때 유용.
```ts
const [state, dispatch] = React.useReducer(
	reducer, // 1. 리듀서 함수
	initialArg, // 2. 초기화 인자
	init? // 3. 초기화 함수
)
```

1. 리듀서 함수: (state, action) => newState 형태의 상태변경 로직을 담은 함수
2. 초기화 인자: 초기 상태를 생성하는 데 사용될 인자
3. 초기화 함수: 초기 상태를 반환하는 함수. 초기화 함수 제공시 리액트는 init(initialArg)를 실행하여 맨 처음의 초기 상태를 설정

`dispatch()` 함수는 액션 객체를 인자로 전달받음. dispatch() 함수가 호출되면 리액트는 현재 상태와, 전달된 액션을 매개 변수로 하는 리듀서 함수를 실행하여 새로운 상태를 계산하고 컴포넌트 리렌더링을 유발함.
```ts
// 1. 카운터 예시를 위한 액션 타입 정의
// 'type' 프로퍼티를 통해 액션의 종류를 구분함
type CountAction =
  | { type: 'increment'; payload?: number }
  | { type: 'decrement'; payload?: number }
  | { type: 'reset' };

// 2. 카운터 리듀서 함수
// 이전 상태와 액션을 받아 새로운 상태를 반환함
const countReducer = (state: CountState, action: CountAction): CountState => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + (action.payload || 1) }; // payload가 있으면 그 값만큼, 없으면 1만큼 증가함
    case 'decrement':
      return { count: state.count - (action.payload || 1) }; // payload가 있으면 그 값만큼, 없으면 1만큼 감소함
    case 'reset':
      return { count: 0 }; // count를 0으로 리셋함
    default:
      throw new Error('Unhandled action type'); // 처리할 수 없는 액션 타입에 대해 에러를 발생시킴
  }
};

// 이 함수는 초기 렌더링 시 한 번만 호출됨
// 3. 초기 상태를 생성하는 함수
const init = (initialState: CountState): CountState => {
  return { count: initialState.count };
};

const [state, dispatch] = React.useReducer(countReducer, { count: 0 }, init)

// 4. countReducer 호출
dispatch({ type: 'increment' })
```

### 14.5.2 createPortal()로 모달 컴포넌트 만들기
컴포넌트 트리 **외부에 UI를 렌더링**해 모달을 구현하는 데 편리.
```ts
// whack-a-mole/src/createPortal/signature.ts

import { createPortal } from 'react-dom';

createPortal(
  child,
  container,
  key?
)
```

1. child: 렌더링하고 싶은 모든 리액트 엘리먼트
2. container: child를 렌더링할 실제 DOM 노드. document.getElementById('some-id')와 같이 직접 DOM요소를 선택하여 전달해야 함.
3. key: 선택 사항으로 포탈에 부여할 수 있는 고유한 키 문자열 또는 숫자.

모달, 툴팁, 팝오버처럼 **화면 전체를 기준으로 위치를 잡아햐 하는 컴포넌트**가 부모의 overflow 속성 때문에 잘려 보이는 현상을 해결 가능

또 다른 강력한 점은 **이벤트 전파 방식**. 포탈 내부에 발생한 이벤트는 부모 컴포넌트로 전파되어 **부모 컴포넌트에서 모달 내부의 버튼 클릭 이벤트를 자연스럽게 수신하고 처리**할 수 있음. 리액트 컨텍스트 또한 동일한 방식으로 동작하여, 포탈 내부에서도 상위 컴포넌트가 제공한 컨텍스트값을 그대로 사용할 수 있음.
유의점은 모달이 열릴 때 배경 스크롤 방지나 포커스 트랩 등 부가적인 UI처리를 해야한다는 점임. 예를 들어 Escape 키 핸들링과 같은 로직이 필요하다면 모달 컴포넌트 내부에서 useEffect()를 사용해 모달 마운트시 추가하고 언마운트시 정리하는 방식으로 작성되어야 함.

## 학습 마무리

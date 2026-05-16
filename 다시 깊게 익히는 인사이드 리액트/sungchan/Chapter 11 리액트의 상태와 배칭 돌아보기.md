## 11.1 리액트의 상태와 배칭을 돌아봐야 하는 이유

## 11.2 리액트의 상태 정의와 종류
### 11.2.1 지역 상태와 파생 상태
#### 파생 상태를 올바르게 사용하는 예제
파생 상태는 리액트 내부적으로 실제 저장하며 관리하는 상태가 아니라, 기존 상태들을 기반으로 연산된 결과값.
리렌더링 시 계산하거나 `useMemo()`등을 통해 메모이제이션함.
아래 예제와 같이 todos, filter가 변경될 때마다 렌더링 과정에서 새로 계산하면 항상 상태의 일관성이 보장됨.
필터링 로직이 복잡하고 todos 목록을 매우 커서 계산 비용이 우려된다면, useMemo()를 사용하여 계산 결과를 메모이제이션 할 수 있음.
```tsx
  const [todos] = useState(allTodos);
  const [filter, setFilter] = useState<Filter>('all');

  // ➊ 파생 상태: todos나 filter가 변경될 때마다 다시 계산됨
  // 별도의 state로 관리하지 않고, 렌더링 중에 직접 계산
  const visibleTodos = useMemo(() => {
    console.log('파생 상태(visibleTodos) 계산 중...');
    switch (filter) {
      case 'completed':
        return todos.filter((todo) => todo.completed);
      case 'active':
        return todos.filter((todo) => !todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]); // todos 또는 filter가 변경될 때만 재계산
```

### 11.2.2 상태와 스냅샷
상태 업데이트 함수를 호출하면 다음 렌더링이 예약될 뿐, 현재 실행 중인 코드의 상태 변수가 즉시 바뀌지는 않음.
#### stale closure(오래된 클로저)
이벤트 핸들러나 비동기 함수가 특정 시점의 상탯값을 '기억'하는 현상
```tsx
// 현재 count 값을 3초 후에 콘솔에 로그로 출력하는 함수
  const handleLogCount = () => {
    setTimeout(() => {
      // 이 시점의 count 값은 handleLogCount 함수가 호출될 때의 count 값을 참조함
      // 이것이 "오래된 클로저" 현상을 보여주는 부분임
      console.log(`3초 전의 count 값 (오래된 클로저): ${count}`);
    }, 3000);
  };

  // 최신 count 값을 3초 후에 콘솔에 로그로 출력하는 함수 (오래된 클로저 해결)
  const handleLogLatestCount = () => {
    setTimeout(() => {
      // setCount의 콜백 함수를 이용하여 최신 상태 값을 가져옴
      // 또는 useRef를 사용하여 항상 최신 값을 참조하도록 할 수도 있음 (다른 예제에서 다룰 수 있음)
      setCount(currentCount => {
        console.log(`3초 후의 최신 count 값: ${currentCount}`);
        return currentCount; // 상태를 변경하지 않고 현재 값만 읽음
      });
    }, 3000);
  };
```

### 11.2.3 상태의 불변성
useState() 의 업데이트 함수와 useEffect() useMemo() 와 같이 의존성 배열을 비교할 때 두 변수가 메모리 상에서 정확히 같은 객체를 가리킬 때 변경을 감지하지 못함. 그래서 직접 상태 객체를 수정하면 메모리상에 변화가 없으므로 업데이트 및 리렌더링이 일어나지 않음.
이 문제를 해결하려면 항상 새로운 객체나 배열을 생성하여 상태를 업데이트해야 함.

1. 스프레드 연산자 사용
2. 상태 구조가 깊고 복잡할 때는 immer 라이브러리 사용해 간결하게 작성할 수 있음
```tsx
import { produce } from 'immer'; // immer에서 produce 함수를 가져옴

  const [user, setUser] = useState({
    name: '진수',
    profile: {
      age: 25,
      social: {
        twitter: '@jinsu',
      },
    },
    items: ['옷', '신발'],
  });

  const updateUser = () => {
    setUser(
      // produce 함수는 두 개의 인자를 받음: (현재 상태, 업데이트 로직 함수)
      produce((draft) => {
        // 'draft'는 현재 상태의 복사본이며, 이 객체는 자유롭게 수정할 수 있음
        // immer가 변경 사항을 감지하여 불변성을 유지하며 새로운 상태를 생성해줌
        draft.profile.age += 1;
        draft.items.push('가방');
      })
    );
  };
```

### 11.2.4 상태 끌어올리기
하나의 부모를 가진 여러 컴포넌트에서 부모로 상태를 끌어올리고 props를 통해 데이터를 전달받아 일관성을 유지할 수 있음.

```tsx
// ch10_11/src/state/AccordionItem.tsx

```

자신의 상태를 갖지 않고 부모 프롭스에 의해 완전히 제어되는 컴포넌트를 제어 컴포넌트라고 함.

```tsx
// ch10_11/src/state/Accordion.tsx

```

## 11.3 컴포넌트 간의 데이터 흐름 돌아보기

리액트는 기본적으로 톱다운 또는 단방향 데이터 흐름을 갖는다. 단방향, 양방향 데이터 흐름 개념을 비교하고 리액트에서 양방향 바인딩을 구현하는 방법을 살펴보자.

### 11.3.1 단방향 데이터 흐름과 단방향 바인딩
단방향 바인딩`one way binding`이란 상태(모델)가 UI(뷰)를 일방적으로 결정하며, 뷰에서의 변경이 모델에 직접 영향을 주지 않는 데이터 흐름 원칙임.
뷰의 변경을 모델에 반영하기 위해서는 반드시 이벤트 핸들러를 통한 명시적인 업데이트 요청이 필요함.
### 11.3.2 양방향 데이터흐름과 양방향 바인딩
일부 프레임워크에서는 양방향 데이터 바인딩을 지원함.
리액트는 양방향 바인딩을 위한 내장 문법을 지원하지는 않지만 제어 컴포넌트`Controlled component`패턴을 사용하면 양방향 바인딩과 유사한 동작 구현할 수 있음.

Vue.js 의 v-model 예제
```vue
<script setup>
import {ref} from ‘vue’

const message = ref(‘안녕! vue!’)
</script>

<template>
	<input v-model=“model” />
</template>
```

input 엘리먼트에 값을 변경할 때마다 message상태가 자동 업데이트됨. 코드 내에서 message 상태가 변경되면 input 의 값도 즉시 갱신됨.
내부적으로 값과 이벤트 핸들러를 결합하나 v-model이 코드를 축약형으로 사용할 수 있게 해줌. 코드 작성은 간결하지만 상태 변화 추적하기가 어려울 수 있음.

리액트에서 양방향 바인딩을 구현하려면 상태를 단일 출처로 관리하되 유저 입력을 처리하는 이벤트를 통해 상태를 업데이트해야 함.
```tsx
// ch10_11/src/ControlledComponent.tsx
```
## 11.4 리액트 배칭 돌아보기

여러 상태가 연쇄적으로 변경될 때 효율적으로 처리하기 위해 배칭을 사용해 최적화.

### 11.4.1 배칭의 개념과 필요성
배칭은 여러 상태 업데이트를 하나의 묶음`batch`으로 만들어 한 번의 리렌더링만 수행하도록 하는 것을 말함.

#### 주사위 게임으로 배칭 이해하기
```tsx
// ch10_11/src/batching/DiceGame.tsx
```

주사위 눈이 변경될 때마다 남은 시도 횟수와 테마 이름, 배경화면 색을 저장하는 여러 지역 상태가 업데이트되어도 콘솔에 출력되는 값을 보면 한 번만 리렌더링된다는 사실을 확인할 수 있음.

### 11.4.2 비동기 동작에서의 배칭 프로세스
setTimeout이나 Promise콜백처럼 리액트 제어범위 밖에서 실행되는 비동기 코드 내에서 상태를 야러번 업데이트하면 어떻게 될까

리액트17버전까지는 기본적으로 배칭처리되지 않아 개별적 리렌더링으로 불필요한 성능저하 유발함  
개발자는 이런 상황에서 수동 배칭을 위해 ReactDOM.unstable_batchedUpdate() API를 사용해야 했음.

리액트 18버전 부터는 ReactDOM.createRoot()를 사용해 애플리케이션을 렌더링한다면, setTimeout(), Promise콜백, 네이티브 이벤트 핸들러에서 발생하는 상태 업데이트들도 자동으로 배칭 처리됨. 수동으로 배칭을 신경 쓰거나 별도의 API 사용할 필요없이 리액트가 알아서 최적화를 수행해줌.

```tsx
// ch10_11/src/batching/DiceGame.tsx
```

### 11.4.3 react-dom의 flushSync()
리액트에서 DOM 업데이트를 처리해주지만 매우 드문 상황에서 상태 업데이트를 즉시 DOM에 동기적으로 반영해야 할 필요가 있음. 이때 사용하는 API가 flushSync(). 리액트 18버전에서 createRoot() API와 함께 도입된 기능, 자동 배칭의 동작을 의도적으로 건너뛰고 싶을 때 사용함.

flushSync()의 동작 방식을 리액트의 배칭, 그리도 자바스크립트의 클로저 개념과 엮어 자세히 살펴보자.
```tsx
// ch10_11/src/batching/FlushSyncExample.tsx

import { flushSync } from "react-dom";
import { useState } from "react";

const FlushSyncExample = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 
    setCount(count + 2); // 
    console.log("before flushSync - count 스냅샷:", count); // 이 시점의 count는 0

    // flushSync는 콜백 내의 상태 업데이트를 즉시 동기적으로 실행하고 DOM을 업데이트함
    flushSync(() => {
      setCount(prevCount => {
        console.log("inside flushSync - prevCount:", prevCount);
        return prevCount + 3
      });
      console.log("inside flushSync - count 스냅샷:", count);
    });
    // 이 시점의 count는 0
    console.log("after flushSync - count 스냅샷:", count);
    
    // 다음 상태 업데이트는 다시 일반적인 배칭 규칙을 따름.
    // 이 setCount는 flushSync로 인해 이미 발생한 렌더링 이후의 다음 렌더링을 위해 스케줄됨.
    setCount(count + 4);
    
    // handleClick 함수의 실행이 모두 끝난 후에도, 이 console.log는
    // handleClick이 호출된 시점의 count 스냅샷(0)을 참조함.
    // 실제 count 상태는 이 핸들러 실행 완료 후, 스케줄된 리렌더링이 발생할 때 업데이트됨.
    // 이 시점의 count는 0
    console.log("handleClick 함수의 마지막 count 스냅샷:", count);
  }

  // 컴포넌트가 리렌더링될 때마다 현재 스냅샷에서 참조하는 count값을 콘솔 로그로 출력함.
  // Increment버튼을 누르면 두 번의 콘솔 로그가 출력됨. 
  // 첫 번째는 count 값(5), 두 번째는 최종 count 값(4)
  console.log("렌더링 발생, 현재 count:", count)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  )
}
```

flushSync()는 리액트의 렌더링 흐름에 직접 개입하는 강력한 도구임. flushSync()는 DOM이 업데이트된 직후, 동기적으로 특정 작업을 처리해야할 때 유용함.
리액트 공식 문서에서는 브라우저의 window.print() 기능을 예로 들어, 인쇄 대화 상자가 뜨기 전에 페이지의 내용을 먼저 변경하고 싶을 때 flushSync()를 사용할 수 있음.
```tsx
// ch10_11/src/batching/printApp.jsx
import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

export default function PrintApp() {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    function handleBeforePrint() {
      flushSync(() => {
        // 이 시점에서 즉시 업데이트 됨
        setIsPrinting(true);
      })
    }

    function handleAfterPrint() {
      setIsPrinting(false);
    }

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    }
  }, []);

  return (
    <>
      <h1>isPrinting: {isPrinting ? 'yes' : 'no'}</h1>
      <button onClick={() => window.print()}>
        Print
      </button>
    </>
  );
}

```

flushSync() 덕분에 window.print()가 화면을 캡처하기 전에 isPrining 상태가 true로 바뀌고, "isPrinting: yes"라는 내용이 인쇄물에 포함될 수 있음

두 번째 유스케이스는 조건부 렌더링 후 DOM 요소에 접근하는 경우인데, 상태 변경으로 인해 새로운 DOM 요소가 렌더링되고, 그 직후 해당 요소에 포커스를 주거나 위치를 계산해야 하는 경우를 생각해보자.

TIK 버튼을 누르면 <input /> 엘리먼트를 렌더링하고 자동으로 포커싱하며 TOK 버튼을 누르면 <textarea />엘리먼트를 렌더링하고 자동으로 포커싱함.
```tsx
// ch10_11/src/batching/Tiktok.jsx
import { useState } from "react";
import { flushSync } from "react-dom";

const TikTok = () => {
  const [timeState, setTimeState] = useState("tik");

  /**
    // 오류를 발생시키는 코드  
    const handleClick = (state) => () => {
      setTimeState(state);
      const element = document.getElementById(state);
      element.focus();
    }
  */

  // 수정된 코드
  const handleClick = (state) => () => {
    flushSync(() => {
      setTimeState(state);
    })
    const element = document.getElementById(state);
    // 이 코드가 실행될 때는 이미 <textarea/> 엘리먼트가 존재
    element.focus();
 }

  return (
    <div>
      <button
        onClick={handleClick('tik')}
        style={{backgroundColor: "red"}}
      >TIK</button>
      <button
        onClick={handleClick('tok')}
        style={{backgroundColor: "green"}}
      >TOK</button>
      {timeState === "tik" ?
      <div>
        TIK: <input id="tik" />
      </div> :
      <div>
        TOK: <textarea id="tok" />
      </div>
      }
    </div>
  )
}

export default TikTok;

```
flushSync()가 없는 경우 TOK버튼을 누르면 textarea가 DOM에 존재하지 않는데 document.getElementById를 호출해 에러가 발생함.

자동 배칭의 성능적 이점을 포기하면서 사용하는 flushSync()는 꼭 필요한지 충분히 고민한 후 신중히 사용해야 함.

## 학습 마무리
상태
지역상태
파생상태
상태와 스냅샷
상태의 불변성
상태 끌어올리기
단방향 데이터 흐름
## 학습목표
- 에러 바운더리 컴포넌트를 통해 **에러 대응**
- 리액트의 **프롭스 드릴링을 개선**하기 위해 컨텍스트를 사용
- **use() API 사용**해 컨텍스트 및 프로미스 값에 접근
- 비동기 렌더링 및 서스펜스 등 고급 활용

## 16.1 리액트 컨텍스트, 에러 바운더리, 서스펜스를 돌아봐야하는 이유

애플리케이션 전체의 **구조와 흐름을 설계**할 때 도움이 됩니다. 
에러 바운더리는 국소적인 에러를 격리하는 '안전망'. **사용자에게 안정적 경험** 제공.
컨텍스트는 **복잡한 프롭스 드릴링 없이** 데이터 전달. 이에 더해 서스펜스와 use() 훅 사용하면 **비동기 데이터 로딩의 교통 관제 시스템**을 배우는 것과 같음.

## 16.2 에러 바운더리 사용해 견고한 앱 만들기
에러 처리가 미흡하면 유저는 예고 없이 깨진 UI나 빈 화면을 마주하는 등 부정적인 경험을 하게 됩니다. 이러한 문제를 해결하기 위해 에러 바운더리`Error boundary`라는 특수한 컴포넌트 개념을 사용해, 하위 컴포넌트 트리에서 발생하는 렌더링 에러를 포착하고 제어할 수 있습니다.

현재 리액트 훅에는 **폴백 UI를 렌더링**하는 정적 생명주기 메서드와, **포착된 에러 정보를 기록**하는 생명주기 메서드가 기능적으로 존재하지 않아 **클래스 컴포넌트를 사용**해야 합니다.

 💡tip: 'react-error-boundary'와 같은 라이브러리는 내부적으로 클래스 컴포넌트 기반의 에러 바운더리를 사용하지만, 개발자에게는 훅과 함수형 컴포넌트에 친화적인 API를 제공하여 간편 사용가능.

### 16.2.1 클래스 컴포넌트를 사용해 에러 바운더리 컴포넌트 만들어보기
에러 바운더리 자격을 갖추려면, 다음 두가지 클래스 컴포넌트 전용 생명 주기 메서드 중 하나 이상을 구현해야 합니다.
1. `static getDerivedStateFromError(error)`: 렌더링 과정에서 에러가 발생했을 때 호출됩니다. 에러를 인자로 받아 컴포넌트의 상태를 갱신하는 용도로 사용됩니다. 상태가 갱신되면 리렌더링이 일어나며, 이때 개발자가 준비한 **대체(Fallback) UI를 보여줄 수 있습니다.**
2. `componentDidCatch(error, errorInfo`: 에러가 포착된 후 호출됩니다. 에러 정보와 어떤 컴포넌트가 에러를 발생시켰는지에 대한 정보를 포함하는 스택 트레이스를 인자로 받습니다. 주로 센트리(Sentry)나 데이터독(Datadog) 같은 외부 에러 모니터링 서비스에 에러 정보를 전송하는 등의 부수 효과를 처리하는 데 사용됩니다.

ErrorBoundary 컴포넌트 상태와 폴백 UI 프롭스 **타입** 작성해보기
```tsx
// whack-a-mole/src/components/ErrorBoundary.tsx

import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

// ➊ ErrorBoundary 컴포넌트가 관리하는 상태 타입 정의.
type ErrorBoundaryState = {
  error: Error | null; // 발생한 에러 객체
};

// ➋ 에러 발생 시 fallback UI를 렌더링하는 함수 또는 컴포넌트에 전달될 props 타입 정의.
export type FallbackProps = {
  error: Error; // 발생한 에러 객체
  resetErrorBoundary: () => void; // 에러 상태를 초기화하고 컴포넌트를 다시 렌더링하도록 시도하는 함수.
};

/**
 * ErrorBoundary 컴포넌트의 props 타입 정의.
 * PropsWithChildren: children prop을 기본적으로 포함함.
 * fallbackRender: 에러 발생 시 렌더링할 함수. FallbackProps를 인자로 받음.
 * FallbackComponent: 에러 발생 시 렌더링할 React 컴포넌트. FallbackProps를 props로 받음.
 * onReset: resetErrorBoundary 함수가 호출될 때 실행될 콜백 함수 (선택 사항).
 * onError: 에러가 감지되었을 때 호출될 콜백 함수 (선택 사항). componentDidCatch에서 호출됨.
 */
type ErrorBoundaryProps = PropsWithChildren<{
  fallbackRender?: (props: FallbackProps) => ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  onReset?: () => void; // 에러 상태 초기화 시 추가 작업 수행을 위한 콜백
  onError?: (error: Error, info: ErrorInfo) => void; // 에러 로깅 등을 위한 콜백
}>;
```
1. `ErrorBoundaryState`는 포착된 **에러 객체를 저장**하며, 이 값이 null인지 여부에 따라 UI 렌더링이 결정됩니다.
2. `FallbackProps`는 에러 발생시 보여줄 **폴백 UI 컴포넌트가 받을 데이터와 함수를 정의**합니다.

에러가 발생했을 때 에러가 발생했음을 유저에게 보여줄 폴백 UI 컴포넌트에 전달할 프롭스 타입을 정의합니다. 에러 정보와 에러가 발생했을 때 유저가 임의로 에러 상태를 초기화할 수 있는 메서드 reset()을 전달할 예정입니다.

이어서 에러 바운더리 컴포넌트의 생성자와 생애주기 메서드를 작성합니다.

ErrorBoundary 컴포넌트 작성하기
```tsx
// whack-a-mole/src/components/ErrorBoundary.tsx

/**
 * 자식 컴포넌트에서 발생하는 렌더링 에러를 감지하고,
 * 사용자 정의 fallback UI를 보여주거나 에러 정보를 로깅할 수 있는 에러 바운더리 컴포넌트.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // 초기 상태는 에러가 없는 상태로 설정함
    this.state = { error: null };
  }

  /**
   * ➌ 하위 컴포넌트에서 에러가 발생했을 때 호출되는 정적 생명주기 메서드.
   * 이 메서드는 렌더링 단계에서 호출되므로 부수 효과(side effects)를 발생시키면 안 됨.
   * 발생한 에러를 기반으로 ErrorBoundary의 상태를 업데이트하여 다음 렌더링에서 fallback UI를 표시하도록 함.
   * @param error 발생한 에러 객체
   * @returns 업데이트할 새로운 상태 객체 또는 null
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 다음 렌더링에서 fallback UI가 보이도록 상태를 업데이트함
    return { error };
  }

  /**
   * ➍ 하위 컴포넌트에서 에러가 발생하여 getDerivedStateFromError가 호출된 후, 커밋 단계에서 호출되는 생명주기 메서드.
   * 이 메서드에서는 부수 효과(side effects)가 허용됨 (예: 에러 리포팅 서비스에 로그 전송).
   * @param error 발생한 에러 객체
   * @param errorInfo 에러를 발생시킨 컴포넌트 스택 정보를 포함하는 객체
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // props로 전달된 onError 콜백이 있다면 호출하여 에러 정보를 전달함
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // 예: Sentry, DataDog 같은 외부 에러 모니터링 서비스에 에러 정보 전송
    // reportErrorToService(error, errorInfo);
  }

  /**
   * ➎ 에러 상태를 초기화하는 메서드.
   * 이 메서드는 fallback UI에 전달되어 사용자가 에러 상태를 리셋하고
   * 다시 시도할 수 있도록 하는 기능을 제공함.
   */
  resetErrorBoundary = () => {
    // props로 전달된 onReset 콜백이 있다면 호출함
    if (this.props.onReset) {
      this.props.onReset();
    }
    // 에러 상태를 초기화함
    this.setState({ error: null });
  };
```

3. 자식 컴포넌트 트리에서 렌더링 **에러가 발생하면 가장 먼저 실행되는 정적 생명주기 메서드**입니다. 발생한 error를 받아 상태를 갱신하는 일만 수행합니다. 상태가 변경되면 리액트는 리렌더링을 시작하여 깨진 UI 대신 폴백 UI를 보여주게 됩니다. 이 메서드는 렌더 단계에서 동기적으로 호출되므로, 여기서 부수 효과를발생시키는 것은 금지 됩니다.
4. `getDerivedStateFromError()`가 호출되어 **상태가 업데이트가 완료된 후, 커밋 단계에서 실행되는 인스턴스 메서드**입니다. 여기서는 부수 효과 수행이 허용되므로, 포착된 에러와 에러가 발생한 컴포넌트 스택 정보를 외부 모니터링 서비스로 전송할 수 있습니다.
5. **에러 상태를 null로 되돌려서 다시 정상적인 자식 컴포넌트를 렌더링하도록 시도**하는 메서드입니다. 이 함수는 `FallbackComponent`에 프롭스로 전달되어, 유저가 다시 시도 버튼을 클릭했을 때 호출될 수 있습니다.

이제 ErrorBoundary 클래스 컴포넌트의 마지막 조각인 render() 메서드를 작성하여, 에러 상태에 따라 자식 컴포넌트 또는 폴백UI를 조건부로 렌더링하는 로직을 완성합니다.
```tsx
// whack-a-mole/src/components/ErrorBoundary.tsx

/**
   * ➏ 컴포넌트의 UI를 렌더링하는 메서드.
   * 에러 상태(this.state.error)에 따라 자식 컴포넌트 또는 fallback UI를 렌더링함.
   * @returns 렌더링할 React 엘리먼트
   */
  render() {
    const { fallbackRender, FallbackComponent, children } = this.props;
    const { error } = this.state;

    if (error) {
      // 에러가 발생한 경우 fallback UI를 렌더링함
      const fallbackProps: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      // 1. FallbackComponent prop이 제공되면 해당 컴포넌트를 렌더링함
      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }
      // 2. fallbackRender prop이 제공되면 해당 함수를 호출하여 결과를 렌더링함
      if (fallbackRender) {
        return fallbackRender(fallbackProps);
      }
      // 3. 위 두 가지 prop이 모두 없다면, 기본적인 fallback UI를 렌더링함
      return (
        <div>
          <h2>문제가 발생했습니다.</h2>
          <p>{error.message}</p>
          <button type="button" onClick={this.resetErrorBoundary}>
            다시 시도
          </button>
        </div>
      );
    }

    // ➐ 에러가 없는 경우 자식 컴포넌트를 정상적으로 렌더링함
    return children;
  }
}

export default ErrorBoundary; 
```

6. this.state.error 값의 존재 여부를 확인하여 어떤 UI를 보여줄지 결정합니다.
7. state에 error가 존재하면, 에러가 발생한 것으로 간주하고 폴백 UI를 렌더링합니다.

지금까지 구현한 ErrorBoundary 컴포넌트를 실제로 사용하는 ErrorPage 컴포넌트를 작성합니다. App 컴포넌트에서 의도적으로 에러를 발생시켜, 우리가 만든 에러 바운더리 컴포넌트가 제대로 이를 캡쳐하는지 확인합니다.

ErrorBoundary 정상 작동 확인하기
```tsx
// whack-a-mole/src/pages/ErrorPage.tsx

import ErrorBoundary from "@/components/ErrorBoundary";
import SignSpinner from "@/components/SignSpinner";

// 사용 예시를 위한 임시 App 컴포넌트
const App = () => {
  // 의도적으로 에러를 발생시키는 로직 (테스트용)
  if (Math.random() > 0.5) {
    throw new Error("App 컴포넌트에서 예기치 않은 에러 발생!");
  }
  return <div>애플리케이션의 주요 내용</div>;
};

const ErrorPage = () => {
  return (
    <ErrorBoundary
      // ➊ 에러 발생 시 표시할 컴포넌트
      fallbackRender={({ error, resetErrorBoundary }) => (
        <SignSpinner error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      // ➋ 에러 리셋 시 호출될 콜백
      onReset={() => console.log("ErrorBoundary가 리셋되었습니다.")}
      // ➌ 에러 발생 시 호출될 콜백
      onError={(error, info) => {
        console.error("ErrorBoundary에서 에러 감지:", error);
        console.error("에러 정보:", info.componentStack);
        // 이곳에서 Sentry 등의 외부 서비스로 에러를 로깅할 수 있음
        // logErrorToService(error, info);
      }}
    >
      {/* ➍ 실제 애플리케이션 컴포넌트 */}
      <App />
    </ErrorBoundary>
  )
}

export default ErrorPage;
```
1. 에러 발생 시 렌더링될 컴포넌트를 직접 지정합니다. 이 컴포넌트는 error 객체와 resetErrorBoundary()를 프롭스로 전달받습니다.
2. 에러 복구를 수행하고 호출할 콜백 함수를 지정할 수 있습니다.
3. 프롭스로 전달된 콜백 함수로 에러정보를 인자로 전달받아 필요한 작업을 수행할 수 있습니다.
4. children으로 실제 애플리케이션 컴포넌트인 `<App>`을 전달합니다. 에러 상황 표시를 위해 50%의 확률로 렌더 단계에서 에러를 발생시키게 합니다.


### 16.2.2 에러 전파 알아보기  
**렌더링 과정에서 에러가 발생**하면, 이 에러는 **DOM의 이벤트 버블링**과 유사하게 컴포넌트 트리를 따라 상위로 전파됩니다. 리액트는 에러가 발생한 지점부터 시작해 가장 가까운 부모 에러 바운더리를 찾을 때까지 이 에러를 계속 위로 올리는데, 이러한 과정을 **에러 전파**`Error propagation`라고 부릅니다. 일단 에러가 특정 에러 바운더리에 의해 포착되면, 에러 전파는 그 지점에서 멈춥니다. 즉, 해당 에러는 더 이상 상위의 다른 에러 바운더리로 전달되지 않습니다. 이 덕분에 에러의 영향 범위를 손상된 컴포넌트 주변으로 효과적으로 격리하고, 애플리케이션의 나머지 부분은 안정적으로 유지할 수 있습니다.

```tsx
// whack-a-mole/src/components/ErrorPropagate.tsx

// ➊ ThrowError 컴포넌트: 의도적으로 에러를 발생시키는 컴포넌트
const ThrowError = ({ message }: { message: string }) => {
  // 이 컴포넌트가 렌더링될 때 에러를 발생시킴
  throw new Error(message);
};

// ➋ ComponentC: 자체 ErrorBoundary를 가지고 있으며, ThrowError 컴포넌트를 자식으로 가짐
const ComponentC = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      // ComponentC의 에러 바운더리가 잡은 에러를 표시하는 fallback UI
      <div style={{ border: '1px solid orange', padding: '10px', margin: '5px' }}>
        <p>Component C 내부 에러:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>C에서 재시도</button>
      </div>
    )}
  >
    <div style={{ padding: '10px', border: '1px dashed blue' }}>
      <h3>Component C</h3>
      {/* ThrowError 컴포넌트가 여기서 에러를 발생시킴 */}
      <ThrowError message="Error thrown from Component C's child (ThrowError)" />
    </div>
  </ErrorBoundary>
);

// ➌ ComponentB: 자체 ErrorBoundary를 가지고 있으며, ComponentC를 자식으로 가짐
const ComponentB = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      // ComponentB의 에러 바운더리가 잡은 에러를 표시하는 fallback UI
      // 이 예제에서는 ComponentC의 에러 바운더리가 먼저 에러를 처리하므로, 이 fallback은 실행되지 않음
      <div style={{ border: '1px solid green', padding: '10px', margin: '5px' }}>
        <p>Component B 내부 에러:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>B에서 재시도</button>
      </div>
    )}
  >
    <div style={{ padding: '10px', border: '1px dashed green' }}>
      <h3>Component B</h3>
      <ComponentC />
    </div>
  </ErrorBoundary>
);

// ➍ ComponentA: 자체 ErrorBoundary를 가지고 있으며, ComponentB를 자식으로 가짐
const ComponentA = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      // ComponentA의 에러 바운더리가 잡은 에러를 표시하는 fallback UI
      // 이 예제에서는 ComponentC의 에러 바운더리가 먼저 에러를 처리하므로, 이 fallback은 실행되지 않음
      <div style={{ border: '1px solid purple', padding: '10px', margin: '5px' }}>
        <p>Component A 내부 에러:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>A에서 재시도</button>
      </div>
    )}
  >
    <div style={{ padding: '10px', border: '1px dashed purple' }}>
      <h3>Component A</h3>
      <ComponentB />
    </div>
  </ErrorBoundary>
);
```

1. 항상 Error 객체를 발생시키는 컴포넌트
2. ComponentC는 내부에 ThrowError 컴포넌트를 포함, ErrorBoundary로 감싸짐.
3. ComponentB역시 자식으로 ComponentC를 가지며, 자신만의 ErrorBoundary로 감싸짐. ComponentC의 내부에서 발생한 에러는 이미 처리되었기 때문에 ComponentB 에러 바운더리까지 전파되지 않음.
4. ComponentA는 ComponentB를 자식으로 가지며, ErrorBoundary로 감싸짐. Error는 여기까지 전파되지 않음

### 16.2.3 렌더링 에러와 에러 바운더리 작동 조건
에러 바운더리는 리액트 렌더링 생명주기 동안 발생하는 에러만 감지할 수 있습니다. 따라서 다음과 같은 상황에서는 임의의 에러를 발생시켜도 에러 바ㄹ운더리에서 에러를 감지하지 못합니다.
```tsx
// whack-a-mole/src/components/NonCapturedErrorsExample.tsx

// ➊ 이벤트 핸들러 내 에러 (ErrorBoundary에 감지되지 않음)
  const handleErrorInEventHandler = () => {
    try {
      console.log("이벤트 핸들러 에러 발생 시도...");
      throw new Error("이벤트 핸들러에서 발생한 에러 (감지 안됨)");
    } catch (e) {
      if (e instanceof Error) {
        console.error("💥 이벤트 핸들러 내부에서 직접 잡은 에러:", e.message);
        alert(`이벤트 핸들러 에러 (ErrorBoundary에 감지 안됨): ${e.message}`);
      }
    }
  };

  // ➋ fetch 비동기 에러 (ErrorBoundary에 감지되지 않음)
  const handleErrorInFetch = () => {
    console.log("fetch 비동기 에러 발생 시도...");
    fetch('/invalid-endpoint') // 존재하지 않는 엔드포인트
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP 에러! status: ${response.status} (감지 안됨)`);
        }
        return response.json();
      })
      .catch(e => {
        if (e instanceof Error) {
          console.error("💥 fetch().catch() 에서 잡은 에러:", e.message);
          alert(`fetch 비동기 에러 (ErrorBoundary에 감지 안됨): ${e.message}`);
        }
      });
  };

  // ➌ setTimeout 내 에러 (ErrorBoundary에 감지되지 않음)
  const handleErrorInSetTimeout = () => {
    console.log("setTimeout 에러 발생 시도...");
    setTimeout(() => {
      try {
        throw new Error("setTimeout 콜백에서 발생한 에러 (감지 안됨)");
      } catch (e) {
        if (e instanceof Error) {
          console.error("💥 setTimeout 내부 try/catch 에서 잡은 에러:", e.message);
          alert(`setTimeout 에러 (ErrorBoundary에 감지 안됨): ${e.message}`);
        }
      }
    }, 1000);
  };

```
1. 버튼 클릭과 같은 유저 인터랙션에 의해 호출되는 이벤트 핸들러 내부에서 발생하는 에러는 기본적으로 에러 바운더리에 의해 감지되지 않습니다. 이벤트 핸들러가 실행되는 시점은 리액트의 **렌더링 과정이 이미 완료**된 이후이거나, 렌더링과는 **별개의 이벤트 루프**에서 동작하기 때문입니다. 리액트는 이벤트 핸들러 내부에서 어떤 일이 일어날지 예측하거나 제어하지 않습니다.
2. fetch() API를 사용한 데이터 요청과 Promise의 콜백 함수 등 비동기적으로 실행되는 코드에서 발생하는 에러 또한 에러 바운더리가 감지하지 못합니다. 비동기 작업은 자바스크립트의 **이벤트 루프와 태스크 큐에 의해 관리**되며 리액트의 렌더링 사이클과는 분리되어 실행되기 때문입니다.
3. setTimeout()이나 setInterval()과 같은 타이머 함수의 콜백 내부에서 발생하는 에러도 에러 바운더리가 감지하지 못합니다. 이런 콜백 함수들은 브라우저의 타이머 API에 의해 스케줄링되고, 지정된 시간이 지난 후 **이벤트 루프를 통해 실행**됩니다. 이는 리액트의 렌더링과는 완전히 독립적인 매커니즘으로 콜백 함수 실행 중 발생하는 에러는 에러 바운더리의 영향권 밖에 있게 됩니다.

```tsx
// whack-a-mole/src/components/NonCapturedErrorsExample.tsx

// ➍ useEffect에서 즉시 에러를 발생시키는 자식 컴포넌트
const ChildWithErrorOnMount = () => {
  useEffect(() => {
    // 이 에러는 렌더링 과정의 일부로 간주되어 ErrorBoundary에 의해 감지됨
    throw new Error("useEffect에서 즉시 발생한 동기적 에러 (감지됨)");
  }, []);
  return <p>이 컴포넌트는 마운트 시 즉시 에러를 발생시킵니다.</p>;
};
```
4. 흥미롭게도, useEffect() 콜백 함수 내부에서 동기적으로 에러가 발생하면, 이 에러는 가장 가까운 에러 바운더리에 의해 감지됩니다. 리액트는 이런 종류의 에러를 컴포넌트 생명 주기의 일부로 간주해 처리하기 때문에 에러 바운더리가 에러를 포착할 수 있습니다. 이렇게 리액트 컴포넌트의 렌더링 생애주기, 즉 재조정 과정에서 발생하는 에러만 감지하기 때문에 특정 버튼을 눌러 에러가 발생하더라도 에러 바운더리에서 선안한 폴백 UI를 보여주려면 다음과 같은 트릭이 필요합니다.

렌더링 에러를 발생시키기 위한 useThrowError() 커스텀 훅
```tsx
// whack-a-mole/src/components/useThrowErrorUseCase.tsx

// ➊ useThrowError 커스텀 훅: 렌더링 단계에서 에러를 발생시켜 ErrorBoundary가 감지하도록 함
export const useThrowError = () => {
  // _errorState는 직접 사용되지 않지만, setErrorState를 통해 에러를 발생시키는 역할을 함
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_errorState, setErrorState] = useState<Error | null>(null); // 타입 Error | null로 명시

  return (error: Error) => { // error 파라미터 타입 Error로 명시
    setErrorState(() => {
      throw error;
    });
  };
};

// useThrowError 훅 사용 예제 컴포넌트
const CarrotPriceUpdater = () => {
  // const [carrotData, setCarrotData] = useState({ price: 1000 }); // 예시 상태
  const throwErrorHook = useThrowError(); // ➋ 커스텀 훅 사용

  const handleUpdatePrice = () => {
    try {
      // 실제 데이터 업데이트 로직이 여기에 들어갈 수 있음
      // 예시를 위해 의도적으로 에러 발생
      console.log("당근 가격 업데이트 시도...");
      throw new Error("당근 가격 서버 통신 실패!");
    } catch (error) {
      if (error instanceof Error) {
        // ➌ 이벤트 핸들러에서 발생한 에러를 throwErrorHook을 통해 렌더링 에러로 전환
        throwErrorHook(error);
      } else {
        throwErrorHook(new Error("알 수 없는 에러 발생"));
      }
    }
  };

  return (
    <div>
      <h3>당근 가격 정보</h3>
      {/* <p>현재 가격: {carrotData.price}원</p> */}
      <button onClick={handleUpdatePrice}>가격 업데이트 (에러 발생시키기)</button>
    </div>
  );
};
```

1. 이벤트 핸들러에서 발생한 에러를 리액트의 에러 바운러디 메커니즘으로 포착할 수 있도록 상태 업데이트 함수 내에서 전달받은 에러를 다시 throw함으로써, 해당 에러를 리액트 렌더링 과정 중 발생한 에러처럼 만들 수 있습니다.
2. 커스텀 훅 useThrowError() 함수를 호출해 throwErrorHook() 함수를 얻어, 명시적으로 에러를 발생시키고 싶은 컴포넌트에서 이 함수를 사용해 에러를 발생시킬 수 있음을 밝힙니다.
3. 이벤트 핸들러 내 try catch 블록에서 잡힌 에러가 throwErrorHook()으로 전달되는 과정을 설명합니다. 이 동작을 통해 이벤트 핸들러 내에서 직접 발생하면 에러 바운더리가 잡지 못하는 현상을 리액트 렌더링 단계의 에러로 효과적으로 변환하여 가장 가까운 에러 바운더리가 이를 감지하고 처리할 수 있습니다.

직접 에러 바운더리를 사용하는 것이 효율적일 수 있으나 검증된 라이브러리를 사용하는 것이 효율적일 수 있습니다. **'react-error-boundary'** 패키지가 있으며, **다양한 프롭스를 지원하여 에러 상황에 따른 UI를 유연하게 제공**할 수 있습니다. 폴백 UI를 함수뿐만 아니라 컴포넌트 형태로도 전달할 수 있고 자체적으로 useErrorHandler() 훅을 제공합니다. 이 훅으로 useThrowError()와 같이 수동으로 전파하는 커스텀 훅 없이도, 이벤트 핸들러 등에서 발생한 에러를 가장 가까운 에러 바운더리로 손쉽게 전달할 수 있어 코드의 간결성을 높여 줍니다.

Sentry 역시 자체 에러 바운더리 컴포넌트를 제공할 때 react-error-boundary를 기반으로 확장하여 사용할 만큼, 안정성과 편의성 면에서 검증되었다고 할 수 있습니다.

## 16.3 컨텍스트 API를 사용한 효과적인 상태 공유

### 16.3.1 프롭스 드릴링이란?
상위 컴포넌트의 정보를 하위 컴포넌트에서 사용하기 위해 깊은 컴포넌트 트리 구조에 따라 프롭스를 전달해야 하는 문제.

리액트에서 컨텍스트는 특정 컴포넌트 트리에서 다루는 객체를 조회하고 사용할 수 있는 문맥을 제공한다고 볼 수 있습니다.

### 16.3.2 컨텍스트 생성하기

```tsx
// whack-a-mole/src/components/useThrowErrorUseCase.tsx

// 1. 컨텍스트를 통해 공유될 값들의 타입을 정의함
type SidebarContext = {
	// ...
}

// 2. React.createContext를 사용하여 SidebarContext 객체 생성
const SidebarContext = React.createContext<SidebarContext | null>(null)

// 3. SidebarContext를 쉽게 사용하기 위한 커스텀 훅
function useSidebar() {
	const context = React.useContext(SidebarContext)
	if(!context) {
		throw new Error("...")
	}
}

const SidebarProvider = () => {
	// ...
	return (
		// 4. 사이드바 관련 컨텍스트 값을 전달할 하위 컴포넌트를 둘러쌈
		// 리액트 19버전 이전까지는 <SidebarContext.Provider>를 사용해야 함
		<SidebarContext value={contextValue}>
			{children}
		</SidebarContext>
	
	)
}
```
1. 컨텍스트 객체에는 state, open 등 사이브바의 상탯값만 전달되는 것이 아닌, 특정 상탯값을 업데이트할 수 있도록 공유된 setOpen(), setOpenMobile() 등의 함수도 존재합니다.
2. 초기 기본값 null을 설정하여 객체 생성. 이렇게 생성된 컨텍스트를 사용해야 하는 커스텀 훅이나 하위 컴포넌트에서 사용됩니다.
3. 생성된 SidebarContext 객체는 그 자체만으로는 아무 정보를 가지고 있지 않으며 하위 컴포넌트에서 이 컨텍스트를 읽으려면 4와 같이 `<SidebarContext>`로 감싸고 value 프롭스로 1에서 정의한 컨텍스트 객체 타입을 준수하는 객체를 생성해야 합니다. 컨텍스트 값은 useContext()를 사용하여 가져올 수 있습니다.
## 16.4 컨텍스트 API의 유스케이스

```jsx
// ch7/jsx/JSXChildren.js

// DataFetcher 컴포넌트 (실제 API 호출은 하지 않음)
const DataFetcher = ({ url, children }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });
  
  useEffect(() => {
    // 실제 API 호출 대신 타이머로 흉내내기
    const timer = setTimeout(() => {
      // 90% 확률로 성공, 10% 확률로 실패
      if (Math.random() > 0.1) {
        setState({
          loading: false,
          error: null,
          data: ['골디', '포티', '래비', '홉스'] // 가상 데이터
        });
      } else {
        setState({
          loading: false,
          error: new Error('데이터를 불러오는데 실패했습니다.'),
          data: null
        });
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [url]);
  
  // children을 함수로 호출하고 상태를 전달
  return children(state);
};

<DataFetcher url="https://api.example.com/rabbits">
	{/* DataFetcher의 children으로 함수를 전달함 */}
	{({ loading, error, data }) => {
	  // 로딩 중 상태 처리
	  if (loading) {
		return <div className="loading">데이터를 불러오는 중...</div>;
	  }
	  
	  // 에러 상태 처리
	  if (error) {
		return <div className="error">에러 발생: {error.message}</div>;
	  }
	  
	  // 데이터 렌더링
	  return (
		<div className="data">
		  <ul>
			{/* ➊ DisplayDataComponent부터 프롭스 드릴링 문제가 재현됨  */}
			<DisplayDataComponent data={data} />
		  </ul>
		</div>
	  );
	}}
  </DataFetcher>
```
1. `<DataFetcher>`와 같은 렌더 프롭스 패턴은 상태를 깊은 계층 구조로 전달해야 하거나, 여러 상태 제공자를 중첩해야 하는 경우 코드의 복잡성이 증가할 수 있습니다. 이 경우 컨텍스트 API가 더 나은 해결책이 될 수 있습니다. 컨텍스트 API를 사용하면 `<DataFetcher>`가 제공하는 상태인 loading, error, data를 컨텍스트로 제공하고 하위의 어떤 컴포넌트에서든 useContext()를 사용하여 해당 상태에 직접 접근할 수 있습니다. 이는 프롭스 드릴링 문제를 해결하고 중첩된 렌더 프롭스로 인한 가독성 저하를 방지하는 데 도움이 됩니다.



### 16.4.1 중간 컴포넌트 계층이 생기고 렌더 프롭스 패턴을 중첩으로 사용할 때
DataFetcher 컴포넌트와 DisplayDataComponent 컴포넌트 사이에 IntermediateComponent가 있을 때는 직접 상태를 사용하지 않지만 하위로 전달되게 구조를 유지해야 합니다. 이는 계층이 깊어질수록 코드의 가독성을 해치고, 프롭스를 계속해서 전달해야하는 부담을 줄 수 있습니다.


### 16.4.2 컨텍스트 API 사용해 개선하기
```tsx
// whack-a-mole/src/components/DataFetcher.tsx

// ➎ useData 커스텀 훅: 컨텍스트를 쉽게 사용하기 위한 훅
function useData<T = any>() {
  const context = useContext(DataContext as React.Context<DataContextType<T> | undefined>);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// 중간 컴포넌트: 이제 props를 전달할 필요 없이 children만 렌더링
const IntermediateComponentWithContext = ({ children }) => (
  <div className="intermediate-wrapper" style={{ border: '1px solid green', padding: '10px', margin: '10px 0' }}>
    <p style={{ fontWeight: 'bold', color: 'green' }}>중간 컴포넌트 영역 (컨텍스트 사용)</p>
    {children} {/* 일반적인 ReactNode로 children 처리 */}
  </div>
);

// 데이터를 실제로 표시하는 컴포넌트 (컨텍스트 사용)
const DisplayDataComponentWithContext = () => {
  const { loading, error, data, refetch } = useData<string[]>(); // useData 훅으로 상태 직접 접근

  if (loading) {
    return <div className="loading">컨텍스트: 데이터 로딩 중...</div>;
  }
  if (error) {
    return <div className="error">컨텍스트: 에러 발생 - {error.message} <button onClick={refetch}>재시도</button></div>;
  }
  return (
    <div className="data-display">
      <h4>컨텍스트로 가져온 데이터 목록:</h4>
      <ul>
        {Array.isArray(data) ? data.map((item, index) => (
          <li key={index}>{item}</li>
        )) : <li>데이터가 없습니다.</li>}
      </ul>
      <button onClick={refetch}>목록 새로고침</button>
    </div>
  );
};

// 앱 컴포넌트 (컨텍스트 사용)
const AppWithIntermediateContext = () => (
  <DataProvider url="https://api.example.com/widgets">
    <IntermediateComponentWithContext>
      <DisplayDataComponentWithContext />
    </IntermediateComponentWithContext>
  </DataProvider>
);

```

1. 컨텍스트를 쉽게 사용하기 위한 커스텀 훅
2. 더 이상 children이 함수 형태일 것이라고 가정하거나 상태를 전달하는 역할을 하지 않습니다. props.children을 렌더링하는 컴포넌트가 됩니다.
3. useData() 훅을 사용하여 필요한 상태에 직접 접근.
4. 계층 구조가 단순화 되었습니다. `<DataProvider>`가 최상위에서 상태를 제공하면, 그 하위의 어떤 컴포넌트도 useData()훅을 통해 상태에 접근할 수 있습니다.

   

## 16.5 컨텍스트 API와 리렌더링
컨텍스트 API는 기본적으로 프롭스 드릴링을 피하기 위한 도구입니다. 컨텍스트 API를 주요 상태관리 전략으로 사용할 때 발생할 수 있는 리렌더링 문제와 기타 주의점들이 있습니다.
### 16.5.1 컨텍스트 제공자의 value 프롭스 메모이제이션
컨텍스트 제공자를 포함하는 상위 컴포넌트가 리렌더링될 때, value 프롭스로 전달되는 객체나 배열이 매번 새롭게 생성되면, 컨텍스트를 구독하는 모든 하위 컴포넌트들이 불필요하게 리렌더링될 수 있습니다. 이는 객체의 참조 값이 달라지기 때문에 발생합니다. 이 문제는 useMemo() 훅을 사용하여 value 프롭스를 메모이제이션해 해결할 수 있습니다. useMemo()는 의존성 배열에 포함된 값들이 변경될 때만 새로운 객체를 생성하므로, vlaue 프롭스의 참조 안정성을 보장할 수 있습니다.

```tsx
// whack-a-mole/src/component/DataFetcher.tsx

  const contextValue = useMemo(() => ({ // 1. useMemo()로 컨텍스트 값들을 메모이제이션함
    loading,
    error,
    data,
    refetch: fetchData
  }), [loading, error, data, fetchData]);

  return (
    // React 19 이전: <DataContext.Provider value={contextValue}>
    <DataContext value={contextValue}>
      {children}
    </DataContext>
  );
```

1. `<DataContext>`의 value props로 전달되는 contextValue는 useMemo()를 사용하여 메모이제이션합니다. loading, error, data,  fetchData()가 변경될 때만 contextValue가 생성되므로 `<DataContext>`를 포함하는 컴포넌트가 리렌더링되더라도 이 컨텍스트를 사용하는 자식 컴포넌트의 리렌더링 횟수를 줄일 수 있습니다.

### 16.5.2 컨텍스트 분리해서 리렌더링 영향 범위 줄이기

하나의 거대한 컨텍스트에 모든 상태를 담아둘 때, 여러 상태 중 하나라도 변경되면, 모든 컴포넌트가 리렌더링됩니다. useContext() 훅을 통해 컨텍스트를 구독하는 컴포넌트는 컨텍스트 값의 특정 부분만 선택적으로 구독할 수 없기 때문에 컨텍스트를 관심사별로 분리하는 것이 효과적입니다.

```tsx
// whack-a-mole/src/context.SplitContextExample.tsx

const MonolithicContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 모든 설정을 하나의 객체로 묶어 제공
  const settingsValue = useMemo(() => ({
    theme, // 테마 상태
    notificationsEnabled, // 1. 알림 설정 상태
    userPreferences: { fontSize: 'medium' } // 이 값은 변경되지 않는다고 가정
  }), [theme, notificationsEnabled]);

  return (
    <AppSettingsContext value={settingsValue}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>테마 변경</button>
      <button onClick={() => setNotificationsEnabled(n => !n)}>알림 설정 변경</button>
      {children}
    </AppSettingsContext>
  );
};

export const App = () => {
	return (
		<div>
			<MonolithicContextProvider>
				{ /* 2. 다ㄴ일 컨텍스트 사용 시 모든 컴포넌트가 리렌더링됨 */ }
				<ThemeDisplay />
				<NotificationToggle />
			</MonolithicContextProvider>
		</div>
	)
}
```

1. MonolithicContextProvider는 서로 연관이 없는 테마 상태와 알림 설정 상태를 같은 컨텍스트 객체에서 제공합니다.
2. 이 경우 두 상태중 하나만 변경되어도 불필요하게 리렌더링 됩니다.


```tsx
// whack-a-mole/src/context/SplitContextExample.tsx

const SeparatedContextProvider = ({ children }: { children: ㅌReact.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 테마 관련 상태만 포함하는 컨텍스트 값
  // 단일 컨텍스트에서는 theme, notificationsEnabled 등 모든 상태가 하나의 객체에 포함됨
  const themeValue = useMemo(() => ({ theme }), [theme]);

  // 알림 설정 관련 상태만 포함하는 컨텍스트 값
  // 단일 컨텍스트에서는 이 값의 변경이 theme를 사용하는 컴포넌트까지 리렌더링 시킴
  const notificationsValue = useMemo(() => ({ notificationsEnabled }), [notificationsEnabled]);

  return (
    // 1. ThemeContext.Provider는 theme 상태만 제공함
    // 따라서 theme 상태가 변경될 때만 이 컨텍스트를 구독하는 컴포넌트가 리렌더링됨
    <ThemeContext.Provider value={themeValue}>
      {/* 2. NotificationsContext.Provider는 notificationsEnabled 상태만 제공함 */}
      {/* 이를 통해 notificationsEnabled 상태 변경이 ThemeContext를 사용하는 컴포넌트에 영향을 주지 않음 */}
      {/* 단일 컨텍스트를 사용했다면, 알림 설정 변경 시 테마 관련 컴포넌트도 불필요하게 리렌더링될 수 있음 */}
      <NotificationsContext.Provider value={notificationsValue}>
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>테마 변경</button>
        <button onClick={() => setNotificationsEnabled(n => !n)}>알림 설정 변경</button>
        {children}
      </NotificationsContext.Provider>
    </ThemeContext.Provider>
  );
};

export const App = () => {
  return (
    <div>
      <h2>단일 거대 컨텍스트 예시</h2>
      <MonolithicContextProvider>
        {/* 단일 컨텍스트 사용 시 모든 컴포넌트가 리렌더링됨 */}
        <ThemeDisplay />
        <NotificationToggle />
      </MonolithicContextProvider>

      <hr style={{ margin: '20px 0' }} />

      <h2>분리된 컨텍스트 예시</h2>
      <SeparatedContextProvider>
        {/* 3. 분리된 컨텍스트 사용 시 해당 컴포넌트만 리렌더링됨 */}
        <SeparatedThemeDisplay />
        <SeparatedNotificationToggle />
      </SeparatedContextProvider>
    </div>
  );
};

```

1,2 이 구조에서는 각 컨텍스트 제공자가 독립적인 자신의 상태를 관리하고 하위 컴포넌트들은 3. 필요한 컨텍스트만 선택적으로 구독할 수 있습니다. NotificationContext 에 전달된 notificationsValue가 변경되어도 SeparatedThemeDisplay에서 관련 컨텍스트 값을 참조하지 않으면 리렌더링되지 않습니다. 이를 통해 상태 변경의 파급 효과를 효과적으로 제어하고 애플리케이션 성능을 향상시킬 수 있습니다.
### 16.5.3 셀렉터 패턴 사용해 최적화하기

리덕스, 조타이와 같은 라이브러리는 내부적인 최적화 메커니즘을 통해 효과적으로 셀렉터 기능을 제공합니다.
하지만 컨텍스트 API는 개발자가 스스로 구현하지 않는 이상 셀렉터 패턴을 사용하기 어렵습니다.

```tsx
// whack-a-mole/src/context/SplitContextExample.tsx

const useCountSelector = (selector) => {
	const context = useContext(CounterContext) // 1
	return useMemo(() => selector(context), [context, selector]) // 2
}

```
1. 여러 상탯값이 합쳐진 CounterContext를 커스텀 훅에서 참조하고 있습니다.
2. useMemo를 사용해 useCountSelector에서 반환하는 상탯값이 context와 selector가 변경되었을 때만 새로운 값을 반환하게 합니다. useMemo를 사용해도 의도와 다르게 최적화가 진행되지 않습니다. 왜냐하면 CounterContext의 일부 상탯값이 변경되면 context는 항상 새로운 값이 생성되어 useMemo가 무용지물이 되기 때문입니다.

현재 리액트에서 정식으로 제공하는 셀럭터 유틸 함수는 없습니다. 따라서 전역 상태 라이브러리 없이 셀렉터 패턴을 적용하고 싶다면 `use-context-selector`패키지를 살펴보시기 바랍니다.

### 16.5.4 고차 컴포넌트와 memo( ) 활용하기

특정 상황에서만 컨텍스트를 사용하게 될 경우 고차 컴포넌트와 React.memo()를 사용해 컴포넌트를 최적화 할 수 있습니다.

```tsx
// whack-a-mole/src/context/withCounter.tsx

// 1. 컴포넌트를 래핑하는 고차 컴포넌트
const withCounter = (HeavyComponent: React.ComponentType<any>) => {
	// 2. 메모이제이션 적용
	const HeavyComponentMemo = React.memo(HeavyComponent)
	return (props: any) => {
	// 3. 컨텍스트에서 카운트값을 가져옴
		const {count} = useContext(CounterContext)
		return <HeavyComponentMemo {...props} count={count} />
	}
}
```

1. 고차 컴포넌트가 무거운 연산이 필요한 컴포넌트를 인수로 받아 또 다른 컴포넌트를 반환합니다.
2. 인수로 전달되는 컴포넌트를 memo()로 감싸 전달되는 프롭스가 변경되지 않으면 리렌더링되지 않도록 합니다.
3. 스프레드 연산자로 전달되는 props는 HeavyComponent를 withCounter()로 감싸 사용하는 부모 컴포넌트에서 전달되는 값이기 때문에 HOC가 반환하는 `(props) => <HeavyComponentMemo />`자체는 CounterContext가 변경되거나 고차 컴포넌트를 사용하는 부모로부터 새로운 프롭스를 받으면 리렌더링됩니다. 이때 `<HeavyComponentMemo>`는 memo()로 최적화되어 있으므로, 고차 컴포넌트로부터 전달받은 프롭스(원래 부모에게서 온 프롭스와 컨텍스트에서 추출한 count)가 이전 렌더링과 비교했을 때 실제로 변경되었을 때만 리렌더링됩니다.

지금까지 컨텍스트 최적화에 대한 유용한 대안을 알아보았습니다. 이 방법은 라이브러리 도입이 부담스러운 상황에서 효과적인 해결책이 될 수 있습니다.

## 16.6 서스펜스 사용해 컴포넌트 내 비동기 작업 수행하기

리액트에서 서스펜스는 애플리케이션 내 비동기 작업이 완료될 때까지 UI 렌더링을 선언적으로 일시 중단`Suspend`하고, 이 기간 동안 유저에게 로딩 중임을 알리는 폴백 UI를 보여줄 수 있도록 지원하는 메커니즘입니다. **비동기 데이터 가져오기**, **지연 로딩을 사용해 코드 분할하기** 등의 작업을 할 수 있습니다. 리액트 18버전 **동시성 기능과 통합**되어 강력한 기능을 제공합니다.

### 16.6.1 서스펜스의 역사와 발전

16.6 버전에서 React.lazy() API와 함께 처음 실험적 버전으로 도입되었습니다. 폴백 UI가 주목적이었습니다. 
코드 분할은 번들을 여러 개의 작은 청크로 나누어, 실제로 필요한 코드만 로드하는 기법으로 이를 통해 초기 번들 크기를 줄이고 로딩 성능을 개선할 수 있었습니다.
다음 예제는 코드를 여러 페이지의 컴포넌트로 나눠져 있는 대규모 애플리케이션에서 페이지 단위로 코드 분할을 수행하는 코드를 보여줍니다.

리액트 라우터 라이브러리를 사용해 라우트 기반 코드 분할
```js
// ch16/react-17/src/App.js

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Home 컴포넌트를 동적으로 임포트함
// 해당 라우트에 접근할 때까지 Home 컴포넌트의 코드는 로드되지 않음
const Home = lazy(() => import('./routes/Home'));
// About 컴포넌트를 동적으로 임포트함
const About = lazy(() => import('./routes/About'));
// Profile 컴포넌트를 동적으로 임포트함
const Profile = lazy(() => import('./routes/Profile'));

// 애플리케이션의 메인 컴포넌트
const App = () => (
  // BrowserRouter를 사용하여 라우팅 기능을 활성화함
  <Router>
    {/* 네비게이션 링크 목록 */}
    <nav>
      <ul>
        <li>
          {/* Home 페이지로 이동하는 링크 */}
          <Link to="/">Home</Link>
        </li>
        <li>
          {/* About 페이지로 이동하는 링크 */}
          <Link to="/about">About</Link>
        </li>
        <li>
          {/* Profile 페이지로 이동하는 링크 */}
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
    {/* Suspense는 하위 컴포넌트가 로드될 때까지 fallback UI를 보여줌 */}
    {/* lazy로 로드되는 컴포넌트들을 감싸서 사용함 */}
    <Suspense fallback={<div>Loading...</div>}>
      {/* Routes는 여러 Route 컴포넌트를 그룹화하고, 현재 URL에 맞는 첫 번째 Route를 렌더링함 */}
      <Routes>
        {/* 루트 경로 ("/")에 Home 컴포넌트를 매칭함 */}
        <Route path="/" element={<Home />} />
        {/* "/about" 경로에 About 컴포넌트를 매칭함 */}
        <Route path="/about" element={<About />} />
        {/* "/profile" 경로에 Profile 컴포넌트를 매칭함 */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  </Router>
);

```

1. React.lazy()를 통해 임포트되는 컴포넌트는 동적으로 필요한 순간에만 로딩됩니다.
2. 동적 로딩되는 컴포넌트를 보여주려면 해당 컴포넌트가 다운로드되기까지 보여질 폴백 UI를 `<Suspense>`컴포넌트에 프롭스로 제공해야 합니다.
3. `/profile -> /about`으로 처음 이동하는 경우 `<About />`에 해당하는 번들 파일을 내려받기까지 `<Suspense>`의 폴백 UI가 렌더링됩니다. `<Suspense>`로 둘러싸인 컴포넌트들은 폴백 UI가 보여질 때는 마운트되어도, useEffect()가 호출되어도 안됩니다.

리액트 17버전까지의 서스펜스를 레거시 서스펜스라고 부르는데 **레거시 서스펜스**는 당시 **서버 사이드 렌더링의 동기적 특성과 서스펜스의 비동기적 필요성의 충돌**로 인해 서버 사이드 렌더링 환경에서 사용하지 못하는 한계를 가졌으며, `<Suspense>`로 둘러싸인, **지연되는 컴포넌트의 형제 컴포넌트의 경우 폴백 UI가 보이는 동안에도 DOM에 마운트 되거나 useEffect()가 호출되는 문제**가 있었습니다. 


```js
// ch16/react-17/src/routes/Profile.js


// 길어서 PASS
```

리액트 18버전에서는 createRoot() API를 통해 동시성 기능이 정식으로 도입되면서 서스펜스가 **서버 사이드 렌더링에도 동작할 수 있도록 개선**되었으며, **`<Suspense>`내부의 어떤 컴포넌트가 데이터를 기다리며 일시 중단되면 리액트는 해당 컴포넌트 뿐만 아니라 그 형제 컴포넌트들의 렌더링 및 이펙트 실행까지도 함께 지연**시킵니다.

useTransition(), useDeferredValue()와 같은 동시성 훅과 함께 사용되어, 긴급하지 않은 UI 업데이트로 인해 애플리케이션 반응성이 저하되는 것을 막고 더욱 정교한 로딩상태 관리 및 화면 전환 제어가 가능하게 되었습니다. 

19버전에서는 애플리케이션의 인지 성능에 개선이 이루어졌습니다.

18버전까지는 어떤 컴포넌트가 `<Suspense>`에 의해 일시중단되면, 리액트는 해당 컴포넌트의 형제 컴포넌트들을 먼제 렌더링하려고 시도합니다. **형제 컴포넌트들의 렌더링 과정이 끝난 이후에서야 가장 가까운 `<Suspense>` 경계의 폴백 UI가 커밋되어 실제 화면에 표시**되기 때문에 유저는 로딩 상태를 인지하기까지 오랜 시간이 걸리는 경우가 있었습니다.

19버전부터는 형제 컴포넌트들을 기다리지 않고 `<Suspense>` 에 의해 중지된 컴포넌트의 폴백 UI를 먼저 커밋합니다.
### 16.6.2 에러 바운더리와 서스펜스

리액트는 특정 상황에 대한 폴백UI를 선언적으로 처리할 수 있는 두 가지 메커니즘을 제공합니다. 에러 바운더리와 서스펜스입니다.

서스펜스는 렌더링이 지연될 동안 대체 UI를 노출하고 에러 바운더리는 에러가 복구되기까지 에러 대체 UI를 노출합니다.

`<Suspense>`안에서 비동기 렌더링을 수행하는 도중 에러가 발생할 수 있음을 기억하고 서스펜스 상단에 에러 바운더리 컴포넌트를 위치시키는 것이 이상적입니다.
리액트 18버전 이후 버전에서는 서버 사이드 렌더링 중 서스펜스 내부에서 에러가 발생한다면, 서버에서는 서스펜스에 선언된 폴백 UI를 렌더링하고 **에러가 발생한 부분 외의 다른 부분을 계속 정상적으로 렌더링을 수행**할 수 있습니다. 페이지의 일부에서 에러가 발생하더라도 **전체 페이지의 가용성이 유지**되며, 유저 경험이 향상됩니다.
클라이언트에서는 에러가 발생했던 컴포넌트의 렌더링을 다시 한번 시도하고 에러가 다시 발생하면 가장 가까운 위치의 에러 바운더리 컴포넌트의 폴백 UI를 보여주게 됩니다. 

만약 서버에서 비동기 렌더링이 수행되는 것을 방지하고 싶거나 레거시 서스펜스를 사용해서 서버에서 서스펜스를 사용하는 것이 불가능한 상황이라면 window 객체를 참조해 클라이언트 사이드 렌더링에서만 비동기 렌더링이 동작하게 할 수 있습니다. 이런 클라이언트 전용 `<Suspense>` 처리 방식을 보여주는 예제 코드를 보겠습니다.

동적로딩을 사용해 클라이언트에서만 비동기 렌더링을 시작하게 하는 방식
```js
// ch16/suspense/ClientOnlySuspense.js
```

이 코드는 서버에서 렌더링될 때는 서스펜스를 사용하지 않는 조건부 렌더링을 사용합니다.

동적 로딩을 사용해 클라이언트에서만 비동기 렌더링을 시작하는 방식
```js
// ch16/suspense/MyAsyncComponent.js
```
`<ClientOnlySuspense>`컴포넌트는 window 객체를 확인해 서버 환경에서는 에러를 발생시켜 `<Loading>`컴포넌트가 렌더링되게 합니다.
### 16.6.3 서스펜스 내부 구현과 작동 원리

`<Suspense>`가 자식 컴포넌트 내부에서 발생하는 비동기 작업을 감지하고, 적절한 시점에 폴백UI를 보여주거나 실제 콘텐츠로 전환하는 것은 자바스크립트의 throw와 try ... catch를 활용한 아이디어입니다.

#### 1단계: 신호 보내기 - 컴포넌트가 Promise를 throw

서스펜스와 호환되는 컴포넌트는 렌더링을 시도할 때, 만약 필요한 데이터나 코드가 아직 준비되지 않았다면 렌더링을 멈추고 프로미스 객체를 throw 합니다. 여기서 **throw**는 전동적이 '에러'가 아니라, '**아직 렌더링할 준비가 되지 않았으니 잠시 중단하고 이 프로미스가 완료될 때까지 기다려 달라**'는 일종의 신호로 사용 됩니다

```tsx
// ch16/suspense/MyData.tsx

```
#### 2단계: 신호 감지하기 - catch로 프로미스를 잡는 리액트
리액트 조정자`Reconciler`는 모든 컴포넌트를 렌더링할 때, 내부적으로 try...catch 구문을 사용합니다. `<MyData>` 컴포넌트가 프로미스를 던지면 catch 블록이 프로미스를 가로챕니다.

```js
// ch16/suspense/renderRoot.js
```

#### 3단계: 폴백 UI 렌더링 - WIP 트리 조작

`<Suspense>` 컴포넌트에 해당하는 파이버 노드는 이제 하위 트리에서 일시 중단이 발생했음을 인지하고 폴백UI를 렌더링할 책임을 가집니다.
1. WIP 트리 준비: Current트리를 복사하여 WIP트리를 만듭니다.
2. 자식 교체: WIP 트리에서 서스펜스 파이버노드의 child를 기존의 `<MyData>` 대신 props.fallback에 있던 `<Spinner>`로 교체합니다.
3. 기존 자식 보관: `<MyData>`는 사라지지 않고 나중에 렌더링하기 위해 서스펜스 파이버 노드의 pendingProps.children 같은 속성에 잠시 보관해둡니다.
4. 커밋: 폴백 UI를 자식으로 가진 WIP트리가 완성되면, 리액트는 이를 커밋하여 실제 화면에 반영합니다. 이제 유저는 스피너를 보게 됩니다.

#### 4단계: 재개 예약 및 완료 대기 - Push 방식의 리스너

리액트는 catch한 프로미스가 완료되는 것을 계속 확인(폴링)하지 않고 대신 프로미스가 완료되면 스스로 알려주는 푸시 방식을 사용합니다. 프로미스 객체에 **.then()을 사용하여 콜백 함수를 부착**해두고, **프로미스 작업이 완료되면 이 콜백이 실행되도록 예약**합니다. 이 콜백의 역할은 '이제 데이터가 준비되었으니, 중단되었던 컴포넌트 렌더링을 다시 시작해달라'고 리액트 스케줄러에 알리는 겁니다.

#### 5단계: 실제 콘텐츠 렌더링 - 두 번째 커밋

프로미스가 완료되어 콜백이 실행되면, 리액트는 새로운 렌더링을 시작합니다.

1. 새로운 WIP트리: 다시 한번 Current 트리를 복사
2. 원래 자식 복원: 보관했던 원래 자식을 WIP트리의 서스펜스 파이버 노드의 child로 설정.
3. 커밋: 실제 화면에 MyData 반영

이 모든 과정이 매끄럽게 동작하려면 throw라는 프로미스가 리렌더링 시에도 동일한 인스턴스여야 합니다. 렌더링할 때마다 새로운 프로미스를 throw한다면 무한 폴백 상태에 빠지게 됩니다. 따라서 서스펜스를 올바르게 사용하려면, **컴포넌트 외부에서 생성된 프로미스를 프롭스로 전달**하거나, react-query, 릴레이, 혹은 Next.js의 데이터 패칭 기능처럼 **프로미스의 생성과 결과를 자체적으로 캐싱해주는 라이브러리를 사용**해야 합니다.

## 16.7 use( ) 사용해 컨텍스트와 프로미스 읽기
리액트 19버전에서 use()라는 새로운 훅이 등장. 
use()는 조건문이나 반복문 안에서도 호출될 수 있음.
리액트 함수 컴포넌트 혹은 다른 훅 내부에서만 호출할 수 있다는 규칙을 동일.

use()는 비동기 작업을 다룰 때 아직 준비되지 않았다면 서스펜스를 통해 선언적으로 로딩 상태를 관리하고, 데이터가 준비되면 마치 동기 코드처럼 값을 반환할 수 있음. 

### 16.7.1 컨텍스트값 읽기

useContext()는 컴포넌트 최상위 레벨에서만 호출되어야 합니다.

훅 규칙을 따르기 위해 컴포넌트 최상단에 선언된 useContext()
```tsx
// whack-a-mole/src/use/EarlyReturnContextExample.tsx

import React, { useContext } from 'react';
import { ThemeContext, ConditionalReaderProps } from './shared';

function ConditionalReaderWithUseContext({ isActive }: ConditionalReaderProps) {
  // ➊ 훅의 규칙 때문에, isActive 값과 관계없이 항상 최상위에서 호출됨
  const theme = useContext(ThemeContext);

  // `isActive`가 false이면, 컨텍스트 값을 사용하지 않음에도 불구하고
  // 이미 컨텍스트 읽기 작업은 완료된 상태임
  if (!isActive) {
    return <p>컴포넌트 비활성화 상태: 컨텍스트 읽기는 수행했으나 사용하지 않음.</p>;
  }

  if (theme === null) {
    return <p>테마 정보 없음.</p>;
  }

  return <p style={/* ... */}>현재 활성 테마 (<code>useContext</code> 사용): {theme}</p>;
}
```
1. isActive가 false이라도 불필요하게 ThemeContext를 찾아 값을 읽어오는 작업을 하게 됩니다.

`use` API를 사용하여 조건부로 컨텍스트를 읽는 컴포넌트
```tsx
// whack-a-mole/src/use/EarlyReturnExample.tsx


// `use` API를 사용하여 조건부로 컨텍스트를 읽는 컴포넌트
// 이 컴포넌트의 정의가 사용자의 문서에 포함될 핵심 예제 코드임
function ConditionalReaderWithUse({ isActive }: ConditionalReaderProps) {
  // isActive가 false이면, 컨텍스트를 읽기 전에 조기 반환함
  // 이는 불필요한 컨텍스트 접근 및 관련 로직 실행을 방지함
  if (!isActive) {
    return <p>컴포넌트 비활성화 상태: 컨텍스트 읽기를 건너뜀.</p>;
  }

  // isActive가 true인 경우에만 `use` 훅을 호출하여 컨텍스트 값을 읽음
  // `use` API는 조건문이나 반복문 내부에서도 호출이 가능하여,
  // ➊ 기존 `useContext`의 최상위 레벨 호출 규칙으로부터 자유로움
  const theme = use(ThemeContext);

  // 컨텍스트 값이 없는 경우 (예: ThemeContext.Provider가 상위에 없거나 value가 null인 경우) 처리
  if (theme === null) {
    return <p>테마 정보를 찾을 수 없음 (ThemeProvider 설정 및 값 확인 필요).</p>;
  }

  // 성공적으로 컨텍스트 값을 읽어와 UI에 표시함
  return <p style={{ color: theme === 'dark' ? 'white' : 'black', background: theme === 'dark' ? 'black' : 'white', padding: '10px', border: '1px dashed #ccc' }}>현재 활성 테마 (<code>use</code> 사용): {theme}</p>;
}
```
1. isActive의 값에 따라 컨텍스트를 선택적으로 읽어올 수 있어 효율적임.

호출 시점의 유연성을 제외하면 use()의 핵심 동작 방식은 useContext()와 동일함.

### 16.7.2 프로미스 결과 풀어내기

지금까지는 useEffect()를 사용해 비동기 데이터를 다루었습니다. 여기는 몇 가지 단점이 존재합니다.

1. 워터폴 현상: 부모 - 자식 순으로 마운트되고 데이터를 가져오는것이 순차적으로 발생
2. 복잡한 상태관리: API 응답에 대한 로딩, 에러 상태를 직접 관리
3. 경쟁 상태: 데이터가 여러번 요청될 때, 이전 요청보다 나중에 시작된 요청이 먼저 완료되어 오래된 데이터가 화면에 표시되는 경쟁 상태`Race condition` 문제가 발생 가능

use()와 `<Suspense>`를 같이 사용해 우아하게 해결할 수 있습니다. '데이터를 가져오면서 동시에 렌더링한다`Render-as-You-Fetch`'라 불립니다.
핵심 아이디어는 **데이터 요청을 컴포넌트 렌더링과 분리**하여, **최대한 일찍 병렬적으로 시작**하는 겁니다.

1. useEffect(): 렌더링 -> 마운트 -> fetch -> 리렌더링
2. `<Suspense>`: fetch 시작과 렌더링이 동시에 병렬적으로 진행. 완성된 UI를 빨리 노출.

`<Suspense>`가 UI를 선언적으로 관리하고, use() 훅이 프로미스의 결과가 준비될 때까지 컴포넌트 **렌더링을 일시 중단**시킴으로써 가능해집니다.

```tsx
// ch16/react-19/src/ProfilePageWithUse.tsx

// 프로미스들을 담는 resource 객체의 타입 정의
interface ProfileResource {
  userPromise: Promise<{ name: string }>;
  postsPromise: Promise<{ id: number; text: string }[]>;
}

// 컴포넌트 렌더링이 시작되기 전에 데이터 요청을 시작함
const resource = createProfileResource();

// 사용자 상세 정보를 표시하는 컴포넌트
// userPromise를 프롭스로 받음
function ProfileDetails({ userPromise }: { userPromise: ProfileResource['userPromise'] }) {
  // 2. use() API를 사용하여 전달받은 사용자 정보 프로미스를 읽음
  const user = use(userPromise);
  return <h1>{user.name}</h1>; // 사용자 이름 표시
}

// 사용자 게시물 목록을 표시하는 컴포넌트
// postsPromise를 프롭스로 받음
function ProfilePosts({ postsPromise }: { postsPromise: ProfileResource['postsPromise'] }) {
  // use() API를 사용하여 전달받은 게시물 목록 프로미스를 읽음
  const posts = use(postsPromise);
  return (
    <ul>
      {/* 게시물 배열을 순회하며 각 게시물의 내용을 리스트 아이템으로 표시함 */}
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}

// 프로필 페이지 전체를 구성하는 메인 컴포넌트
// resource 객체를 프롭스로 받음
export default function ProfilePageWithUse({ resource }: { resource: ProfileResource }) {
  return (
    // 최상위 Suspense: ProfileDetails 또는 ProfilePosts 내부에서 데이터 로딩 중일 때 fallback을 표시함
    <Suspense fallback={<h2>페이지 로딩 중...</h2>}>
      {/* userPromise를 ProfileDetails 컴포넌트에 프롭스로 전달함 */}
      <ProfileDetails userPromise={resource.userPromise} />
      {/* 중첩된 Suspense: ProfilePosts 데이터만 로딩 중일 때 fallback을 표시함 */}
      <Suspense fallback={<p>게시물 로딩 중...</p>}>
        {/* postsPromise를 ProfilePosts 컴포넌트에 프롭스로 전달함 */}
        <ProfilePosts postsPromise={resource.postsPromise} />
      </Suspense>
    </Suspense>
  );
}

```

1. resource 객체 생성을 통해 데이터 요청이 컴포넌트 렌더링 전에 시작됩니다. userPromise()와 postPromise()는 병렬적으로 동시에 요청됩니다.
2. ProfileDetails, ProfilePosts 컴포넌트는 직접 데이터 요청하지 않고 프롭스로 받은 프로미스를 use()에 넘겨 결과를 풀어냅니다.
3. Suspense를 중첩하여 점진적인 로딩 UI를 쉽게 구현할 수 있습니다.

이 패턴의 핵심 규칙은 컴포넌트가 리렌더링되더라도 use()에 전달되는 프로미스는 동일한 인스턴스여야 한다는 겁니다. 렌더링 시마다 새로운 프로미스를 생성하면 무한 로딩에 빠지게 됩니다.

안티 패턴 예시
```tsx
// ch16/react-19/src/UserProfileWrong.tsx

function UserProfileWrong() {
  // ➊ 렌더링 시마다 매번 새로운 프로미스가 생성됨
  const userPromise = fetchUser(); 
  // ➋ use()는 매번 새로운 프로미스를 받아, 영원히 '대기' 상태로 판단함
  const user = use(userPromise);

  return <h1>{user.name}</h1>;
}
```

위 코드는 무한 루프를 만듭니다.
1. 첫 렌더링: 1. fetchUser() -> promiseA 생성 -> use(promiseA)가 던져짐 -> Suspense 폴백 표시
2. promiseA완료: 리액트가 리렌더링 시도
3. 리렌더링: 1. fetchUser() 또 호출 -> promiseB 생성 -> use(promiseB)가 던져짐 -> Suspense 폴백 표시

프로미스는 항상 컴포넌트 외부에서 생성하여 프롭스로 전달하거나, react-quert, SWR처럼 캐싱을 관리해주는 라이브러리를 사용해야 합니다.


### 16.7.3 use( )는 어떻게 조건문 안에서 호출될 수 있을까?

컴포넌트 내에 선언된 리액트 훅은 연결 리스트 구조로 순서대로 관리됩니다.
use()는 호출될 때 리액트의 내부적인 훅 리스트에 의존하여 상태를 저장하거나 검색하지 않습니다. 대신, 인자로 받은 값(리액트 내부적으로는 Usable이라 불림)을 즉시 풀어내서`unwrap` 반환하는데 특화된 독립적인 처리기에 가깝습니다.
use()는 인자의 타입이 프로미스인지 컨텍스트인지에 따라 다른 메커니즘을 사용하며, 이 두방식 모두 다른 훅들의 연결 리스트 구조와는 무관하게 동작합니다.

1. 프로미스 - 객체 자체에 상태 기록하기: 프로미스 상태인 pending, fullfilled, rejected, 그리고 값과 에러는 프로미스 객체 자체에 부착됩니다. use()는 이 부착된 정보를 읽어 서스펜스 또는 값을 반환합니다. 이 과정은 파이버 노드에서 관리하는 훅 리스트인 memoizedState와 독립적으로 발생합니다.
2. 컨텍스트 - 파이버 트리 탐색하기: use()가 컨텍스트를 인자로 받으면 내부적으로 readContext()함수를 호출합니다. 이 함수는 현재 컴포넌트의 파이버 노드에서부터 부모 방향으로 트리를 거슬러 올라가며 가장 가까운 컨텍스트 공급자(provider)를 찾아 그 값을 읽어 옵니다.

기존 훅이 호출될 때 파이버 노드에서 관리하는 훅의 리스트를 탐색한다면
use() API는 이와 다르게 훅들의 상대적인 순서나 인덱스와 같은 위치와는 무관하게 독립적으로 동작됩니다.

리액트 19버전에서 사용되는 use() 로직 예제
```js
// whack-a-mole/src/use/thenable.js

// 리액트 19에서 사용되는 use() 로직 예제
function use(usable) {
  // ➊ 인자로 전달된 값이 Promise인지 확인
  if (isPromise(usable)) {
    return handlePromise(usable);
  } else if (isContext(usable)) {
    return readContextValue(usable);
  } else {
    throw new Error("Unsupported type for use()");
  }
}

function handlePromise(promise) {
  // ➋ Promise 객체 자체에 저장된 상태(status, value, reason)가 있는지 확인
  //    (React는 Promise 객체에 'status', 'value', 'reason' 같은 커스텀 속성을 추가해서 관리)
  if (promise.status === 'fulfilled') {
    return promise.value;
  } else if (promise.status === 'rejected') {
    throw promise.reason;
  } else if (promise.status === 'pending') {
    // 이미 pending 상태로 추적 중이면, 계속해서 SuspenseException을 throw
    throw SuspenseException; // React 내부에서 이 예외를 잡아서 Suspense 처리
  } else {
    // ➌ 처음 보는 Promise라면, 상태 추적 로직을 설정
    promise.status = 'pending';
    promise.then(
      value => {
        promise.status = 'fulfilled';
        promise.value = value;
        // 리액트에게 이 Promise에 의존하는 컴포넌트를 다시 렌더링하도록 알림
        scheduleReRenderForPromise(promise);
      },
      error => {
        promise.status = 'rejected';
        promise.reason = error;
        // 리액트에게 이 Promise에 의존하는 컴포넌트를 다시 렌더링하도록 알림 (에러 처리)
        scheduleReRenderForPromise(promise);
      }
    );
    // ➍ 현재 렌더링을 중단시키기 위해 특별한 예외를 throw
    throw SuspenseException; // 리액트 내부에서 이 예외를 잡아서 Suspense 처리
  }
}

function readContextValue(context) {
  // ➎ 현재 컴포넌트 트리 상에서 가장 가까운 Context Provider를 찾아서 값을 읽어옴
  return findProviderValue(context);
}

// --- 헬퍼 함수 정의 ---
// SuspenseException: 리액트 내부에서 사용되는 특별한 예외 객체 (렌더링 중단용)
// scheduleReRenderForPromise(promise): 해당 promise를 기다리던 컴포넌트를 다시 렌더링 큐에 넣음
// findProviderValue(context): Context Provider로부터 값을 가져옴
```



## 학습 마무리 | 핵심 키워드 리마인드

# Ch 07 JSX 핵심 문법과 자바스크립트 변환 돌아보기

### 학습 목표
JSX 변환 모습
JSX 필수 문법
리액트 합성 이벤트

## 7.1 JSX 핵심 문법과 자바스크립트 변환을 돌아봐야 하는 이유
JSX는 함수 호출을 더 쉽고 선언적으로 하기 위한 도구
예상치 못한 에러들은 근본적으로 브라우저가 이해할 수 있는 자바스크립트 결과물에 숨어 있음.
JSX 변환 원리를 이해하는 것은 실용적인 역량을 길러주는 과정.

## 7.2 JSX 변환하기
JSX 코드를 브라우저가 이해할 수 있는 자바스크립트 코드로 변환하는 다양한 도구들이 있음.

바벨
SWC: 러스트로 작성된 초고속 컴파일. Next.js가 기본적으로 사용
ESBuild: Go언어로 작성된 초고속 번들러. 비트 같은 최신 프론트엔드 빌드 도구들은 내부적으로 ESBuild를 사용.
### 7.2.1 자동 런타임이란
리액트 17부터 자동 런타임이 도입.
개발자 경험과 번들 크기에 직접적인 영향을 미침.

17버전 이전, 클래식 런타임 환경에서는 JSX 사용하는 모든 파일 상단에 `import React from "react"` 구문을 반드시 포함. 트랜스파일러가 JSX구문을 React.createElement() 함수 호출로 변환했기 때문.

```jsx
import React from 'react';

// 변환 전 JSX
const element = <h1 className="greeting">Hello, world</h1>;

// 변환 후 JavaScript (클래식 런타임)
const element = React.createElement('h1', {className: 'greeting'}, 'Hello, world');
```

React.createElement() 코드가 정상적으로 실행되기 위해 리액트 객체가 필요했음.

자동 런타임 도입으로 React를 import할 필요가 없어짐. 트랜스파일러는 React.createElement() 대신 리액트 패키지에 내장된 별도의 함수를 자동으로 임포트하여 사용함.
- 프로덕션 환경: react/jsx-runtime 에서 jsx()와 jsxs() 함수를 가져와 사용
- 개발 환경: react/jsx-dev-runtime 에서 jsxDEV()를 가져와 사용하며, 여기에는 개발에 유용한 추가 검증 및 경고 기능이 포함됨
다음과 같은 이점을 제공함.
- 코드 간소화
- 번들 크기 감소
- 개선된 개발 경험

### 7.2.2 바벨로 JSX 변환해보기
보통 바벨 플러그인인 `@babel/preset-react`를 사용하는데 내부적으로 `@babel/plugin-transform-react-jsx`를 사용해서 JSX를 설정함. 바벨 설정은 JSON 포맷 파일이나 `.bablerc`에서 작성할 수 있음.
```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
} 
```

#### 자동 런타임 적용 전
```jsx
// JSX 원본 코드 (Babel 변환 전)
import React from 'react';

// 간단한 JSX 예제
const element = <h1 className="welcome">Hello, JSX!</h1>;

// 중첩된 JSX 예제
const nestedElement = (
  <div className="container">
    <h2 className="title">중첩된 JSX 예제</h2>
    <p className="content">JSX는 중첩 구조를 쉽게 표현할 수 있습니다.</p>
    <button onClick={() => alert('클릭됨!')}>클릭해보세요</button>
  </div>
);

// 커스텀 컴포넌트 예제
const MyButton = ({ color, children }) => (
  <button 
    style={{ backgroundColor: color, color: 'white', padding: '10px' }}
  >
    {children}
  </button>
);

const customComponentExample = <MyButton color="blue">Click Me</MyButton>;

// 조건부 렌더링 예제
const showMessage = true;
const conditionalExample = (
  <div>
    {showMessage ? <p>메시지가 표시됩니다.</p> : <p>메시지가 숨겨집니다.</p>}
  </div>
);

console.log('JSX 예제 파일이 로드되었습니다.'); 
```

build 명령어 수행하면 아래와 같이 자바스크립트 파일이 dist 폴더에 생성됨.
```js
"use strict";

var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// JSX 원본 코드 (Babel 변환 전)

// 간단한 JSX 예제
var element = /*#__PURE__*/_react["default"].createElement("h1", { // 1.
  className: "welcome" // 2.
}, "Hello, JSX!"); // 3.

// 중첩된 JSX 예제
var nestedElement = /*#__PURE__*/_react["default"].createElement("div", {
  className: "container"
}, /*#__PURE__*/_react["default"].createElement("h2", {
  className: "title"
}, "\uC911\uCCA9\uB41C JSX \uC608\uC81C"), /*#__PURE__*/_react["default"].createElement("p", {
  className: "content"
}, "JSX\uB294 \uC911\uCCA9 \uAD6C\uC870\uB97C \uC27D\uAC8C \uD45C\uD604\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/_react["default"].createElement("button", {
  onClick: function onClick() {
    return alert('클릭됨!');
  }
}, "\uD074\uB9AD\uD574\uBCF4\uC138\uC694"));

// 커스텀 컴포넌트 예제
var MyButton = function MyButton(_ref) {
  var color = _ref.color,
    children = _ref.children;
  return /*#__PURE__*/_react["default"].createElement("button", {
    style: {
      backgroundColor: color,
      color: 'white',
      padding: '10px'
    }
  }, children);
};
var customComponentExample = /*#__PURE__*/_react["default"].createElement(MyButton, {
  color: "blue"
}, "Click Me");

// 조건부 렌더링 예제
var showMessage = true;
var conditionalExample = /*#__PURE__*/_react["default"].createElement("div", null, showMessage ? /*#__PURE__*/_react["default"].createElement("p", null, "\uBA54\uC2DC\uC9C0\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.") : /*#__PURE__*/_react["default"].createElement("p", null, "\uBA54\uC2DC\uC9C0\uAC00 \uC228\uACA8\uC9D1\uB2C8\uB2E4."));
console.log('JSX 예제 파일이 로드되었습니다.');
```

React.createElement() 함수로 변환되었고, 다음의 3개의 인자를 받음.
1. 타입: element 의 타입 'h1'처럼 기본 태그 이름 또는 커스텀 컴포넌트를 가리키는 변수나 클래스 전달
2. 프로퍼티(props) 객체: 요소에 전달할 속성들을 객체로 표현
3. 자식 요소: 세 번째 이후 인자들은 모두 자식 요소들. 여러 자식일 경우 더 많은 인자 또는 배열로 전달.

#### 자동 런타임 적용 후
`@babel/preset-react` 설정에 `runtime: automatic` 옵션을 추가하여 자동 런타임을 활성화 합니다.
```JSON
{
  "presets": [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        "runtime": "automatic" // <-- 자동 런타임 설정
      }
    ]
  ]
} 
```

자동 런타임 적용된 버전의 산출물
```js
"use strict";

// react/jsx-runtime에서 jsx, jsxs 함수를 자동으로 임포트함
var _jsxRuntime = require("react/jsx-runtime");
// 새로운 JSX 변환(React 17+) 예제
// 이 파일은 React를 import하지 않아도 됩니다

// 간단한 JSX 예제 
var element = /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
  className: "welcome",
  children: "Hello, New JSX Transform!"
});

// 중첩된 JSX 예제
var nestedElement = /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "container",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", { // 1.
    className: "title",
    children: "React 17+ JSX \uBCC0\uD658"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
    className: "content",
    children: "React 17\uBD80\uD130\uB294 JSX\uB97C \uC704\uD574 React\uB97C import\uD560 \uD544\uC694\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
    onClick: function onClick() {
      return console.log('클릭됨!');
    },
    children: "\uD074\uB9AD\uD574\uBCF4\uC138\uC694"
  })]
});

// 기능적으로는 동일하지만, import React가 필요하지 않음
console.log('새로운 JSX 변환 예제 파일이 로드되었습니다.');
```

1. `react/jsx-runtime` 모듈로 부터 `_jsxRuntime.jsx()`를 임포트한 뒤 사용. `react/jsx-runtime`은 JSX 변환을 위한 전용 엔트로포인트일 뿐 React.createContext() 와 같은 구문을 사용하려면 React 를 import 해야함.

### 7.2.3 SWC로 JSX 변환해보기
러스트로 작성된 초고속 컴파일러이자 번들러로 싱글 스레드에서 바벨보다 20배가량 빠름.
Next.js는 바벨대신 SWC를 기본 컴파일러로 사용.
SWC는 .swcrc 파일에 JSON 형식으로 설정 옵션을 지정할 수 있음.

#### 클래식 런타임을 위한 설정 파일
```json
{
  "jsc": {
    "parser": {
      "syntax": "ecmascript",
      "jsx": true
    },
    "transform": {
      "react": {
        "runtime": "classic",
        "pragma": "React.createElement",
        "pragmaFrag": "React.Fragment"
      }
    },
    "target": "es2015"
  },
  "module": {
    "type": "commonjs"
  }
} 
```

#### 자동 런타임을 위한 설정 파일
```json
{
  "jsc": {
    "parser": {
      "syntax": "ecmascript",
      "jsx": true
    },
    "transform": {
      "react": {
        "runtime": "automatic",
        "importSource": "react",
        "pragma": "React.createElement",
        "pragmaFrag": "React.Fragment"
      }
    },
    "target": "es2015"
  },
  "module": {
    "type": "commonjs"
  }
} 
```

#### 속도 비교를 위한 스크립트 파일
```js
/**
 * SWC와 Babel의 변환 속도 비교 벤치마크 스크립트
 * 
 * 이 스크립트는 SWC와 Babel의 JSX 변환 성능을 비교합니다.
 * 동일한 JSX 파일을 여러 번 변환하여 평균 변환 시간을 측정합니다.
 */
const fs = require('fs');
const path = require('path');
const swc = require('@swc/core');
let babel;
let babelPresetEnv;
let babelPresetReact;

// Babel이 설치되어 있는지 확인
try {
  babel = require('@babel/core');
  babelPresetEnv = require('@babel/preset-env');
  babelPresetReact = require('@babel/preset-react');
  console.log('Babel 패키지를 찾았습니다. 벤치마크를 실행합니다.');
} catch (error) {
  console.warn('주의: Babel 패키지를 찾을 수 없습니다. SWC만 벤치마크합니다.');
  console.warn('Babel 벤치마크를 위해서는 다음 명령어로 패키지를 설치하세요:');
  console.warn('npm install @babel/core @babel/preset-env @babel/preset-react');
}

// 소스 파일
const sourceFile = path.join(__dirname, '../src/example.jsx');
const sourceCode = fs.readFileSync(sourceFile, 'utf8');

// SWC 옵션
const swcOptions = {
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: true
    },
    transform: {
      react: {
        runtime: 'classic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment'
      }
    },
    target: 'es2015'
  },
  module: {
    type: 'commonjs'
  }
};

// Babel 옵션
const babelOptions = babel && {
  presets: [babelPresetEnv, babelPresetReact],
  comments: true
};

// 벤치마크 함수 - SWC와 Babel의 변환 속도를 비교하는 함수
async function runBenchmark(iterations = 100) {
  // 벤치마크 시작 메시지 출력 (iterations는 반복 횟수)
  console.log(`\n=== SWC vs Babel 벤치마크 (${iterations}회 반복) ===\n`);
  
  // SWC 벤치마크 시작
  // process.hrtime.bigint()는 나노초 단위의 정밀한 시간 측정 제공
  const swcStartTime = process.hrtime.bigint();
  
  // 지정된 횟수만큼 SWC로 JSX 변환 반복 실행
  // 여러 번 반복하여 평균적인 성능을 측정
  for (let i = 0; i < iterations; i++) {
    await swc.transform(sourceCode, swcOptions);
  }
  
  // SWC 벤치마크 종료 시간 기록
  const swcEndTime = process.hrtime.bigint();
  // 시간 차이 계산 (나노초를 밀리초로 변환)
  const swcDuration = Number(swcEndTime - swcStartTime) / 1_000_000; // ms로 변환
  
  // SWC 변환 결과 출력 (총 시간 및 평균 시간)
  console.log(`SWC 변환 시간: ${swcDuration.toFixed(2)}ms (${iterations}회 평균: ${(swcDuration / iterations).toFixed(2)}ms)`);
  
  // Babel 벤치마크 시작 (Babel이 설치된 경우에만 실행)
  if (babel) {
    // Babel 시작 시간 기록
    const babelStartTime = process.hrtime.bigint();
    
    // 동일한 소스코드를 Babel로 같은 횟수만큼 변환
    // transformSync는 동기식 변환 메서드 (SWC는 비동기식)
    for (let i = 0; i < iterations; i++) {
      babel.transformSync(sourceCode, babelOptions);
    }
    
    // Babel 벤치마크 종료 시간 기록
    const babelEndTime = process.hrtime.bigint();
    // 시간 차이 계산 (나노초를 밀리초로 변환)
    const babelDuration = Number(babelEndTime - babelStartTime) / 1_000_000; // ms로 변환
    
    // Babel 변환 결과 출력 (총 시간 및 평균 시간)
    console.log(`Babel 변환 시간: ${babelDuration.toFixed(2)}ms (${iterations}회 평균: ${(babelDuration / iterations).toFixed(2)}ms)`);
    
    // 두 도구 간의 성능 비교 분석
    // speedup은 Babel 시간 / SWC 시간으로 SWC가 몇 배 빠른지 계산
    const speedup = babelDuration / swcDuration;
    
    // 성능 비교 결과 섹션 시작
    console.log(`\n=== 성능 비교 결과 ===\n`);
    // 속도 차이를 소수점 첫째 자리까지 표시 (예: 28.4배)
    console.log(`SWC는 Babel보다 약 ${speedup.toFixed(1)}배 빠릅니다.`);
    // SWC가 빠른 이유 설명 (Rust로 작성되어 네이티브 코드로 컴파일됨)
    console.log('이는 SWC가 Rust로 작성되어 네이티브 코드로 컴파일되기 때문입니다.');
    // 실무 적용 시 장점 설명
    console.log('대규모 프로젝트에서는 빌드 시간이 크게 단축될 수 있습니다.');
  }
}

// 벤치마크 실행
runBenchmark(100); 
```
#### 실행 결과
```bash
== SWC vs Babel 벤치마크 (100회 반복) ==

SWC 변환 시간 : 32.92ms (100회 평균 : 0.33ms)
Babel 변환 시간 : 776.85ms (100회 평균 : 7.77ms)

== 성능 비교 결과 ==

SWC는 Babel보다 약 23. 6배 빠릅니다.
이는 SWC가 Rust로 작성되어 네이티브 코드로 컴파일되기 때문입니다.
대규모 프로젝트에서는 빌드 시간이 크게 단축될 수 있습니다.
```

### 7.2.4 ESBuild로 JSX 변환해보기
Go언어로 작성된 초고속 번들러. 비트 같은 최신 프론트엔드 빌드 도구들은 내부적으로 ESBuild를 사용.
별도의 설정 없이도 JSX를 기본적으로 인식함. 확장자가 .jsx, .tsx인 경우 JSX 구문을 React.createElement() 호출로 변환. ESBuild에서 제공하는 커맨드라인 인터페이스를 사용하여 JSX 파일을 변환할 수 있음.

```js
/**
 * esbuild CLI 명령어를 사용하여 JSX를 변환하는 예제 스크립트
 * 
 * 이 스크립트는 esbuild CLI 명령어 사용법을 보여주고, 직접 실행합니다.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 작업 디렉토리 설정
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

// 명령어 실행 함수
function runCommand(command, description) {
  console.log(`\n=== ${description} ===`);
  console.log(`명령어: ${command}\n`);
  
  try {
    // 명령 실행 (stdout을 문자열로 반환)
    const output = execSync(command, { 
      cwd: rootDir, 
      encoding: 'utf8',
      stdio: 'inherit' // 실시간으로 출력 표시
    });
    
    console.log('\n✅ 명령 실행 완료\n');
    return true;
  } catch (error) {
    console.error(`❌ 명령 실행 중 오류 발생: ${error.message}`);
    return false;
  }
}

// CLI 예제 실행
async function runCliExamples() {
  console.log('===== esbuild CLI 명령어 예제 =====\n');
  
  // dist 디렉토리가 없으면 생성
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // 예제 1: 기본 JSX 변환 (classic 모드)
  runCommand(
    'npx esbuild src/App.jsx --bundle --outfile=dist/cli-classic.js',
    'Classic 모드로 JSX 변환 (기본값)'
  );
  
  // 예제 2: 자동 JSX 변환 (automatic 모드)
  runCommand(
    'npx esbuild src/AppNoReact.jsx --jsx=automatic --bundle --outfile=dist/cli-automatic.js',
    'Automatic 모드로 JSX 변환 (React 17+)'
  );
  
  // 예제 3: 번들링 없이 변환만 수행
  runCommand(
    'npx esbuild src/App.jsx --loader=jsx --outfile=dist/transform-only.js',
    '번들링 없이 JSX 변환만 수행'
  );
  
  // 예제 4: 미니파이 옵션 추가
  runCommand(
    'npx esbuild src/App.jsx --bundle --minify --outfile=dist/minified.js',
    '미니파이된 번들 생성'
  );
  
  // 마무리 메시지
  console.log('\n===== esbuild CLI 명령어 예제 완료 =====');
  console.log('생성된 파일:');
  console.log('- dist/cli-classic.js: 기본 JSX 변환 (React.createElement)');
  console.log('- dist/cli-automatic.js: automatic 모드 JSX 변환 (react/jsx-runtime)');
  console.log('- dist/transform-only.js: 번들링 없이 변환만 수행');
  console.log('- dist/minified.js: 미니파이된 번들');
}

// 실행
runCliExamples(); 
```

ESBuild에서는 -jsx=automatic 옵션을 주면 바벨/SWC의 자동 런타임과 동일하게 동작함.

### 7.2.5 React.createElement와 리액트 엘리먼트 그리고 가상 DOM
React.createElement()와 jsx()가 무엇을 반환하는지 이해하면 JSX의 역할을 더욱 명확히 할 수 있음.
공통적으로 리액트 엘리먼트라고 불리는 자바스크립트 불변 객체를 반환.
이 객체는 리액트가 실제 DOM을 만들기 전에 가지고 있는 일종의 청사진으로 바로 가상 DOM이라고 불리는 구조의 한 조각.

```js
console.log('1. React.createElement 방식 (Classic):');
const classicElement = React.createElement(
  'div', 
  { className: 'container', id: 'root' },
  React.createElement('h1', null, '제목'),
  React.createElement('p', null, '내용')
);
```

```bash
{
  $$typeof: Symbol(react.element), // 1.
  type: 'div', // 2.
  key: null, // 3.
  ref: null, // 4.
  props: { // 5.
    className: 'container',
    id: 'root',
    children: [ [Object], [Object] ]
  },
  _owner: null,
  _store: {}
}
```

1. 객체가 리액트 엘리먼트임을 나타내는 내부 식별용 속성으로 리액트 내부에서는 심볼을 사용하여 정의되어 있음.
2. 요소의 타입
3. 리액트에서 리스트 렌더링이나 참조에 사용
4. 리액트에서 리스트 렌더링이나 참조에 사용
5. 전달된 속성 및 children을 포함하는 객체

리액트 클래스 컴포넌트의 render() 함수나 함수 컴포넌트에서 리액트 엘리먼트 객체를 반환받아 가상 DOM 트리를 구축.
그리고 ReactDOM은 이 가상 DOM을 바탕으로 실제 DOM을 생성하거나 업데이트 함.

> 과정: JSX -> React.createElement() -> 리액트 엘리먼트 객체 생성

## 7.3 JSX의 핵심 문법 돌아보기

템플릿 리터럴과의 비교
스타일링
이벤트 처리
조건부 렌더링

### 7.3.1 템플릿 리터럴과 태그드 템플릿 돌아보기

템플릿 리터럴 `${variable} string`

태그드 템플릿 리터럴 
```js
function fn(strings, ...values) {
	console.log('strings:', strings)
	console.log('values:', values)
	return " 함수 실행 결과"
}

fn`rabbit jump` // 1. 태그드 템플릿 호출
fn(["rabbit jump"]) // 2. 일반 함수 호출로 표현(위 코드와 동일함)

fn`this is a ${color} Rabbit` // 3. 인자가 있는 태그드 템플릿 
fn(["this is a ", " Rabbit"], color) // 4. 일반 하수 호출로 표현
```

```bash
strings: ['rabbit jump', raw: Array(1)]
	0: "rabbit jump"
	length: 1
	raw: ['rabbit jump']
	[[Prototype]]: Array(0)
values: []

strings: ['rabbit jump']
values: []
```

동적으로 스타일을 적용할 때 styled-component, emotion과 같은 CSS-in-js 방식 사용 가능함.
CSS-in-js는 태그드 템플릿을 사용하는 전형적인 예시임.
```jsx
import styled from 'styled-components';

// 1. 기본 styled-components 사용법 -> 태그드 템플릿을 사용한 스타일드 컴포넌트
const StyledDiv = styled.div` 
  color: white;
  background-color: gray;
  padding: 16px;
  border-radius: 4px;
  margin: 8px;
  font-family: Arial, sans-serif;
`;

const GrayBox = () => {
	return (
		<StyledDiv>Golden Rabbit</StyledDiv>
	)
}
```

##### 태그드 템플릿을 사용해 직접 스타일드-컴포넌트 만들어보기
(생략) ch7/syntax/custom-styled-component.jsx 참고

### 7.3.2 JSX VS 템플릿 리터럴

태그드 템플릿을 활용해 UI를 표현하는 라이브러리들이 있음. (예: htm 라이브러리)
htm 라이브러리를 사용해 태그드 템플릿을 JSX 대신 사용하는 예시.
```jsx
import { html } from 'htm/react';

// 3. 복잡한 컴포넌트 구조 예시
const GoldenRabbitBox = ({ children }) => {
  return html`<div className="golden-rabbit-box">${children}</div>`;
  // 자식 컴포넌트를 받아 렌더링하는 기본 컨테이너 컴포넌트
};

GoldenRabbitBox.Comment = ({ children }) => {
  return html`<div className="comment">${children}</div>`;
  // 부모 컴포넌트의 속성으로 정의된 서브 컴포넌트
};

const GoldenRabbitAnswer = ({ value, children }) => {
  return html`<div className="answer" data-value=${value}>${children}</div>`;
  // props로 value와 children을 받는 독립 컴포넌트
};

// 복잡한 컴포넌트 사용 예시
const ComplexExample = ({ user }) => {
  const shouldShowGoldenRabbit = (user) => {
    return user && user.role === 'admin';
    // 사용자가 존재하고 역할이 'admin'인 경우에만 true 반환
  };
  
  // 방법 1: $ 문법으로 컴포넌트 참조 (문서에서 설명한 첫 번째 방식)
  return html`
    <${GoldenRabbitBox}> ${/* 1. 커스텀 컴포넌트 사용 가능 */}
      ${
        shouldShowGoldenRabbit(user) {/* 2. children 내부에서 함수호출시 $표기 */}
	      {/* 3.  */}
          ? html`<${GoldenRabbitAnswer} value=${false}>No Golden Rabbit</${GoldenRabbitAnswer}>`
          : html` ${/* 4. $ 표기 내부에 또 다른 커스텀 컴포넌트를 표기하려면 또 다른 태그드 템플릿 표기해줘야 함. */}
              <${GoldenRabbitBox.Comment}>
                GoldenRabbit
              </${GoldenRabbitBox.Comment}>
            `
        // 사용자 역할에 따라 다른 컴포넌트 조건부 렌더링
        // 컴포넌트를 참조할 때는 <${컴포넌트}> 형식 사용
        // props는 속성으로 전달 (value=${false})
      }
    </${GoldenRabbitBox}>
  `;
  
  // 방법 2: 간소화된 문법 (문서에서 설명한 두 번째 방식)
  // 주의: 아래 코드는 실제로는 작동하지 않을 수 있음
  // htm은 내부 변수를 자동으로 인식하지 못하기 때문
  // return html`
  //   <GoldenRabbitBox>
  //     {
  //       shouldShowGoldenRabbit(user)
  //         ? <GoldenRabbitAnswer value={false}>No Golden Rabbit</GoldenRabbitAnswer>
  //         : <GoldenRabbitBox.Comment>
  //             GoldenRabbit
  //           </GoldenRabbitBox.Comment>
  //     }
  //   </GoldenRabbitBox>
  // `;
};
```

html이 여기저기 사용되면거 코드가 굉장이 지저분해짐.

### 7.3.3 합성 이벤트

유저의 다양한 인터랙션 이벤트를 효율적이고 안정적으로 처리하기 위한 합성 이벤트가 도입됨.
합성이 이벤트의 네이티브 이벤트 래핑과 이벤트 풀링 개념을 알아보자.

합성 이벤트로 여러 브라우저에서 일관된 인터페이스를 사용 할 수 있음.

```tsx
// 드래그앤드롭 예제 컴포넌트
function DragDrop() {
  // 1. 드래그 시작 이벤트 핸들러
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // 드래그되는 요소의 ID를 데이터로 설정
    event.dataTransfer.setData('text/plain', (event.target as HTMLDivElement).id);
    
    // 드래그 효과 설정
    event.dataTransfer.effectAllowed = 'move';
    
    // 드래그 이미지 커스터마이징 (선택 사항)
    // const dragIcon = document.createElement('img');
    // dragIcon.src = 'drag-icon.png';
    // event.dataTransfer.setDragImage(dragIcon, 0, 0);
  };

  // 2. 드래그 오버 이벤트 핸들러
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // 기본 동작 방지 (필수: 드롭 영역으로 인식하기 위함)
    event.preventDefault();
    
    // 커서 모양 변경을 위한 드롭 효과 설정
    event.dataTransfer.dropEffect = 'move';
  };

  // 3. 드롭 이벤트 핸들러
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    // 기본 동작 방지
    event.preventDefault();
    
    // 드래그 시작 시 저장한 데이터 가져오기
    const data = event.dataTransfer.getData('text/plain');
    console.log('드롭된 데이터:', data);
    
    // 실제 애플리케이션에서는 여기서 상태 업데이트 등을 수행
    // setItems(prev => [...]);
    
    // 합성 이벤트의 native 이벤트 접근 예시
    console.log('네이티브 이벤트:', event.nativeEvent);
  };
```

1. 드래그를 시작할 JSX에 바인딩할 이벤트 핸들러. 드롭되는 곳에 전달받을 데이터를 id로 지정함.
2. 드래그앤드롭이 정상적으로 동작하게 하기 위해 event.preventDefault를 호출
3. 드롭되는 엘리먼트에 바인딩될 이벤트 핸ㄷㄹ러. 드래그앤드롭된 아이템의 id를 읽고 콘솔 로그로 출력함.

이어서 JSX 작성과 이벤트 핸들러를 바인딩하는 코드

```jsx
  // 드래그 엔터 이벤트 핸들러 (선택적 구현)
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // 드롭 영역에 진입했을 때 스타일 변경 등을 위해 사용
    event.currentTarget.classList.add('drag-over');
  };

  // 드래그 리브 이벤트 핸들러 (선택적 구현)
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // 드롭 영역에서 나갔을 때 스타일 원복 등을 위해 사용
    event.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className="drag-drop-container">
      <h2>리액트 합성 이벤트: 드래그앤드롭 예제</h2>
      
      {/* 드래그 가능한 요소 */}
      <div
        id="draggableItem"
        draggable="true"
        onDragStart={handleDragStart} // 4.
        style={{
          width: '150px',
          height: '75px',
          backgroundColor: 'gold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          userSelect: 'none' // 드래그 중 텍스트 선택 방지
        }}>
        이 요소를 드래그하세요
      </div>
      
      {/* 드롭 영역 */}
      <div
        className="drop-zone"
        onDrop={handleDrop} // 5.
        onDragOver={handleDragOver} // 6.
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
          width: '300px',
          height: '200px',
          border: '2px dashed #aaa',
          borderRadius: '8px',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}>
        여기에 드롭하세요
      </div>
      
      <div className="explanation" style={{ marginTop: '20px', fontSize: '14px' }}>
        <p>
          위 예제는 리액트 합성 이벤트(Synthetic Event)를 사용한 드래그앤드롭 구현을 보여줍니다.
          각 이벤트 핸들러는 React.DragEvent 타입의 합성 이벤트를 받습니다.
        </p>
      </div>
    </div>
  );
}

export default DragDrop; 
```

4, 5, 6 이벤트 핸들러의 인수 타입 정의는 DragEvent\<HTMLDivElement\>로 되는데, 종속성으로 설치된 `@types/react`의 index.d.ts를 살펴보면 다음과 같이 NativeDrageEvent가 래핑된 형태로 인터페이스가 정의되었습니다.
```bash
# 타입 힌트
(property) React.DOMAttributes<HTMLDivElement>.onDragStart?:
React.DragEventHandler<HTMLDivElement>

onDragStart?: DragEventHandler<T> | undefined;
```

```tsx
// 합성 이벤트 예제 코드: 드래그앤드롭
interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
	dataTransfer: DataTransfter;
}
```

리액트에서 대부분의 이벤트 리스너를 개별 DOM 노드에 직접 부착하지 않고 이벤트 위임을 사용하는데 16버전 까지는 document객체에 부착했고, 17버전 부터는 ReactDOM.render()가 호출되는 컨테이너 요소로 변경됨.

유저가 DOM 요소에 네이티브 이벤트를 발생 시키면 DOM 트리를 따라 상위 요소로 버블링되고 최상위 리액트 이벤트 리스너는 네이티브 이벤트를 감지하고 합성 이벤트 객체로 래핑하여 JSX에 바인딩되었던 onClick() 과 같은 적절한 이벤트 핸들러를 찾아 합성 이벤트 객체를 인자로 전달해 호출함.
16버전 까지는 이벤트 객체를 pool이라는 장소에 저장해두고, 이벤트 발생하면 pool에 있는 객체를 재사용함. 이벤트 호출이 끝나면 해당 이벤트 객체의 프로퍼티를 초기화한 뒤, 다시 풀로 반환하는 이벤트 풀링 방식을 사용했는데, 이 이벤트 풀링은 이벤트 핸들러 호출 이후 합성 이벤트 객체의 속성이 null로 초기화된다는 부분 때문에 비동기적으로 이벤트 객체의 속성에 접근할 때 주의를 요했음.
##### 문제 발생 예제 코드
```tsx
// React 16 이하에서의 문제 상황
  const handleClickLegacy = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 이벤트 객체를 비동기적으로 사용하려고 시도
    setTimeout(() => {
      // React 16 이하에서는 이 시점에 event 객체가 이미 재설정됨
      // TypeError 발생 가능성 있음
      try {
        // @ts-ignore: 이 코드는 실제로는 React 16 이하에서 오류 발생
        const eventType = event.type; // 1. React 16에서는 null이 됨
        setAsyncMessage(`비동기 접근 결과 (React 16): ${eventType || 'null'}`);
      } catch (error) {
        setAsyncMessage(`비동기 접근 오류 (React 16): ${error}`);
      }
    }, 0);
    
    // 동기적 사용은 정상 작동
    setMessage(`동기적 접근 결과: ${event.type}`);
  };
```

setTimeout() 이나 async/await과 같은 비동기 함수 내부에서 event.type, event.stopPropagation() 등에 접근하려면 이미 객체가 풀링되어 속성들이 null되었기 때문에 에러가 발생하거나 예상치 못한 동작을 할 수 있었음.
이를 방지하기 위해 개발자가 비동기 코드를 실행하기 전에 event.persist()를 호출하여 이벤트 객체가 풀링되지 않도록 작성해야 했음.

##### 리액트 16버전 이하에서의 해결책
```tsx
// React 16에서의 해결책: event.persist() 사용
  const handleClickLegacyFixed = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 이벤트 객체 지속 유지
    // event.persist(); // React 16에서 필요한 메서드
    
    setTimeout(() => {
      // event.persist()를 호출했으므로 여전히 유효함
      const eventType = event.type;
      setAsyncMessage(`event.persist() 사용 후 비동기 접근: ${eventType}`);
    }, 0);
    
    setMessage(`동기적 접근 결과: ${event.type}`);
  };
```

현대 자바스크립트 엔진과 브라우저가 객체 할당 및 가비지 컬랙션을 효율적으로 처리하기 때문에 풀링의 성능 이점이 줄어들어 17버전 부터는 이벤트 풀링은 제거되었으며 이로 인해 이벤트 시스템이 단순화됨.

### 7.3.4 단일 루트 엘리먼트

```tsx
// 여러 개의 루트 요소는 허용되지 않음
// function MultipleRootElements() {
//   return (
//     <h1>Hello, Reader!</h1>
//     <p>This is not allowed.</p>
//   );
// }

// 하나의 루트 요소만 허용됨
function SingleRootElement() {
  return (
    <div>
      <h1>Hello, Reader!</h1>  {/* ➊ */}
      <p>This is allowed.</p>  {/* ➋ */}
    </div>
  );
}

// 하나의 루트 요소만 허용됨 - React.Fragment 사용
function SingleRootElement2() {
  return (
    <>
      <h1>Hello, Reader!</h1>
      <p>This is allowed.</p>
    </>
  );
}
```

왜 JSX는 단일 루트 엘리먼트만 허용하는지 알아보자.
##### 바벨 트랜스파일러가 변환한 코드
```tsx
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

function MyComponent() {
  return /*#__PURE__*/ _jsxs("div", { // 1. 
    children: [
      /*#__PURE__*/ _jsx("h1", {
        children: "Hello, Reader!"
      }),
      /*#__PURE__*/ _jsx("p", {
        children: "This is not allowed."
      })
    ]
  });
}
```

1. 항상 함숫값 한 개를 반환함. 그리고 이 함수값은 `_jsx()` 혹은 `React.createElement()`의 반환값이 됨.

여러 개의 루트 엘리먼트가 작성 가능하다면 다음처럼 이상한 모습으로 변환 될 것임.
```tsx
function MyComponent() {
  return _jsx("h1", {
    children: "Hello, Reader!"
  });

  _jsx("p", { // 1. 이런 문법은 실제로 존재하지 않음
    children: "This is not allowed."
  });
}
```

자바스크립트 함수는 항상 한 가지 값만 반환이 가능함.

### 7.3.5 삼항 연산자와 &&
조건부 렌더링에 삼한 연산자나 && 연산자를 사용하는 방식이 있음.
> 주의: && 사용시 첫 번째 피 연산자가 0이나 NaN이면 거짓으로 평가되는 값이 화면에 그대로 노출됨.

```jsx
<div>
	{ false && <p>This will not appear</p> }
</div>

<div>
	{ null && <p>This will not appear</p> }
</div>

<div>
	{ undefined && <p>This will not appear</p> }
</div>
```

## 학습 마무리
JSX 코드가 바벨, SWC, ESBuild와 같은 트랜스파일러를 거쳐 브라우저가 이해할 수 있는 자바스크립트 함수 호출로 변환되는 과정을 상세히 살펴봄.
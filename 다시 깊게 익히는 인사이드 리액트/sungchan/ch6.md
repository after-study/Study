# Ch 06 JSX의 구성요소 돌아보기


## 학습 목표
### DSL이란?
도메인 특화 언어 `Domain-Specific Language`
JSX는 JavaScipt에서 UI를 표현하는 도메인 특화 언어 (CSS, YAML 등이 있음)

### JSX 구성요소

### JSX의 필수 문법

### 리액트의 합성 이벤트

핵심 키워드: `DSL`, `JSX`, `JSXElements`, `JSXAttributes`, `JSXChildren`, `JSXStrings`

## 6.1 JSX를 공부해야 하는 이유
- 컴포넌트 기반의 선언형 UI 개발 시대를 여는 핵심적인 역할을 했음
- 가장 큰 장점은 직관성. HTML과 거의 흡사한 문법.
## 6.2 DSL과 JSX 알아보기
- DSL은 외부 DSL과 냐부 DSL로 나뉨
### 외부 DSL
- 독자적 문법과 파서를 가지고 별개의 파일에서 독립적으로 실행되는 언어.
- YAML 파일, SQL, CSS
### 내부 DSL
- 범용적 프로그래밍 언어(JS, 루비, C#)의 문법과 기능을 확장
- 루비 RSpec, C# 기반 LINQ, JSX

JSX는 UI의 구조와 동작 로직을 하나의 자바스크립트 파일 안에서 선언적으로 관리.

## 6.3 JSX를 구성하는 요소
JSX는 바벨과 같은 트랜스파일러를 사용해 JS로 변경해야 함. 
JSX 규칙은 메타 공식 문서에서 찾을 수 있음.

### 6.3.1 JSXElements
JSX 구문의 단위. UI구성 벽돌과 같은 역할.
JSXElement, JSXFragment, JSXElementName 세 가지 유형으로 나뉨

#### JSXElement
두 가지 구성 요소를 가짐
1. JSXOpeningElement, JSXChildren, JSXClosingElement로 이루어진 그룹
2. JSXSelfClosingElement

JSX 구문 파싱시 대문자로 시작하면 커스텀 컴포넌트, 소문자로 시작하면 HTML 태그로 간주.

```jsx
// JSX 트랜스파일링했을 때 변환되는 HTML 기본 태그
function Button() { // 트랜스파일링 전
  return (
    <div>
      Golden Rabbit
    </div>
  );
}

function Button(e) { // 트랜스파일링 후
  return nn.jsx("div", { // ①
    className: e.className,
    onClick: e.onClick,
    children: e.children,
  });
}
```

```jsx
// JSX를 트랜스파일링 했을 때 변환되는 커스텀 컴포넌트
function Button2() { // 트랜스파일링 전
  return (
    <Button>
      Golden Rabbit
    </Button>
  );
}

function Button2() { // 트랜스파일링 후
  // ② 문자열이 아닌 커스텀 컴포넌트인 Button이 첫 번째 인수가 된 모습
  return En.jsx(Button, { children: "Golden Rabbit" });
}
```

<!-- 커스텀 컴포넌트를 올바르지 않게 소문자로 명명한 모습 -->
```JSX
function Button2 () {
    return (
        <customButton>
         Golden Rabbit
        </customButton>
    )
}

function Button2() {
 // 난수가 아닌 문자열로 변환되어 HTML 기본 태그로 인식되는 customButton
 return En.jsx("customButton", { children: "Golden Rabbit" });  
}
```

JSXChildren은 선택 요소이기 때문에 children이 없는 경우 JSXSelfClosingElement로 작성할 수 있습니다.

```JSX
// JSXSelfClosingElement를 사용해 JSX 작성하기
function Button(props) {
  return (
    <button className={props.className} onClick={props.onClick}>
      {/* ➊ children 없으면 "Golden Rabbit" 출력 */}
      {props.children ?? “Golden Rabbit”}
    </button>
  )
}

function Page() {
  return (
    // ➋ JSXSelfClosingElement
    <Button className=”primary” onClick={console.log} /> 
   )
}
```

#### JSXFragment
부모요소 없이 여러 자식 요소를 그룹화하에 사용되는 특별한 문법.
```JSX
<></>

<React.Fragment>
</React.Fragment>
```

#### JSXElementName
JSX 요소의 태그 이름. 기본 HTML 태그나 유저 정의 리액트 컴포넌트를 지정하는 데 사용됨.
JSX 태그의 `<` 기호 이후 따로오는 `JSXElementName`은 `JSXIdentifier`, `JSXNamespacedName`, `JSXMemberExpression` 타입으로 나뉘어짐.

##### JSXIdentifiter
단일 식별자를 나타냄. 
```JSX
<Compoenent />
```

##### JSXNamespacedName
네임스페이스를 포함한 이름을 나타냄. 리액트에서는 지원하지 않음.
```JSX
<namespace:Component>
```

##### JSXMemberExpression
객체의 속성처럼 . 기호로 구분된 멤버 표현식을 나타냄
네임스페이스나 객체의 중첩된 구조를 표현할 때 사용됨.
```JSX
const GoldenRabbit = () => <div>A golden rabbit</div>;
GoldenRabbit.Ear = () => <div>Ear</div>;
GoldenRabbit.Ear.Ball = () => <div>Ear Ball</div>; // 중첩된 속성 정의
```

```JSX
<GoldenRabbit />
<GoldenRabbit.Ear />
<GoldenRabbit.Ear.Ball /> {/* 유효한 JSX */}
```

### 6.3.2 JSXAttributes
React 컴포넌트의 props로 전달됨.
구성요소는 `JSXAttribute`, `JSXAttributeName`, `JSXAttributeInitializer`, `JSXAttributeValue`, `JSXSpreadAttribute`가 있음.

`JSXAttribute` : 개별 속성
`JSXAttributeName`: 속성의 이름. 속성의 식별자
`JSXAttributeInitializer`: 속성값을 할당한느 부분 = 기호와 속성값
`JSXAttributeValue`: 실제로 속성에 할당되는 값
`JSXSpreadAttribute`: 스프테드 연산자를 사용하여 구현되는 기존 객체의 속성

### 6.3.3 JSXChildren
JSXChildren은 JSXText, JSXElement, JSXFragment, JSXChildExpression 이 있음.

### 6.3.4 JSX Strings
JSX에서 렌더링되는 문자열은 알파벳 뿐 아니라 유니코드로 표기할 수 있는 아이콘이나 이모지들도 포함됨.
JSX 내부에서 HTML 태그를 렌더링해야 하는 때에 `&lt;`과 같은 HTML 엔티티를 사용함.

## 학습 마무리

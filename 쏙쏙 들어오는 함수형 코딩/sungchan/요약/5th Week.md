## 핵심 개념

### 1. 코드의 냄새와 리팩터링 기법

- **함수 이름에 있는 암묵적 인자**: 비슷한 함수들이 이름에서만 차이를 보이는 문제
- **암묵적 인자를 드러내기 리팩터링**: 함수 이름에 숨어있는 값을 명시적인 매개변수로 변환
- **함수 본문을 콜백으로 바꾸기 리팩터링**: 반복되는 패턴을 고차 함수로 추상화

### 2. 일급(First-class) 개념

**일급인 것들:**

- 숫자, 문자열, 불리언, 배열, 객체, 함수
- 변수에 저장, 함수 인자로 전달, 리턴값으로 사용 가능

**일급이 아닌 것들:**

- 연산자(+, *), 키워드(if, for)
- 하지만 함수로 감싸서 일급으로 만들 수 있음

### 3. 고차 함수(Higher-order Functions)

- 함수를 인자로 받거나 함수를 리턴하는 함수
- 코드의 재사용성과 추상화 수준을 높임

## 실제 적용 예시

### 카피-온-라이트 패턴 추상화

javascript

```javascript
// 리팩터링 전: 중복 코드
function arraySet(array, idx, value) {
    var copy = array.slice()
    copy[idx] = value
    return copy
}

// 리팩터링 후: 고차 함수 활용
function withArrayCopy(array, modify) {
    var copy = array.slice()
    modify(copy)
    return copy
}
```

### 에러 처리 패턴 추상화

javascript

```javascript
// 함수를 리턴하는 함수
function wrapLogging(f) {
    return function(arg) {
        try {
            f(arg)
        } catch (error) {
            logToSnapErrors(error)
        }
    }
}
```

## 주요 장점

1. **코드 중복 제거**: 반복되는 패턴을 한 곳에서 관리
2. **재사용성 향상**: 다양한 상황에 적용 가능한 범용 함수 생성
3. **추상화 수준 향상**: 복잡한 로직을 간단한 인터페이스로 제공

## 주의사항

- 고차 함수 사용 시 **가독성이 떨어질 수 있음**
- 런타임 검사나 정적 타입 시스템으로 안전성 확보 필요
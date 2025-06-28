# Chapter 4: 액션에서 계산 빼내기 - 요약

## 핵심 개념

### 액션(Action) vs 계산(Calculation)
- **액션**: 암묵적 입력 또는 출력이 있는 함수
- **계산**: 암묵적 입력과 출력이 없는 순수 함수

### 암묵적 입출력
- **암묵적 입력**: 인자 외의 다른 입력 (전역변수 읽기, DOM 읽기 등)
- **암묵적 출력**: 리턴값 외의 다른 출력 (전역변수 변경, DOM 변경 등)

## 왜 계산으로 분리해야 하는가?

### 1. 테스트 용이성
- DOM 업데이트와 비즈니스 규칙 분리
- 전역변수 의존성 제거
- 순수한 입력-출력 관계로 테스트 간소화

### 2. 재사용성
- 다른 환경(데이터베이스, 다른 UI)에서 활용 가능
- 전역변수 의존성 없음
- 명시적인 결과 반환

## 계산 추출 3단계

1. **계산 코드를 찾아 빼내기**
2. **암묵적 입력과 출력 찾기**
3. **암묵적 입력은 인자로, 암묵적 출력은 리턴값으로 변경**

## 실제 적용 예시

### Before (액션)
```js
function calc_cart_total() {
    shopping_cart_total = 0;  // 암묵적 출력
    for(var i = 0; i < shopping_cart.length; i++) {  // 암묵적 입력
        shopping_cart_total += shopping_cart[i].price;
    }
}
```

### After (계산 분리)
```js
function calc_cart_total() {
    shopping_cart_total = calc_total(shopping_cart);  // 액션
}

function calc_total(cart) {  // 계산
    var total = 0;
    for(var i = 0; i < cart.length; i++) {
        total += cart[i].price;
    }
    return total;
}
```

---

# 퀴즈

## 퀴즈 1: 개념 이해
다음 중 **액션(Action)**의 특징이 아닌 것은?
1. 전역변수를 읽는다
2. DOM을 변경한다
3. 동일한 입력에 항상 동일한 출력을 반환한다
4. 외부 API를 호출한다

## 퀴즈 2: 코드 분석
다음 함수에서 암묵적 입력과 암묵적 출력을 찾아보세요.

```js
var user_count = 0;
function register_user(name) {
    console.log("Registering: " + name);
    user_count++;
    return "User " + name + " registered";
}
```

**암묵적 입력**: ________________
**암묵적 출력**: ________________

## 퀴즈 3: 계산으로 변환
다음 액션 함수를 계산으로 분리해보세요.

```js
var discount_rate = 0.1;
function apply_discount_to_cart() {
    for(var i = 0; i < shopping_cart.length; i++) {
        shopping_cart[i].price *= (1 - discount_rate);
    }
}
```

계산 함수를 작성하세요:
```js
function apply_discount(cart, rate) {
    // 여기에 코드 작성
}
```

## 퀴즈 4: 함수 분류
다음 함수들을 액션(A) 또는 계산(C)으로 분류하세요.

1. `function add(a, b) { return a + b; }` → ( )
2. `function saveToFile(data) { fs.writeFile('data.txt', data); }` → ( )
3. `function getCurrentTime() { return new Date(); }` → ( )
4. `function multiply(arr, factor) { return arr.map(x => x * factor); }` → ( )
5. `function updateUI() { document.getElementById('total').innerText = total; }` → ( )

## 퀴즈 5: 실전 문제
온라인 쇼핑몰에서 다음 요구사항을 구현해야 합니다:
- 장바구니 총액이 50달러 이상이면 10% 할인
- 할인된 금액을 화면에 표시

현재 코드:
```js
var cart_total = 0;
function show_discount() {
    if(cart_total >= 50) {
        var discounted = cart_total * 0.9;
        document.getElementById('discount-price').innerText = discounted;
    }
}
```

이를 액션과 계산으로 분리하여 개선해보세요.

---

## 정답

### 퀴즈 1 정답: 3번
계산은 동일한 입력에 항상 동일한 출력을 반환하지만, 액션은 그렇지 않습니다.

### 퀴즈 2 정답:
**암묵적 입력**: user_count (전역변수 읽기)
**암묵적 출력**: console.log (콘솔 출력), user_count++ (전역변수 변경)

### 퀴즈 3 정답:
```js
function apply_discount(cart, rate) {
    var new_cart = cart.slice(); // 복사본 생성
    for(var i = 0; i < new_cart.length; i++) {
        new_cart[i] = {
            ...new_cart[i],
            price: new_cart[i].price * (1 - rate)
        };
    }
    return new_cart;
}
```

### 퀴즈 4 정답:
1. C (순수 계산)
2. A (파일 시스템 변경)
3. A (시간이라는 외부 상태 읽기)
4. C (순수 계산)
5. A (DOM 변경)

### 퀴즈 5 정답:
```js
// 계산
function calculate_discount(total, threshold, rate) {
    if(total >= threshold) {
        return total * (1 - rate);
    }
    return total;
}

// 액션
function show_discount() {
    var discounted_price = calculate_discount(cart_total, 50, 0.1);
    document.getElementById('discount-price').innerText = discounted_price;
}
```

# Chapter 5: 더 좋은 액션 만들기 - 정리 및 퀴즈

## 📝 핵심 내용 정리

### 1. 비즈니스 요구사항과 설계 맞추기
- **문제**: `gets_free_shipping(total, item_price)` 함수가 비즈니스 요구사항과 맞지 않음
- **해결**: 장바구니 전체를 인자로 받도록 변경 → `gets_free_shipping(cart)`
- **효과**: 비즈니스 엔티티와 일치하는 더 직관적인 함수

### 2. 핵심 원칙 1: 암묵적 입력과 출력은 적을수록 좋다
- **암묵적 입력**: 인자가 아닌 모든 입력 (전역변수 등)
- **암묵적 출력**: 리턴값이 아닌 모든 출력 (DOM 조작, 전역변수 변경 등)
- **개선 효과**:
  - 테스트하기 쉬워짐
  - 재사용성 증가
  - 모듈화된 컴포넌트 생성

### 3. 핵심 원칙 2: 설계는 엉켜있는 코드를 푸는 것
- **함수 분리의 장점**:
  - 재사용하기 쉽다
  - 유지보수하기 쉽다
  - 테스트하기 쉽다
- **예시**: `add_item()` 함수를 3개 함수로 분리
  - `add_element_last()` - 배열 유틸리티
  - `add_item()` - 카트 관련 동작
  - `make_cart_item()` - 아이템 생성자

### 4. 계산 분류 체계
- **C**: Cart에 대한 동작
- **I**: Item에 대한 동작  
- **B**: Business 규칙
- **A**: Array 유틸리티

### 5. 카피-온-라이트 패턴
- 원본을 변경하지 않고 복사본을 만들어 수정
- 함수형 프로그래밍의 핵심 개념
- 불변성 보장

---

## 🧩 퀴즈

### 문제 1 (개념 이해)
다음 중 **암묵적 입력**에 해당하는 것은?

a) 함수의 매개변수
b) 함수 내에서 읽는 전역변수
c) 함수의 리턴값
d) 함수 내에서 선언한 지역변수

<details>
<summary>정답 보기</summary>
<strong>정답: b)</strong><br>
암묵적 입력은 인자가 아닌 모든 입력을 의미하며, 전역변수를 읽는 것이 대표적인 예입니다.
</details>

### 문제 2 (코드 분석)
다음 코드에서 암묵적 입력과 출력을 찾아보세요:

```javascript
var total = 0; // 전역변수

function addToTotal(amount) {
    total += amount;        // 1
    console.log(total);     // 2
    return amount * 2;      // 3
}
```

a) 암묵적 입력: 1, 암묵적 출력: 2
b) 암묵적 입력: 1, 암묵적 출력: 2, 3
c) 암묵적 입력: 1, 암묵적 출력: 1, 2
d) 암묵적 입력: 없음, 암묵적 출력: 1, 2

<details>
<summary>정답 보기</summary>
<strong>정답: c)</strong><br>
- 암묵적 입력: total 전역변수 읽기 (1번)<br>
- 암묵적 출력: total 전역변수 변경 (1번), console.log 출력 (2번)<br>
- 3번은 명시적 출력(리턴값)입니다.
</details>

### 문제 3 (함수 분리)
다음 함수를 더 작은 함수들로 분리한다면, 어떤 기준으로 나누는 것이 좋을까요?

```javascript
function processOrder(customerName, items) {
    // 1. 고객 정보 검증
    if (!customerName) return false;
    
    // 2. 주문 총액 계산
    var total = 0;
    for (var i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    
    // 3. 할인 적용
    if (total > 100) {
        total *= 0.9;
    }
    
    // 4. 주문 저장
    saveOrder(customerName, items, total);
    
    return total;
}
```

a) 한 함수가 하나의 책임만 갖도록 분리
b) 코드 라인 수가 균등하게 분리
c) 변수 사용량에 따라 분리
d) 실행 시간에 따라 분리

<details>
<summary>정답 보기</summary>
<strong>정답: a)</strong><br>
각 함수가 하나의 책임만 갖도록 분리하는 것이 원칙입니다:<br>
- validateCustomer() - 고객 검증<br>
- calculateTotal() - 총액 계산<br>
- applyDiscount() - 할인 적용<br>
- processOrder() - 전체 조합
</details>

### 문제 4 (카피-온-라이트)
다음 중 카피-온-라이트 패턴을 올바르게 구현한 것은?

a) 
```javascript
function addItem(arr, item) {
    arr.push(item);
    return arr;
}
```

b)
```javascript
function addItem(arr, item) {
    var newArr = arr.slice();
    newArr.push(item);
    return newArr;
}
```

c)
```javascript
function addItem(arr, item) {
    return arr.concat(item);
}
```

d) b와 c 모두

<details>
<summary>정답 보기</summary>
<strong>정답: d)</strong><br>
b) slice()로 복사 후 수정, c) concat()으로 새 배열 생성 - 둘 다 원본을 변경하지 않는 카피-온-라이트 패턴입니다.<br>
a)는 원본 배열을 직접 수정하므로 잘못된 방법입니다.
</details>

### 문제 5 (설계 개선)
다음 코드를 개선하려고 합니다. 가장 우선적으로 해야 할 일은?

```javascript
function updateUserProfile() {
    var user = getCurrentUser();  // 전역상태 읽기
    var name = getUserInput();    // DOM 읽기
    
    user.name = name;            // 객체 변경
    saveUser(user);              // DB 저장
    updateDOM();                 // DOM 업데이트
    showNotification("저장됨");   // 사이드 이펙트
}
```

a) 함수 이름 변경
b) 코드 라인 수 줄이기
c) 암묵적 입력을 명시적 입력으로 변경
d) 주석 추가

<details>
<summary>정답 보기</summary>
<strong>정답: c)</strong><br>
getCurrentUser(), getUserInput() 등의 암묵적 입력을 매개변수로 받도록 변경하는 것이 우선입니다. 이렇게 하면 함수가 더 예측 가능하고 테스트하기 쉬워집니다.
</details>

### 문제 6 (종합 문제)
함수형 프로그래밍에서 "더 좋은 액션"을 만들기 위한 전략이 아닌 것은?

a) 암묵적 입력과 출력을 줄인다
b) 함수를 작게 만들어 한 가지 일만 하게 한다
c) 전역변수를 많이 사용하여 데이터 공유를 쉽게 한다
d) 카피-온-라이트 패턴을 사용하여 불변성을 지킨다

<details>
<summary>정답 보기</summary>
<strong>정답: c)</strong><br>
전역변수를 많이 사용하는 것은 암묵적 입력/출력을 증가시켜 함수형 프로그래밍 원칙에 반합니다. 대신 명시적인 매개변수와 리턴값을 사용해야 합니다.
</details>

---

## 💡 복습 포인트

1. **비즈니스 요구사항 중심의 설계**: 함수가 실제 비즈니스 개념과 일치하도록 설계
2. **암묵적 → 명시적**: 숨겨진 의존성을 드러내어 코드를 더 예측 가능하게 만들기
3. **분리와 조합**: 엉켜있는 코드를 풀어서 각각을 이해하기 쉽게 만든 후 필요시 조합
4. **계층화**: 코드를 의미있는 계층(유틸리티, 비즈니스 로직, 도메인 등)으로 구분
5. **불변성**: 데이터를 직접 변경하지 않고 복사본을 만들어 수정하는 습관
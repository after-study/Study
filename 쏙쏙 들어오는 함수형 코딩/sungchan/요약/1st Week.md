# 함수형 프로그래밍 기초 - CHAPTER 1~3 정리 및 질문

## 📚 CHAPTER 1: 함수형 프로그래밍의 정의와 현실의 차이

### 핵심 개념

- **기존 정의의 한계**: 위키피디아의 정의(수학 함수 사용, 부수 효과 피하기)는 실무에서 실용적이지 않음
- **실용적 접근**: 이 책은 학술적 정의보다 실무에서 바로 사용할 수 있는 함수형 사고에 집중

### 액션, 계산, 데이터 구분 (핵심 개념)

|분류|특징|예시|활용 도구|
|---|---|---|---|
|**액션**|실행 시점/횟수에 의존|이메일 보내기, DB 조회|시간 제어, 순서 보장 기법|
|**계산**|같은 입력 → 같은 출력|수학 연산, 데이터 변환|정적 분석, 테스트 전략|
|**데이터**|이벤트에 대한 사실 기록|사용자 정보, 설정값|데이터 구성, 보관, 분석 기술|

### 함수형 사고의 두 가지 핵심

1. **액션과 계산, 데이터를 구분해서 생각하기** (파트 1)
2. **일급 추상(first-class abstraction)** (파트 2)

---

## 🏪 CHAPTER 2: 현실에서의 함수형 사고

### 토니 피자 예제를 통한 학습

- **파트 1**: 액션과 계산, 데이터 구분 + 계층형 설계
- **파트 2**: 분산 시스템 + 타임라인 다이어그램 + 일급 함수

### 계층형 설계 (Stratified Design)

변경 빈도에 따라 코드를 계층으로 나누는 설계 방법

|계층|변경 빈도|예시|특징|
|---|---|---|---|
|**비즈니스 규칙**|자주 바뀜|이번 주 특별 메뉴|의존성 적음, 쉽게 변경|
|**도메인 규칙**|가끔 바뀜|피자 만들기 과정|중간 수준의 안정성|
|**기술 스택**|자주 안 바뀜|JavaScript 객체/배열|의존성 많음, 안정적 기반|

### 타임라인 다이어그램

- **목적**: 액션의 실행 순서를 시각화
- **분산 시스템**: 여러 로봇이 동시에 작업할 때의 문제점 파악
- **타임라인 커팅**: 여러 타임라인의 동기화 지점 설정

### 분산 시스템에서 배운 교훈

1. 타임라인은 기본적으로 순서를 맞추지 않음
2. 액션 실행 시간은 예측 불가능
3. 타이밍 문제는 드물지만 실제로 발생
4. 타임라인 다이어그램으로 시스템 문제 파악 가능

---

## 📧 CHAPTER 3: 액션과 계산, 데이터의 차이를 알기

### 쿠폰독 마케팅 시스템 예제

- **목표**: 10명 이상 추천한 사용자에게 'best' 쿠폰 발송
- **데이터베이스**: 구독자 테이블, 쿠폰 테이블

### 구현 과정에서의 함수형 사고 적용

#### 1. 문제 분석 단계

```
데이터베이스 조회 (액션) → 필터링 (계산) → 이메일 생성 (계산) → 이메일 발송 (액션)
```

#### 2. 핵심 함수들

**구독자 등급 결정 (계산)**

```javascript
function subCouponRank(subscriber) {
    if(subscriber.rec_count >= 10)
        return "best";
    else
        return "good";
}
```

**쿠폰 필터링 (계산)**

```javascript
function selectCouponsByRank(coupons, rank) {
    var ret = [];
    for(var c = 0; c < coupons.length; c++) {
        var coupon = coupons[c];
        if(coupon.rank === rank)
            ret.push(coupon.code);
    }
    return ret;
}
```

**전체 프로세스 (액션)**

```javascript
function sendIssue() {
    var coupons = fetchCouponsFromDB();           // 액션
    var goodCoupons = selectCouponsByRank(coupons, "good"); // 계산
    var bestCoupons = selectCouponsByRank(coupons, "best"); // 계산
    var subscribers = fetchSubscribersFromDB();   // 액션
    var emails = emailsForSubscribers(subscribers, goodCoupons, bestCoupons); // 계산
    
    for(var e = 0; e < emails.length; e++) {
        emailSystem.send(emails[e]);              // 액션
    }
}
```

### 액션의 전파 특성

- **액션을 호출하는 함수는 액션이 됨**
- **액션은 코드 전체로 퍼져나감**
- **따라서 액션 사용 시 신중해야 함**

### 각 분류의 특징 상세

#### 데이터

- **장점**: 직렬화, 동일성 비교, 자유로운 해석 가능
- **단점**: 해석이 반드시 필요 (해석 없으면 무용)
- **불변성 보장 기법**: 카피-온-라이트, 방어적 복사

#### 계산

- **장점**: 테스트 용이, 분석 쉬움, 조합 용이
- **단점**: 실행 전까지 결과 예측 불가
- **다른 이름**: 순수함수, 수학함수

#### 액션

- **특징**: 외부 세계와 상호작용
- **주의사항**: 가능한 적게 사용, 작게 만들기, 제한적 사용
- **다른 이름**: 부수효과 함수, 순수하지 않은 함수

---

## 🤔 학습 확인 질문

### 기본 개념 이해 (CHAPTER 1)

1. **함수형 프로그래밍의 기존 정의가 실무에서 한계를 갖는 이유 3가지는 무엇인가요?**
    
2. **다음 중 액션, 계산, 데이터로 올바르게 분류된 것은?**
    
    - A) 이메일 발송(계산), 최댓값 찾기(액션), 사용자 정보(데이터)
    - B) 이메일 발송(액션), 최댓값 찾기(계산), 사용자 정보(데이터)
    - C) 이메일 발송(데이터), 최댓값 찾기(액션), 사용자 정보(계산)

### 계층형 설계 이해 (CHAPTER 2)

3. **계층형 설계에서 "자주 바뀌는 것"이 위층에, "자주 바뀌지 않는 것"이 아래층에 위치하는 이유는 무엇인가요?**
    
4. **타임라인 커팅(Timeline Cutting)의 목적과 효과를 설명해보세요.**
    
5. **분산 시스템에서 배운 4가지 교훈을 모두 나열하고, 각각이 왜 중요한지 설명해보세요.**
    

### 실전 적용 (CHAPTER 3)

6. **다음 코드에서 액션과 계산을 구분하고, 그 이유를 설명해보세요:**
    
    ```javascript
    function processUser(userId) {
        var user = getUserFromDB(userId);        // (1)
        var age = calculateAge(user.birthDate);  // (2)
        var category = determineCategory(age);   // (3)
        sendWelcomeEmail(user.email, category);  // (4)
        return category;
    }
    ```
    
7. **"액션은 코드 전체로 퍼진다"는 말의 의미를 예시와 함께 설명해보세요.**
    

### 심화 이해

8. **쿠폰독 예제에서 페이지네이션을 적용한 이유와, 이것이 함수형 사고와 어떤 관련이 있는지 설명해보세요.**
    
9. **데이터, 계산, 액션 순으로 구현하는 것이 함수형 프로그래밍의 일반적인 순서라고 했습니다. 이 순서의 장점은 무엇인가요?**
    
10. **계산을 액션보다 선호하는 이유를 테스트 관점에서 설명해보세요.**
    

### 실습 문제

11. **온라인 쇼핑몰의 주문 처리 시스템을 액션, 계산, 데이터로 분류해보세요:**
    
    - 장바구니에서 상품 제거
    - 총 주문 금액 계산
    - 사용자 주문 이력
    - 재고 확인
    - 결제 처리
    - 할인율 적용 계산
12. **타임라인 다이어그램을 그려야 하는 상황을 3가지 제시하고, 각각에 대해 간단한 다이어그램을 스케치해보세요.**
    

---

## 💡 추가 학습 팁

1. **실무 적용**: 현재 작업하는 코드에서 액션, 계산, 데이터를 구분해보는 연습
2. **리팩터링 연습**: 액션을 계산으로 바꿀 수 있는 부분 찾아보기
3. **설계 검토**: 새로운 기능을 설계할 때 계층형 설계 원칙 적용해보기
4. **타임라인 분석**: 비동기 처리가 필요한 상황에서 타임라인 다이어그램 그려보기

---

## 📖 다음 학습 예고

CHAPTER 4부터는 액션에서 계산을 빼내는 구체적인 기법들을 학습하게 됩니다. 특히 불변성을 유지하면서 데이터를 다루는 방법들이 중점적으로 다뤄질 예정입니다.
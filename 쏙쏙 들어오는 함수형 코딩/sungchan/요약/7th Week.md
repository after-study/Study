# 함수형 프로그래밍 Chapter 14-15 요약

## Chapter 14: 중첩된 데이터에 함수형 도구 사용하기

### 🎯 핵심 개념

#### 1. update() 함수 도출

중첩된 객체의 값을 안전하게 변경하기 위한 고차 함수

**❌ 리팩터링 전 (중복 코드)**

```javascript
function incrementField(item, field) {
    var value = item[field];           // 조회
    var newValue = value + 1;          // 변경  
    var newItem = objectSet(item, field, newValue);  // 설정
    return newItem;
}

function decrementField(item, field) {
    var value = item[field];           // 조회
    var newValue = value - 1;          // 변경
    var newItem = objectSet(item, field, newValue);  // 설정  
    return newItem;
}
```

**✅ 리팩터링 후 (update 함수 활용)**

```javascript
function update(object, key, modify) {
    var value = object[key];                         // 조회
    var newValue = modify(value);                    // 변경
    var newObject = objectSet(object, key, newValue); // 설정
    return newObject;
}

// 사용 예시
function incrementField(item, field) {
    return update(item, field, function(value) {
        return value + 1;
    });
}
```

#### 2. 중첩 레벨에 따른 함수들

- `update()`: 1단계 중첩 (object.key)
- `update2()`: 2단계 중첩 (object.key1.key2)
- `update3()`: 3단계 중첩 (object.key1.key2.key3)
- `nestedUpdate()`: 임의 깊이 중첩

#### 3. nestedUpdate() - 재귀를 활용한 범용 함수

```javascript
function nestedUpdate(object, keys, modify) {
    if(keys.length === 0) return modify(object); // 🛑 종료 조건
    
    var key1 = keys[0];
    var restOfKeys = drop_first(keys);            // 📉 점점 줄어듦
    return update(object, key1, function(value1) {
        return nestedUpdate(value1, restOfKeys, modify); // 🔄 재귀 호출
    });
}
```

**사용 예시**

```javascript
// cart[name].options.size를 1 증가
function incrementSizeByName(cart, name) {
    return nestedUpdate(cart, [name, 'options', 'size'], function(size) {
        return size + 1;
    });
}
```

#### 4. 🛡️ 안전한 재귀 사용법

1. **종료 조건**: 재귀가 멈춰야 하는 조건 명시
2. **재귀 호출**: 자기 자신을 호출
3. **종료 조건에 다가가기**: 인자가 점점 줄어들어야 함

#### 5. 🏗️ 추상화 벽을 통한 복잡성 관리

```javascript
// 구체적인 경로를 추상화로 감춤
function updatePostById(category, id, modifyPost) {
    return nestedUpdate(category, ['posts', id], modifyPost);
}

function updateAuthor(post, modifyUser) {
    return update(post, 'author', modifyUser);
}

function capitalizeName(user) {
    return update(user, 'name', capitalize);
}

// 💡 사용할 때는 복잡한 구조를 몰라도 됨
updatePostById(blogCategory, '12', function(post) {
    return updateAuthor(post, capitalizeName);
});
```

---

## Chapter 15: 타임라인 격리하기

### 🎯 핵심 개념

#### 1. 📊 타임라인 다이어그램

시간에 따른 액션의 실행 순서를 시각화하는 도구

**📋 기본 규칙**

- 순서대로 실행되는 액션 → 같은 타임라인에 배치
- 동시에 실행되는 액션 → 분리된 타임라인에 배치

#### 2. ⚠️ 비동기 코드의 문제점

```javascript
function calc_cart_total() {
    total = 0; // 🚨 전역변수 사용
    cost_ajax(cart, function(cost) {
        total += cost; // ⚡ 다른 타임라인에서 total이 변경될 수 있음
        shipping_ajax(cart, function(shipping) {
            total += shipping;
            update_total_dom(total);
        });
    });
}
```

**🔥 문제상황**: 빠른 연속 클릭 시

- 전역변수 `total`과 `cart`를 여러 타임라인이 공유
- 예상: 6달러 × 2개 + 배송비 2달러 = 14달러
- 실제: 16달러 또는 22달러 (예측 불가능)

#### 3. ✨ 좋은 타임라인 설계 원칙

1. **타임라인은 적을수록** 이해하기 쉬움
2. **타임라인은 짧을수록** 이해하기 쉬움
3. **공유하는 자원이 적을수록** 이해하기 쉬움
4. **자원을 공유한다면 서로 조율**해야 함
5. **시간을 일급으로 다룸**

#### 4. 🔧 문제 해결 방법

**✅ 전역변수를 지역변수로 변경**

```javascript
function calc_cart_total(cart, callback) {
    var total = 0; // 🎯 지역변수로 변경 - 타임라인 간 공유 없음
    cost_ajax(cart, function(cost) {
        total += cost;
        shipping_ajax(cart, function(shipping) {
            total += shipping;
            callback(total); // 📤 콜백으로 결과 전달
        });
    });
}
```

**✅ 암묵적 인자를 명시적 인자로 변경**

```javascript
function add_item_to_cart(name, price, quantity) {
    cart = add_item(cart, name, price, quantity);
    calc_cart_total(cart, update_total_dom); // 📥 cart를 인자로 전달
}
```

#### 5. 🧵 자바스크립트 스레드 모델

- **단일 스레드, 비동기**: 동시 실행은 없지만 실행 순서는 예측 불가
- **이벤트 큐**: 비동기 콜백들이 대기하는 큐
- **타임라인 단순화**: 연속된 액션들을 하나로 통합 가능

#### 6. 📐 타임라인 다이어그램 그리기 단계

1. **액션 확인**: 전역변수를 읽고 쓰는 부분 식별
2. **각 액션 그리기**: 순서대로/동시 실행 구분
3. **단순화**: 자바스크립트 특성을 고려해 통합

---

## 🎓 핵심 교훈

### Chapter 14: 데이터 구조 마스터하기

- ✅ 중첩된 데이터 구조를 함수형 방식으로 안전하게 다루기
- ✅ 재귀를 활용한 범용적인 데이터 조작 함수 구현
- ✅ 추상화를 통한 복잡성 관리
- ✅ 카피-온-라이트 원칙 유지

### Chapter 15: 동시성 문제 해결하기

- ✅ 비동기 코드에서 발생하는 동시성 문제 이해
- ✅ 타임라인 다이어그램을 통한 코드 실행 순서 분석
- ✅ 공유 자원 최소화를 통한 버그 방지
- ✅ 지역변수와 명시적 인자를 통한 격리

---

## 💡 함수형 프로그래밍 원칙 적용

두 챕터 모두 함수형 프로그래밍의 핵심 원칙들을 실제 문제 해결에 적용:

- **🔒 불변성**: 원본 데이터를 변경하지 않고 새로운 복사본 생성
- **🧮 순수함수**: 같은 입력에 대해 항상 같은 출력, 부수효과 없음
- **🔗 합성**: 작은 함수들을 조합해 복잡한 기능 구현
- **📍 명시적 의존성**: 필요한 데이터를 인자로 명시적 전달
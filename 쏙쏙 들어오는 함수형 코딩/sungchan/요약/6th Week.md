# 챕터 12, 13 요약 정리

## 챕터 12: 함수형 반복

### 핵심 개념

함수형 프로그래밍의 기본적인 세 가지 고차 함수(`map()`, `filter()`, `reduce()`)를 통해 반복문을 함수형으로 리팩터링하는 방법을 학습합니다.

### 주요 함수형 도구

#### 1. map() - 변환

```js
function map(array, f) {
    var newArray = [];
    forEach(array, function(element) {
        newArray.push(f(element));
    });
    return newArray;
}

// 사용 예시
map(customers, function(customer) {
    return customer.email;
});
```

- **목적**: 배열의 모든 항목을 변환하여 새 배열 생성
- **특징**: 원본 배열과 같은 길이의 새 배열 반환

#### 2. filter() - 선택

```js
function filter(array, f) {
    var newArray = [];
    forEach(array, function(element) {
        if(f(element)) {
            newArray.push(element);
        }
    });
    return newArray;
}

// 사용 예시
filter(customers, function(customer) {
    return customer.purchases.length >= 3;
});
```

- **목적**: 조건에 맞는 항목만 선택하여 새 배열 생성
- **특징**: 원본 배열보다 작거나 같은 길이의 새 배열 반환

#### 3. reduce() - 집계

```js
function reduce(array, init, f) {
    var accum = init;
    forEach(array, function(element) {
        accum = f(accum, element);
    });
    return accum;
}

// 사용 예시
reduce(customers, 0, function(total, customer) {
    return total + customer.purchases.length;
});
```

- **목적**: 배열의 모든 항목을 하나의 값으로 집계
- **특징**: 초깃값부터 시작해서 누적 계산

### 리팩터링 패턴

- **코드 냄새**: 함수 이름에 있는 암묵적 인자
- **해결책**:
    1. 암묵적 인자를 드러내기
    2. 함수 본문을 콜백으로 바꾸기

### reduce()로 할 수 있는 것들

- 실행 취소/실행 복귀
- 테스트할 때 사용자 입력을 다시 실행하기
- 시간 여행 디버깅
- 회계 감사 추적

---

## 챕터 13: 함수형 도구 체이닝

### 핵심 개념

복잡한 데이터 처리를 위해 여러 함수형 도구를 연결(체이닝)하여 사용하는 방법을 학습합니다.

### 체이닝 예시

#### 우수 고객의 가장 비싼 구매

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    });
    
    var biggestPurchases = map(bestCustomers, function(customer) {
        return maxKey(customer.purchases, {total: 0}, function(purchase) {
            return purchase.total;
        });
    });
    
    return biggestPurchases;
}
```

### 체인을 명확하게 만드는 방법

#### 1. 단계에 이름 붙이기

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = selectBestCustomers(customers);
    var biggestPurchases = getBiggestPurchases(bestCustomers);
    return biggestPurchases;
}
```

#### 2. 콜백에 이름 붙이기

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, isGoodCustomer);
    var biggestPurchases = map(bestCustomers, getBiggestPurchase);
    return biggestPurchases;
}

function isGoodCustomer(customer) {
    return customer.purchases.length >= 3;
}
```

### 반복문을 함수형 도구로 리팩터링하는 전략

#### 1. 이해하고 다시 만들기

- 반복문의 의도를 파악한 후 함수형 도구로 재구성

#### 2. 단서를 찾아 리팩터링

- 반복문 패턴 분석:
    - 새 배열에 추가 → `map()`
    - 조건부 추가 → `filter()`
    - 값 누적 → `reduce()`

### 체이닝 팁

#### 팁 1: 데이터 만들기

```js
// 인덱스 배열 생성으로 함수형 도구 적용 가능
var indices = range(0, array.length);
```

#### 팁 2: 한 번에 전체 배열 조작하기

```js
// 하위 배열을 만들어서 전체 배열로 처리
var subarray = array.slice(i, i + window);
var average = reduce(subarray, 0, plus) / subarray.length;
```

#### 팁 3: 작은 단계로 나누기

```js
// 복잡한 작업을 여러 단계로 분리
var indices = range(0, array.length);           // 1단계
var windows = map(indices, getSubarray);        // 2단계  
var averages = map(windows, calculateAverage);  // 3단계
```

### 현대적 구현 방식

#### ES6 메서드 체이닝

```js
function movingAverage(numbers) {
    return numbers
        .map((e, i) => numbers.slice(i, i + window))
        .map(average);
}
```

#### Lodash를 사용한 전통적인 자바스크립트

```js
function movingAverage(numbers) {
    return _.chain(numbers)
        .map(function(e, i) { return numbers.slice(i, i + window); })
        .map(average)
        .value();
}
```

#### Java 8 스트림

```java
public static List<Double> movingAverage(List<Double> numbers) {
    return IntStream
        .range(0, numbers.size())
        .mapToObj(i -> numbers.subList(i, Math.min(i + 3, numbers.size())))
        .map(Utils::average)
        .collect(Collectors.toList());
}
```

### 절차적 코드 vs 함수형 코드 비교

#### 절차적 코드

```js
var answer = [];
var window = 5;

for (var i = 0; i < array.length; i++) {
    var sum = 0;
    var count = 0;
    for (var w = 0; w < window; w++) {
        var idx = i + w;
        if (idx < array.length) {
            sum += array[idx];
            count += 1;
        }
    }
    answer.push(sum / count);
}
```

#### 함수형 코드

```js
function range(start, end) {
    var ret = [];
    for (var i = start; i < end; i++)
        ret.push(i);
    return ret;
}

var window = 5;
var indices = range(0, array.length);
var windows = map(indices, function(i) {
    return array.slice(i, i + window);
});
var answer = map(windows, average);
```

### 체이닝 디버깅 팁

1. **구체적인 것을 유지하기**: 의미를 기억하기 쉽게 이름을 붙이세요
2. **출력해보기**: 각 단계의 결과를 확인하세요
3. **타입을 따라가 보기**: 각 단계에서 만들어지는 값의 타입을 추적하세요

### 다양한 함수형 도구

- **pluck()**: 특정 필드값을 가져오기
- **concat()**: 중첩된 배열을 한 단계의 배열로 만들기
- **frequenciesBy()와 groupBy()**: 개수를 세거나 그룹화하기

### 값을 만들기 위한 reduce() 활용

#### 장바구니 상태 재구성 예시

```js
var itemsAdded = ["shirt", "shoes", "shirt", "socks", "hat"];

var shoppingCart = reduce(itemsAdded, {}, function(cart, item) {
    if (!cart[item])
        return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
    else {
        var quantity = cart[item].quantity;
        return setFieldByName(cart, item, 'quantity', quantity + 1);
    }
});
```

#### 추가/삭제 모두 처리하는 예시

```js
var itemOps = [
    ['add', 'shirt'], 
    ['add', 'shoes'], 
    ['remove', 'shirt']
];

var shoppingCart = reduce(itemOps, {}, function(cart, itemOp) {
    var op = itemOp[0];
    var item = itemOp[1];
    if (op === 'add') return addOne(cart, item);
    if (op === 'remove') return removeOne(cart, item);
});
```

### 주요 장점

1. **가독성**: 각 단계가 명확하게 분리됨
2. **재사용성**: 작은 함수들을 조합하여 사용
3. **디버깅**: 각 단계별로 결과 확인 가능
4. **유지보수**: 변경이 필요한 부분만 수정 가능
5. **조합성**: 작은 함수들을 조합하여 복잡한 문제 해결

### 결론

두 챕터 모두 함수형 프로그래밍의 핵심인 **조합성(composability)**을 강조하며, 작은 함수들을 조합하여 복잡한 문제를 해결하는 방법을 제시합니다. 함수형 도구들은 반복문을 대체하여 코드의 목적을 더 명확하게 만들고, 체이닝을 통해 복잡한 데이터 변환을 단계별로 처리할 수 있게 해줍니다.
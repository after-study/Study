# CHAPTER 16-17: 타임라인과 동시성 제어 완전 정리

## 📋 개요
함수형 프로그래밍에서 **타임라인**과 **동시성 기본형(concurrency primitive)**을 활용하여 자원 공유 문제를 해결하고 타임라인을 조율하는 방법을 다룹니다.

---

## 🎯 좋은 타임라인의 5가지 원칙

1. **타임라인은 적을수록 이해하기 쉽습니다**
2. **타임라인은 짧을수록 이해하기 쉽습니다**
3. **공유하는 자원이 적을수록 이해하기 쉽습니다**
4. **자원을 공유한다면 서로 조율해야 합니다**
5. **⭐ 시간을 일급으로 다룹니다** (명시적 시간 모델 생성)

---

## 📦 Chapter 16: 자원 공유 문제와 해결

### 🐛 문제 상황
장바구니에 연속으로 제품을 추가할 때 DOM 업데이트 순서가 섞여서 잘못된 결과가 표시되는 버그 발생

### 🔧 해결 방법: Queue 동시성 기본형

#### 1단계: 기본 Queue 구현
```javascript
function Queue(worker) {
    var queue_items = []
    var working = false

    function runNext() {
        if(working) return;
        if(queue_items.length === 0) return;
        
        working = true
        var item = queue_items.shift()
        
        worker(item.data, function(val) {
            working = false
            setTimeout(item.callback, 0, val)
            runNext()
        })
    }
    
    return function(data, callback) {
        queue_items.push({
            data: data,
            callback: callback || function() {}
        })
        setTimeout(runNext, 0)
    }
}
```

#### 2단계: 드로핑 Queue로 최적화
```javascript
function DroppingQueue(max, worker) {
    // ... 기본 Queue 코드 ...
    
    return function(data, callback) {
        queue_items.push({
            data: data,
            callback: callback || function() {}
        })
        // 최대 크기 초과시 오래된 항목 제거
        while(queue_items.length > max) {
            queue_items.shift()
        }
        setTimeout(runNext, 0)
    }
}
```

### 💡 핵심 아이디어
- **현실에서 착안**: 줄 서기처럼 순서를 보장하는 방법 적용
- **재사용 가능**: 고차 함수로 구현하여 다양한 상황에 활용 가능
- **안전한 공유**: 큐를 통해 공유 자원에 순차적으로 접근

---

## 🎛️ Chapter 17: 타임라인 조율하기

### 🐛 새로운 문제 상황
성능 최적화를 위해 병렬로 Ajax 요청을 보내니 `total` 변수가 올바르게 업데이트되지 않는 버그 발생

### 🔧 해결 방법: Cut 동시성 기본형

#### Cut 구현
```javascript
function Cut(num, callback) {
    var num_finished = 0
    return function() {
        num_finished += 1
        if(num_finished === num)
            callback()
    }
}
```

#### Cut 적용 예시
```javascript
function calc_cart_total(cart, callback) {
    var total = 0
    var done = Cut(2, function() {
        callback(total)
    })
    
    cost_ajax(cart, function(cost) {
        total += cost
        done()
    })
    shipping_ajax(cart, function(shipping) {
        total += shipping
        done()
    })
}
```

### 🚀 추가 동시성 기본형: JustOnce

```javascript
function JustOnce(action) {
    var alreadyCalled = false
    return function(a, b, c) {
        if(alreadyCalled) return
        alreadyCalled = true
        return action(a, b, c)
    }
}
```

---

## 🧠 핵심 개념 정리

### 동시성 기본형(Concurrency Primitive)이란?
> 여러 스레드가 동시에 실행될 때 공유 자원에 안전하게 접근하고 조작할 수 있도록 하는 기본적인 도구

### 타임라인 다이어그램의 중요성
- **시각적 분석**: 복잡한 타이밍 문제를 명확히 파악
- **순서 보장**: 실행 가능한 순서를 제한하여 예측 가능성 향상
- **버그 예방**: 배포 전 타이밍 버그 사전 발견

### 암묵적 vs 명시적 시간 모델

#### 암묵적 시간 모델 (JavaScript 기본)
1. 순차적 구문은 순서대로 실행
2. 두 타임라인의 단계는 실행 순서 불확실
3. 비동기 이벤트는 새 타임라인에서 실행
4. 액션은 호출할 때마다 실행

#### 명시적 시간 모델 (함수형 접근)
- **Queue**: 순서 보장
- **Cut**: 병렬 완료 대기
- **JustOnce**: 단일 실행 보장

---

## 📊 장점과 효과

### 성능 향상
- **병렬 처리**: Ajax 요청을 동시에 보내 응답 시간 단축
- **불필요한 작업 제거**: DroppingQueue로 중간 결과 스킵

### 안정성 향상
- **순서 보장**: 공유 자원 접근 순서 제어
- **경쟁 조건 해결**: 타이밍 버그 원천 차단

### 코드 품질 향상
- **재사용성**: 동시성 기본형을 다양한 상황에 적용
- **가독성**: 타임라인 다이어그램으로 복잡한 로직 시각화
- **유지보수성**: 명시적 시간 모델로 예측 가능한 동작

---

## 🎯 실무 적용 포인트

1. **타이밍 버그 의심시**: 타임라인 다이어그램 작성
2. **성능과 안정성 balance**: 적절한 동시성 기본형 선택
3. **현실 문제에서 착안**: 줄서기, 신호등 등의 개념 활용
4. **점진적 개선**: 작은 단계부터 시작하여 리팩터링

---

## 🔍 핵심 메시지

> **함수형 프로그래밍의 힘**: 복잡한 동시성 문제도 작은 재사용 가능한 함수들로 우아하게 해결할 수 있다!

동시성 기본형을 통해 **시간을 일급 객체로 다루며**, 예측 불가능한 타이밍 문제를 **예측 가능하고 안전한 코드**로 변환하는 것이 이 챕터들의 핵심입니다.
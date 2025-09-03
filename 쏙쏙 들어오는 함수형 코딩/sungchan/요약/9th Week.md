# Chapter 18-19 함수형 프로그래밍 아키텍처와 학습 가이드 요약

## Chapter 18: 반응형 아키텍처와 어니언 아키텍처

### 두 아키텍처 패턴의 특징
- **반응형 아키텍처**: 순차적 액션 단계에서 사용
- **어니언 아키텍처**: 서비스의 모든 단계에서 사용
- 두 패턴은 독립적이지만 함께 사용 가능

### 반응형 아키텍처 (Reactive Architecture)

#### 핵심 개념
- 이벤트에 대한 반응으로 일어날 일을 지정하는 구조
- 순차적 액션의 순서를 뒤집어 원인과 효과를 분리
- 웹 서비스와 UI에 적합

#### 주요 구성요소

**1. ValueCell (일급 상태)**
```javascript
function ValueCell(initialValue) {
  var currentValue = initialValue;
  var watchers = [];
  return {
    val: function() { return currentValue; },
    update: function(f) { 
      var oldValue = currentValue;
      var newValue = f(oldValue);
      if(oldValue !== newValue) {
        currentValue = newValue;
        forEach(watchers, function(watcher) {
          watcher(newValue);
        });
      }
    },
    addWatcher: function(f) { watchers.push(f); }
  };
}
```

**2. FormulaCell (파생 값)**
```javascript
function FormulaCell(upstreamCell, f) {
  var myCell = ValueCell(f(upstreamCell.val()));
  upstreamCell.addWatcher(function(newUpstreamValue) {
    myCell.update(function(currentValue) {
      return f(newUpstreamValue);
    });
  });
  return {
    val: myCell.val,
    addWatcher: myCell.addWatcher
  };
}
```

#### 반응형 아키텍처의 장점
1. **원인과 효과 분리**: n×m 문제를 n+m 문제로 변환
2. **파이프라인 처리**: 액션과 계산을 조합한 파이프라인 구성
3. **유연한 타임라인**: 작은 독립적인 타임라인들로 분리

#### 적용 예시
**기존 코드:**
```javascript
function add_item_to_cart(name, price) {
  var item = make_cart_item(name, price);
  shopping_cart = add_item(shopping_cart, item);
  
  var total = calc_total(shopping_cart);
  set_cart_total_dom(total);
  update_shipping_icons(shopping_cart);
  update_tax_dom(total);
}
```

**반응형 아키텍처 적용:**
```javascript
var shopping_cart = ValueCell({});
var cart_total = FormulaCell(shopping_cart, calc_total);

function add_item_to_cart(name, price) {
  var item = make_cart_item(name, price);
  shopping_cart.update(function(cart) {
    return add_item(cart, item);
  });
}

shopping_cart.addWatcher(update_shipping_icons);
cart_total.addWatcher(set_cart_total_dom);
cart_total.addWatcher(update_tax_dom);
```

### 어니언 아키텍처 (Onion Architecture)

#### 구조와 규칙
![어니언 아키텍처 구조]
- **인터랙션 계층**: 현실 세계와의 상호작용 (액션)
- **도메인 계층**: 비즈니스 로직과 규칙 (대부분 계산)
- **언어 계층**: 언어 기능과 라이브러리

#### 핵심 규칙
1. 현실 세계와의 상호작용은 인터랙션 계층에서만
2. 계층 호출 방향은 중심 방향 (의존성이 안쪽으로)
3. 각 계층은 외부 계층을 모름

#### 전통적 아키텍처와의 차이점

**전통적 계층형 아키텍처:**
- 웹 인터페이스 → 도메인 → 데이터베이스
- 데이터베이스가 기반이 되어 모든 것이 액션이 됨

**함수형 아키텍처 (어니언):**
- 도메인 계층이 데이터베이스에 의존하지 않음
- 액션과 계산이 명확히 분리됨
- 도메인 재사용성과 테스트 용이성 향상

#### 어니언 아키텍처의 장점
- **변경 용이성**: 인터랙션 계층을 쉽게 변경 가능
- **재사용성**: 도메인 계층의 높은 재사용성
- **테스트 용이성**: 외부 서비스에 의존하지 않는 도메인 로직
- **도메인 중심**: 좋은 인프라보다 좋은 도메인 강조

## Chapter 19: 함수형 프로그래밍 여행에 앞서

### 전문가 기술 요약

#### 파트 1: 액션과 계산, 데이터
- 액션에서 계산 추출하기
- 불변성과 카피-온-라이트
- 계층형 설계

#### 파트 2: 일급 추상
- 고차 함수와 함수형 도구
- 타임라인과 동시성 관리
- 반응형/어니언 아키텍처

### 마스터가 되는 투 트랙 접근법

#### 트랙 1: 샌드박스 (안전한 연습 공간)
**사이드 프로젝트:**
- 작은 Hello World 수준부터 시작
- 재미있고 실패해도 괜찮은 프로젝트
- 익숙한 기술 + 새로운 기술 조합
- 언제든 기능 추가 가능한 확장 가능한 구조

**연습 문제:**
- Edabit (https://edabit.com/challenges)
- Project Euler (https://projecteuler.net)
- CodeWars (https://codewars.com)
- Code Katas

#### 트랙 2: 제품 (실무 적용)
**즉시 적용 가능한 개선:**
- 변경 가능한 전역변수 하나씩 제거
- 타임라인 단순화
- 액션에서 계산 추출
- 암묵적 입력/출력을 명시적으로 변경
- 반복문을 함수형 도구로 대체

### 함수형 프로그래밍 언어 선택 가이드

#### 일자리가 많은 언어 (쉬운 순)
**쉬운 편:** 엘릭서 → 코틀린 → 스위프트 → 스칼라 → 러스트  
**어려운 편:** 클로저 → 얼랭 → 하스켈

#### 플랫폼별 선택
**브라우저:** 엘름, 클로저스크립트, 리즌  
**웹 백엔드:** 엘릭서, 코틀린, 스칼라, 클로저  
**모바일:** 스위프트, 코틀린  
**임베디드:** 러스트  

#### 학습 목표별 선택
**정적 타입 시스템:** 엘름, 하스켈, 러스트  
**함수형 도구:** 코틀린, 엘릭서, 클로저  
**동시성/분산:** 엘릭서, 얼랭, 스칼라  

### 추가 학습 방향

#### 수학적 기초
- 람다 대수 (Lambda Calculus)
- 콤비네이터 (Combinators)  
- 타입 이론 (Type Theory)
- 카테고리 이론 (Category Theory)
- 이펙트 시스템 (Effect Systems)

#### 추천 도서
- **Functional-Light JavaScript** - Kyle Simpson
- **Domain Modeling Made Functional** - Scott Wlaschin  
- **Structure and Interpretation of Computer Programs** - Abelson & Sussman
- **Grokking Functional Programming** - Michal Plachta

### 핵심 기억사항

1. **점진적 적용**: 모든 것을 한번에 바꾸려 하지 말고 하나씩 개선
2. **안전한 실험**: 샌드박스에서 충분히 연습 후 제품에 적용  
3. **지속적 학습**: 기술과 열정의 주기를 이해하고 꾸준히 발전
4. **실용적 접근**: 완벽함보다는 점진적 개선에 집중
5. **커뮤니티 활용**: 다른 개발자들과 경험 공유 및 학습

### 마무리

함수형 프로그래밍은 단순히 새로운 도구가 아닌 **사고방식의 전환**입니다. 반응형 아키텍처와 어니언 아키텍처는 이러한 함수형 사고를 대규모 시스템에서 구현하는 방법을 제시하며, 지속적인 학습과 실습을 통해 마스터할 수 있는 실용적인 기술들입니다.
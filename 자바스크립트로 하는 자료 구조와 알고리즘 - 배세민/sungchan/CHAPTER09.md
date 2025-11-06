# 9장 집합

수학적 정의 관점과 구현 단계 관점에서 집합의 개념
공통 집합 연산과 이러한 연산의 구현
Set 객체 사용

## 집합 소개
집합은 유한하고 구분되는 객체들의 그룹  
프로그래밍에서 집합은 정렬되지 않은 유일한(중복되지 않는) 항목들의 그룹이다.  
집합은 O(1) 상수 시간에 유일한 항목을 확인하고 추가할 수 있기 때문에 중요하다.  
집합이 상수 시간 연산이 가능한 이유는 집합의 구현이 해시 테이블의 구현을 기초로 하기 때문이다.

```js
// JS에서 Set 객체 기본 지원

var exampleSet = new Set()
```
기본 Set 객체에는 속성이 하나만 존재하는데 size라는 정수 속성이다. 집합 내 항목들의 현재 개수를 나타낸다.

## 집합 연산

### 삽입
Set의 주요 특징: 유일함 확인

`Set`의 주요 특징은 **유일함을 확인한다는 것**이다.  
`Set`은 항목들을 추가할 수 있지만, **중복되는 항목은 허용되지 않는다.**

---

```javascript
var exampleSet = new Set();

exampleSet.add(1); // exampleSet: Set {1}
exampleSet.add(1); // exampleSet: Set {1}
exampleSet.add(2); // exampleSet: Set {1, 2}
```
위의 코드로부터 집합(Set) 에는 중복 항목들을 추가할 수 없다는 것을 확인할 수 있다.
또한, 집합에 항목을 삽입하는 것은 상수 시간(O(1)) 에 일어난다.

시간 복잡도: O(1)

### 삭제

Set의 항목 삭제

`Set`은 집합으로부터 항목들을 삭제할 수도 있다.  
`Set.delete`는 **불리언(Boolean)** 을 반환한다.  
- 해당 항목이 존재해서 삭제되었다면 `true`가 반환되고,  
- 해당 항목이 존재하지 않으면 `false`가 반환된다.

---

```javascript
var exampleSet = new Set();
exampleSet.add(1);       // exampleSet: Set {1}
exampleSet.delete(1);    // true
exampleSet.add(2);       // exampleSet: Set {2}
```
배열에서 항목 하나를 삭제하기 위해서는 O(n) 시간이 걸린다.
이를 고려할 때, Set은 상수 시간(O(1))에 항목을 삭제할 수 있다는 점에서 매우 유용하다.

시간 복잡도: O(1)

### 포함
Set.has() — 항목 존재 여부 확인

`Set.has()`는 해당 항목이 집합(Set) 내에 존재하는지 확인하는 메서드이다.  
이 메서드는 **O(1)** 시간 복잡도로 작동하므로, 찾기 연산이 매우 빠르다.

---

```javascript
var exampleSet = new Set();
exampleSet.add(1);        // exampleSet: Set {1}
exampleSet.has(1);        // true
exampleSet.has(2);        // false
exampleSet.add(2);        // exampleSet: Set {1, 2}
exampleSet.has(2);        // true
```
시간 복잡도: O(1)

## 기타 유틸리티 함수

### 교집합
```js
function intersectSets (setA, setB) {
    var intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}

var setA = new Set([1, 2, 3, 4]),
    setB = new Set([2, 3]);
intersectSets(setA,setB); // Set {2, 3}

```
### 상위 집합 여부 확인
```js
function isSuperset(setA, subset) {
    for (var elem of subset) {
        if (!setA.has(elem)) {
            return false;
        }
    }
    return true;
}

var setA = new Set([1, 2, 3, 4]),
    setB = new Set([2, 3]),
    setC = new Set([5]);
isSuperset(setA, setB); // true
// setA가 setB의 모든 항목을 포함하기 때문에
isSuperset(setA, setC); // false
// setA가 setC의 항목 5를 포함하지 않기 때문에
```
### 합집합

```js
function unionSet(setA, setB) {
    var union = new Set(setA);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
}

var setA = new Set([1, 2, 3, 4]),
    setB = new Set([2, 3]),
    setC = new Set([5]);
unionSet(setA,setB); // Set {1, 2, 3, 4}
unionSet(setA,setC); // Set {1, 2, 3, 4, 5}
```

### 차집합
```js
function differenceSet(setA, setB) {
    var difference = new Set(setA);
    for (var elem of setB) {
        difference.delete(elem);
    }
    return difference;
}

var setA = new Set([1, 2, 3, 4]),
    setB = new Set([2, 3]);
differenceSet(setA, setB); // Set {1, 4}
```
## 요약

집합(Set) 요약:

정렬되지 않은 유일한 항목들을 저장하는 자료 구조
기본 연산: 삽입, 삭제, 포함 여부 확인 → 모두 O(1) 시간 복잡도
구현 가능한 집합 연산: 교집합, 차집합, 합집합, 상위 집합 여부 확인
활용: 유일성 여부를 빠르게 확인하는 알고리즘 구현


집합을 사용해 정수 배열에 중복 항목이 있는지 확인한다.  
배열을 집합으로 변환함으로써 집합의 크기를 배열의 길이와 비교해 중복이 있는지 쉽게 확인할 수 있다.

| 연산 | 함수 이름 | 설명 |
|---|---|---|
| 삽입 | Set.add | 기본 자바스크립트 함수. 항목이 집합에 이미 존재하지 않으면 해당 항목을 집합에 추가한다. |
| 삭제 | Set.delete | 기본 자바스크립트 함수. 항목이 집합에 존재하면 해당 항목을 집합에서 제거한다. |
| 포함 여부 | Set.has | 기본 자바스크립트 함수. 항목이 집합에 존재하는지 확인한다. |
| 교집합(A∩B) | intersectSets | 집합 A와 집합 B의 공통 항목들을 지닌 집합을 반환한다. |
| 합집합(A∪B) | unionSet | 집합 A와 집합 B의 모든 항목들을 지닌 집합을 반환한다. |
| 차집합(A-B) | differenceSet | 집합 A에는 있지만 집합 B에는 없는 항목들을 지닌 집합을 반환한다. |

---

## 연습 문제

### 집합을 사용해 배열의 중복 항목 확인하기

```javascript
function checkDuplicates(arr) {
  var mySet = new Set(arr);
  return mySet.size < arr.length;
}

checkDuplicates([1,2,3,4,5]);   // false
checkDuplicates([1,1,2,3,4,5]); // true
```

시간 복잡도: O(n)  
공간 복잡도: O(n)

배열의 길이가 n일 때 최악의 경우 위 함수는 전체 배열을 반복 루프를 통해 접근하면서 집합에 모든 항목들을 저장해야 한다.

### 개별적인 배열들로부터 유일한 값만을 반환하기

일부 동일한 값을 지닌 두 개의 정수 배열이 있을 때  
두 배열의 **유일한 항목들만을 지닌 하나의 배열**을 반환한다.

집합을 사용해 유일한 항목들을 쉽게 저장할 수 있다.  
두 배열을 합친 다음 해당 두 배열을 집합으로 변환함으로써  
유일한 항목들만을 저장한다.  
그리고 나서 해당 집합을 다시 배열로 변환하면  
결과적으로 유일한 항목들만을 지닌 배열이 생성된다.

---

```javascript
function uniqueList(arr1, arr2) {
  var mySet = new Set(arr1.concat(arr2));
  return Array.from(mySet);
}

uniqueList([1,1,2,2],[2,3,4,5]); // [1,2,3,4,5]
uniqueList([1,2],[3,4,5]);       // [1,2,3,4,5]
uniqueList([], [2,3,4,5]);       // [2,3,4,5]
```
시간 복잡도: O(n + m)  
공간 복잡도: O(n + m)

위 알고리즘의 시간 및 공간 복잡도는 O(n + m)이다.
이때 n은 arr1의 길이이고 m은 arr2의 길이이다.
이는 두 배열 내의 모든 항목을 순회해야 하기 때문이다.
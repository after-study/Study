# 18장 고급 문자열
 
 문자열 검색 알고리즘

## 트라이`trie`(접두사 트리)
문자열을 검색해 저장된 문자열 중 일치하는 문자열이 있는지 확인하는 데 주로 사용되는 트리
```
Sammie
Simran
Sia
Sam
```
위 단어의 트라이. 각 마지막 노드에는 `endOfWord`라는 불리언 플래그가 있다. 이는 어떤 단어가 해당 경로에서 종료되는지 여부를 나타낸다.(회색 노드로 표현)
![[Pasted image 20251226074225.png]]

트라이`trie`는 중첩 객체를 사용해 구현된다. 각 노드는 자신과 직접 연결된 자식들을 지니는데 이 자식들은 키 역할을 한다.
루트 노드는 Trie 클래스의 생성자에서 초기화 된다.

```js
function TrieNode() {
	this.children = {}; // 표
	this.endOfWord = flase;
}

function Trie() {
	this.root = new TrieNode();
}
```

어떤 단어의 각 문자가 삽입될 때마다 해당 문자가 현재 노드의 자식으로 존재하지 않으면 노드를 생성해 자식으로 추가한다.
```js
Trie.prototype.insert = function(word) {
    var current = this.root;
    for (var i = 0; i < word.length; i++) {
        var ch = word.charAt(i);
        var node = current.children[ch];
        if (node == null) {
            node = new TrieNode();
            current.children[ch] = node;
        }
        current = node;
    }
    current.endOfWord = true; // 현재 노드의 endOfWord를 true로 설정한다.
}
```

검색 - 단어의 각 문자를 확인
임시변수 current를 루트에 설정
검색하고자 하는 단어의 각 문자를 확인함에 따라 current 변수가 갱신
```js
Trie.prototype.search = function(word) {
    var current = this.root;
    for (var i = 0; i < word.length; i++) {
        var ch = word.charAt(i);
        var node = current.children[ch];
        if (node == null) {
            return false; // 노드가 존재하지 않는다.
        }
        current = node;
    }
    return current.endOfWord;
}
var trie = new Trie();
trie.insert("sammie");
trie.insert("simran");
trie.search("simran"); // true
trie.search("fake") // false
trie.search("sam") // false
```

삭제 - 루트 노드로부터 삭제하고자 하는 단어의 마지막 문자에 도달할 때까지 트라이를 순회
삭제하고자 하는 단어의 문자에 해당하는 자식 외의 다른 자식을 지니지 않은 각 노드를 삭제해야 한다.

```js
Trie.prototype.delete = function(word) {
    this.deleteRecursively(this.root, word, 0);
}

Trie.prototype.deleteRecursively = function(current, word, index) {
    if (index == word.length) {
        // 단어의 끝에 도달했을 때 current.endOfWord가 true인 경우에만 삭제한다.
        if (!current.endOfWord) {
            return false;
        }
        current.endOfWord = false;
        // current가 더 이상 자식이 없는 경우 true를 반환한다.
        return Object.keys(current.children).length == 0;
    }
    var ch = word.charAt(index),
        node = current.children[ch];
    if (node == null) {
        return false;
    }
    var shouldDeleteCurrentNode = this.deleteRecursively(node, word, index + 1);
    // true가 반환된 경우
    // 문자와 트라이 노드 참조의 맵핑을 맵으로부터 삭제한다.
    if (shouldDeleteCurrentNode) {
        delete current.children[ch];
        // 맵에 더 이상의 맵핑이 존재하지 않으면 true를 반환한다.
        return Object.keys(current.children).length == 0;
    }
    return false;
}
var trie1 = new Trie();
trie1.insert("sammie");
trie1.insert("simran");
trie1.search("simran"); // true
trie1.delete("sammie");
trie1.delete("simran");
trie1.search("sammie"); // false
trie1.search("simran"); // false
```

시간 복잡도: O(W)
공간 복잡도: O(N\*M)

모든 연산(삽입, 검색, 삭제)에 대해 시간 복잡도는 O(W)이다. 여기서 W는 검색하고자 하는 문자열의 길이이다. 문자열의 각 문자를 확인해야 하기 때문에 O(W)가 된다.
공간 복잡도는 O(N\*M)이다. N은 트라이에 삽입된 단어의 개수이고 M은 가장 긴 단어의 길이이다. 따라서 **공통 접두어를 지닌 다수의 문자열이 있는 경우에 트라이는 효율적인 자료 구조이다.** 하나의 특정 문자열에서 하나의 특정 문자열 패턴을 검색하는 경우 트라이는 효율적이지 않다. 트리와 같은 구조에 ㅁ누자열을 저장하기 위해 추가적인 메모리가 필요하기 때문이다.

하나의 문자열을 대상으로 패턴 검색을 하는 경우 보이어-무어`Boyer-Moore` 알고리즘과 커누스-모리스-프랫`KMP, Knuth-Morris-Pratt` 알고리즘이 유용하다.

## 보이어-무어 문자열 검색
텍스트 편집기 애플리케이션과 웹 브라우저의 '찾기' 기능에 사용된다.
문자열 내에서 패턴을 검색할 때 인덱스를 건너뜀으로써 선형 시간에 검색이 가능하다.
네 번째 반복 루프에서 j와 m을 비교할 때 j가 패턴에 있기 때문에 반복 6을 거치기 않고 바로 반복 7로 2만큼 앞으로 건너뛰는 것이 효율적일 것이다.

#### 무작위법 패턴 비교 반복 방식
![[Pasted image 20251226080319.png]]
#### 보이어-무어 인덱스 건너뛰기 방식
![[Pasted image 20251226080330.png]]

건너뛰기 규칙을 구현하기 위해 '불일치 표' 구조를 만들 수 있다. 불일치 표는 어떤 패턴의 주어진 문자에 대해 얼마나 건너뛰어야 할지를 나타낸다.

| 패턴   | 불일치 표                         |
|--------|----------------------------------|
| jam    | { i: 2, a: 1, m: 3 }              |
| data   | { d: 3, a: 2, t: 1 }              |
| struct | { s: 5, t: 4, r: 3, u: 2, c: 1 }  |
| roi    | { r: 2, o: 1, i: 3 }              |
불일치 표는 다음 코드와 같이 구현할 수 있다.
```js
function buildBadMatchTable(str) {
  var tableObj = {},
      strLength = str.length;

  for (var i = 0; i < strLength - 1; i++) {
    tableObj[str[i]] = strLength - 1 - i;
  }

  if (tableObj[str[strLength - 1]] == undefined) {
    tableObj[str[strLength - 1]] = strLength;
  }

  return tableObj;
}

buildBadMatchTable('data');   // { d: 3, a: 2, t: 1 }
buildBadMatchTable('struct'); // { s: 5, t: 4, r: 3, u: 2, c: 1 }
buildBadMatchTable('roi');    // { r: 2, o: 1, i: 3 }
buildBadMatchTable('jam');    // { j: 2, a: 1, m: 3 }

```

위의 불일치 표를 사용해 검색하고자 하는 현재 문자열이 표에 존재하는 경우, 현재 문자열과 연괄된 불일치 표 값만큼 인덱스를 건너뛴다. 존재하지 않으면 1만큼 인덱스를 증가시킨다. 계속 반복되다가 문자열이 발견되거나 인덱스가 패턴 길이와 문자열 길이의 차보다 큰 경우에 중단된다.

```js
function boyerMoore(str, pattern) {
  var badMatchTable = buildBadMatchTable(pattern),
      offset = 0,
      patternLastIndex = pattern.length - 1,
      scanIndex = patternLastIndex,
      maxOffset = str.length - pattern.length;

  // 문자열과 패턴의 길이 차가 maxOffset보다 큰 경우 해당 패턴을 찾지 못한 것이다.
  while (offset <= maxOffset) {
    scanIndex = 0;

    while (pattern[scanIndex] === str[scanIndex + offset]) {
      if (scanIndex === patternLastIndex) {
        // 현재 인덱스에서 패턴 발견
        return offset;
      }
      scanIndex++;
    }

    var badMatchString = str[offset + patternLastIndex];

    if (badMatchTable[badMatchString]) {
      // 불일치 표에 존재하는 경우 표의 값만큼 증가한다.
      offset += badMatchTable[badMatchString];
    } else {
      offset += 1;
    }
  }

  return -1;
}

boyerMoore('jellyjam', 'jelly'); // 0: 인덱스 0에서 패턴 발견
boyerMoore('jellyjam', 'jam');   // 5: 인덱스 5에서 패턴 발견
boyerMoore('jellyjam', 'sam');   // -1: 패턴이 존재하지 않음

```

#### 최선의 경우:
패턴의 모든 문자가 동일해 T만큼 일관되게 이동한다. T는 패턴의 길이이다.
W는 패턴을 찾고자 하는 대상인 문자열이다.
단 하나의 값만이 불일치 표에 저장되기 때문에 공간 복잡도는 O(1)이다.

시간 복잡도: O(W/T)
공간 복잡도: O(1)

#### 최악의 경우:
패턴이 문자열의 끝에 존재하고 앞부분이 모두 고유의 문자로 구성된 경우다. abcdefgxyz와 xyz인 경우가 예이다.
이 경우 T\*W 문자열 비교가 일어난다.

시간 복잡도: O(T\*W)
공간 복잡도: O(T)

## 커누스-모리스-프랫`KMP, Knuth-Morris-Pratt` 문자열 검색

`String.prototype.indexOf` 보다 빠른 구현을 위해서 사용할 수 있다. KMP 알고리즘의 다음 구현은 패턴이 존재하는 곳의 모든 인덱스를 반환한다.

입력 "텍스트" T 내에서 "단어" W의 출현 횟수를 검색한다. 이때 잘못된 일치가 발생하면 이로부터 다음 일치가 어디에서 시작될 수 있는지에 관한 충분한 정보를 얻을 수 있다는 점을 활용한다. 이는 이미 일치한 문자들을 다시 검사하는 것을 막아준다. 접두사 배열을 만들 때 접두사 배열이 동일한 접두사를 얻기 위해 인덱스를 얼마나 되돌려야 할지(어느 인덱스로 돌아가야 할지)를 나타낼 수있도록 해야한다.

# 인덱스 0:

비교할 문자열이 없다. 따라서 접두사 배열 값은 0으로 초기화된다.

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 |   |   |   |   |   |   |

---

# 인덱스 1:

- 문자가 b이다.
- 이전 접두사 배열 값 prefix[0]은 0이다.

인덱스 0과 현재 인덱스 1을 비교한다. a(인덱스 0)와 b(인덱스 1)가 일치하지 않는다. prefix[1]을 0으로 설정한다.

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 | 0 |   |   |   |   |   |

---

# 인덱스 2:

- 문자가 a이다.
- 이전 접두사 배열 값 prefix[1]은 0이다.

인덱스 0과 현재 인덱스 2를 비교한다. a(인덱스 0)와 a(인덱스 2)는 일치한다. prefix[2]를 1로 설정한다(prefix[1]에서 증가).

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 | 0 | 1 |   |   |   |   |

---

# 인덱스 3:

- 문자가 b이다.
- 이전 접두사 배열 값 prefix[2]는 1이다.

인덱스 1과 현재 인덱스 3을 비교한다. b(인덱스 1)와 b(인덱스 3)는 일치한다. prefix[3]을 2로 설정한다(prefix[2]에서 증가).

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 | 0 | 1 | 2 |   |   |   |

---

# 인덱스 4:

- 문자가 a이다.
- 이전 접두사 배열 값 prefix[3]은 2이다.

인덱스 2와 현재 인덱스 4를 비교한다. a(인덱스 2)와 a(인덱스 4)는 일치한다. prefix[4]를 3으로 설정한다(prefix[3]에서 증가).

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 | 0 | 1 | 2 | 3 |   |   |

---

# 인덱스 5:

- 문자가 c이다.
- 이전 접두사 배열 값 prefix[4]는 3이다.

인덱스 3과 현재 인덱스 4를 비교한다. b(인덱스 3)와 c(인덱스 5)는 일치하지 않는다. prefix[5]를 0으로 설정한다.

| 배열 인덱스 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---------|---|---|---|---|---|---|---|
| 문자열 | a | b | a | b | a | c | a |
| 접두사 배열 | 0 | 0 | 1 | 2 | 3 | 0 |   |

---

# 인덱스 6:

- 문자가 c이다.
- 이전 접두사 배열 값 prefix[5]는 0이다.

인덱스 0과 현재 인덱스 5를 비교한다. a(인덱스 0)와 a(인덱스 6)는 일치한다. prefix[6]을 1로 설정한다.

| 배열 인덱스 | 0   | 1   | 2   | 3   | 4   | 5   | 6   |
| ------ | --- | --- | --- | --- | --- | --- | --- |
| 문자열    | a   | b   | a   | b   | a   | c   | a   |
| 접두사 배열 | 0   | 0   | 1   | 2   | 3   | 0   | 1   |

접두사 표를 만드는 알고리즘
```js
function longestPrefix(str) {
  // 접두사 배열을 생성한다.
  var prefix = new Array(str.length);
  var maxPrefix = 0;

  // 인덱스 0에서 접두사를 시작한다.
  prefix[0] = 0;

  for (var i = 1; i < str.length; i++) {
    // 불일치되는 동안 접두사 값을 감소한다.
    while (str.charAt(i) !== str.charAt(maxPrefix) && maxPrefix > 0) {
      maxPrefix = prefix[maxPrefix - 1];
    }

    // 문자열이 일치하면 접두사 값을 갱신한다.
    if (str.charAt(maxPrefix) === str.charAt(i)) {
      maxPrefix++;
    }

    // 접두사 값을 설정한다.
    prefix[i] = maxPrefix;
  }

  return prefix;
}

console.log(longestPrefix('ababaca')); // [0, 0, 1, 2, 3, 0, 1]

```

위 접두가 표를 활용해 KMP를 구현할 수 있다. KMP검색은 무자열과 검색하고자 하는 패턴을 인덱스마다 반복한다. 불일치가 있을 때마다 접두사 표를 사용해 다음에 시도할 새로운 인덱스를 계산한다.

패턴의 인덱스가 패턴의 길이에 도달했다는 것은 문자열을 발견했다는 의미다. 

```js
function KMP(str, pattern) {
  // 접두사 표 만들기
  var prefixTable = longestPrefix(pattern),
      patternIndex = 0,
      strIndex = 0;

  while (strIndex < str.length) {
    if (str.charAt(strIndex) !== pattern.charAt(patternIndex)) {
      // 경우 1: 두 문자가 다르다.
      if (patternIndex !== 0) {
        // 가능하면 접두사 표를 사용한다.
        patternIndex = prefixTable[patternIndex - 1];
      } else {
        // 문자열 인덱스를 다음 문자로 증가시킨다.
        strIndex++;
      }
    } else if (str.charAt(strIndex) === pattern.charAt(patternIndex)) {
      // 경우 2: 두 문자가 동일하다.
      strIndex++;
      patternIndex++;
    }

    // 패턴을 찾았다.
    if (patternIndex === pattern.length) {
      return true;
    }
  }

  return false;
}

KMP('ababacaababacaababacaababaca', 'ababaca'); // true
KMP('sammiebae', 'bae');                         // true
KMP('sammiebae', 'sammie');                      // true
KMP('sammiebae', 'sammiebaee');                  // false

```

시간 복잡도: O(W)
공간 복잡도: O(W)

길이 W인 단어를 전처리하기 위한 시간 복잡도와 공간 복잡도는 O(W)이다.

시간 복잡도: O(W+T)
여기서 W는 T(검색 대상인 주 문자열)에 있는 "단어"이다.

## 라빈-카프`Rabin-Karp` 검색
텍스트에서 특정 패턴을 찾기 위해 **해싱**을 활용한다.
`KMP`가 검색하는 동안 중복되는 확인을 건너뛰도록 최적화된 반면, 
라빈-카프는 **해시 함수를 통해 부분 문자열이 패턴과 동일한지 비교**하는 과정의 속도를 높인다.
이를 효율적으로 수행하기 위해 해시 함수는 O(1)이어야 한다.

라빈-카프 검색에 사용된 해싱 기법을 구체적으로 이야기하자면 **라빈 지문 해싱 기법**이 사용됐다.

### 라빈 지문
라빈 지문`Rabin fingerprint`은 다음 공식을 통해 계산된다.
$$
f(x) = m_0 + m_1 x + \cdots + m_{n-1} x^{\,n-1}
$$

(여기서 \(n\)은 해싱하고자 하는 문자열의 개수이고, \(x\)는 소수다.)

임의의 소수 101을 설정한 라빈 지문 구현이다.
이 경우 높은 소수이면 모두 잘 작동한다.
하지만 x가 너무 큰 경우 x<sup>n-1</sup>이 빠르게 증가하기 때문에 정수 오버플로가 발생할 수 있다는 점에 유의하자.
endLength 인자는 해시 계산 시 사용할 값을 나타낸다. endLength가 전달되지 않은 경우 str의 길이로 기본 설정된다.
```js
function RabinKarpSearch() {
  this.prime = 101;
}
/**
 * 문자열에 대한 Rabin-Karp 지문 해시를 계산한다.
 *
 * @param {string} str
 *   해시를 계산할 대상 문자열
 * @param {number} [endLength=str.length]
 *   해시 계산 시 사용할 문자열의 길이.
 *   전달되지 않으면 str.length로 기본 설정된다.
 * @returns {number}
 *   계산된 해시 값
 */
RabinKarpSearch.prototype.rabinkarpFingerprintHash = function (str, endLength) {
  if (endLength == null) endLength = str.length;

  var hashInt = 0;
  for (var i = 0; i < endLength; i++) {
    hashInt += str.charCodeAt(i) * Math.pow(this.prime, i);
  }

  return hashInt;
};

var rks = new RabinKarpSearch();
rks.rabinkarpFingerprintHash("sammie"); // 1072559917336
rks.rabinkarpFingerprintHash("zammie"); // 1072559917343

```
sammie과 zammie는 고유한 해시가 반환되었다. 해시 값으로 두 문자열이 동일한지 빠르게 상수 시간에 확인할 수 있다.
예를 들어 same 내에 am을 검색할 때 슬라이딩 방식의 해시 계산을 할 수 있다.

```js
rks.rabinkarpFingerprintHash("sa") // 9912
rks.rabinkarpFingerprintHash("am") // 11106
rks.rabinkarpFingerprintHash("me") // 10310
```

sa로부터 am의 해시 값을 얻기 위해서는 sa로부터 첫 번째 항(s)을 뺀 다음  
남은 값을 소수로 나눈 다음 신규 항(m)을 추가하면 된다.  
이러한 재계산 알고리즘은 다음 코드와 같이 구현한다.
```js
RabinKarpSearch.prototype.recalculateHash = function (
  str,
  oldIndex,
  newIndex,
  oldHash,
  patternLength
) {
  if (patternLength == null) patternLength = str.length;

  var newHash = oldHash - str.charCodeAt(oldIndex);
  newHash = Math.floor(newHash / this.prime);
  newHash +=
    str.charCodeAt(newIndex) *
    Math.pow(this.prime, patternLength - 1);

  return newHash;
};

var oldHash = rks.rabinkarpFingerprintHash("sa"); // 9912
rks.recalculateHash("same", 0, 2, oldHash, "sa".length); // 11106

```

마지막으로 두 가지 다른 문자열은 가능성은 적지만 같은 해시 값을 가질 수 있다.  
따라서 두 문자열의 시작 인덱스와 끝 인덱스가 주어졌을 때  
두 문자열이 동일한지 확인하는 함수가 필요하다.
```js
RabinKarpSearch.prototype.strEquals = function (
  str1, startIndex1, endIndex1,
  str2, startIndex2, endIndex2
) {
  if (endIndex1 - startIndex1 != endIndex2 - startIndex2) {
    return false;
  }

  while (
    startIndex1 <= endIndex1 &&
    startIndex2 <= endIndex2
  ) {
    if (str1[startIndex1] != str2[startIndex2]) {
      return false;
    }

    startIndex1++;
    startIndex2++;
  }

  return true;
};

```
그리고 나서 시작 해서를 계산한 다음 패턴이 발견되거나 문자열 끝에 도달할 때까지 슬라이딩 방식으로 해시를 재계산해 라빈-카프 검색의 메인 함수를 구현할 수 있다.
```js
RabinKarpSearch.prototype.rabinkarpSearch = function (str, pattern) {
  var T = str.length,
      W = pattern.length,
      patternHash = this.rabinkarpFingerprintHash(pattern, W),
      textHash = this.rabinkarpFingerprintHash(str, W);

  for (var i = 1; i <= T - W + 1; i++) {
    if (
      patternHash == textHash &&
      this.strEquals(str, i - 1, i + W - 2, pattern, 0, W - 1)
    ) {
      return i - 1;
    }

    if (i < T - W + 1) {
      textHash = this.recalculateHash(
        str,
        i - 1,
        i + W - 1,
        textHash,
        W
      );
    }
  }

  return -1;
};

var rks = new RabinKarpSearch();
rks.rabinkarpSearch("SammieBae", "as");  // -1
rks.rabinkarpSearch("SammieBae", "Bae"); // 6
rks.rabinkarpSearch("SammieBae", "Sam"); // 0

```

선처리 시간 복잡도: O(W)
W는 "단어"의 길이다.

일치 시간 복잡도: O(W + T)

### 실생활 적용 예

라빈-카프 알고리즘은 표절을 잡아내는 데 사용될 수 있다. 원본 자료가 있는 경우 라빈-카프 알고리즘은 제출한 문서를 검색해 원문에 있는 구문과 단어가 제출한 문서에 얼마나 등장하는지 알아낼 수 있다(전처리 단계에서 구두점 문자들을 제거함으로써 구두점과 같은 문법 세부 사항을 무시할 수 있다). 단일 검색 알고리즘의 경우 이러한 문제를 해결하는 데 적합하지 않다. 찾고자 하는 (입력된) 구문과 문장이 너무 많기 때문이다. 라빈-카프 알고리즘은 대규모 DNA 자료에서 특정 시퀀스를 찾는 것과 같이 문자열 일치 비교 애플리케이션에서도 사용된다.
### 요약

18장에서는 문자열 주제로 돌아가 좀 더 심화된 예와 문자열 패턴을 검색하는 것에 대해 살펴봤다. 더불어 다음과 같은 종류의 문자열 검색 알고리즘을 다뤘다.

- **트라이**는 다중 검색과 접두사 패턴 일치 확인에 뛰어나다.
    
- **보이어-무어**는 끝부분이 일치하지 않으면 처음 부분을 비교해보지 않아도 된다는 가정 아래 패턴의 처음이 아닌 마지막 문자를 비교한다. 덕분에 인덱스를 뛰어넘을 수 있어서 텍스트 양이 많은 경우 효율적이다.
    
- **KMP 알고리즘**은 문자열 내에 패턴의 등장 횟수를 검색한다. 이는 불일치가 일어났을 때 패턴 자체가 다음 비교를 어디에서 해야 할지(문자열의 인덱스) 결정하는 데 충분한 정보를 지닌다는 관찰을 바탕으로 한다. 따라서 KMP 알고리즘은 텍스트의 양이 작은 경우에 효율적이다.

#### 표 18-1 단일 문자열 검색 요약

| 알고리즘 | 전처리 시간 복잡도 | 일치 비교 시간 복잡도 | 공간 복잡도 |
|---------|----------------|------------------|-----------|
| 기본 | 없음 | O(W*T) | 없음 |
| 보이어-무어 | O(W+T) | 최선의 경우: O(T/W)<br>최악의 경우: O(W*T) | O(1) |
| KMP | O(W) | O(T) | O(W) |
| 라빈-카프 | O(W) | O(W+T) | O(1) |

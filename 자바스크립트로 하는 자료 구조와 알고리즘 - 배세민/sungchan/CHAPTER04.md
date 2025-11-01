
## 정규 표현식

### 기본 정규 표현식
```
^: 문자열/줄의 시작을 나타낸다.
\d: 모든 숫자를 찾는다.
[abc]: 괄호 내의 모든 문자를 찾는다.
[^abc]: 괄호 내의 문자들을 제외한 모든 문자를 찾는다.
[0-9]: 괄호 내의 모든 숫자를 찾는다.
[^0-9]: 괄호 내의 숫자들을 제외한 모든 숫자를 찾는다.
(x|y): x 또는 y를 찾는다. 
```


### 자주 사용하는 정규 표현식
#### 숫자를 포함하는 문자
```js
var reg = /\d+/;

reg.test("123") // true
reg.test("33asd") // true
```

#### 숫자만 포함하는 문자
```js
var reg = /^\d+$/;

reg.test("123") // true
reg.test("123a") // false
```

#### 부동소수점 문자
```js
var reg = /^[0-9]*.[0-9]*[1-9]+$/;

reg.test("12") // false
reg.test("12.2") // true
```

#### 숫자와 알파벳만을 포함하는 문자
```js
var reg = /[a-zA-Z0-9]/;

reg.test("somethingELSE") // true
reg.test("hello") // true
reg.test("112a") // true
```

### 질의 문자열 (query string)

URL: http://your.domain/product.aspx?category=4&product_id=2140&query=lcd+tc
```sql
SELECT LCD, TV FROM database WHERE Category = 4 AND Product_id=2140;
```

매개변수 파싱하기 위한 정규 표현식
```js
var uri = 'http://your.domain/product.aspx?category=4&product_id=2140&query=lcd+tc'
var queryString = {}

uri.replace(
	new RegExp ("([^?=&]+)(=([^&]*))?", "g")
	function ($0, $1, $2, $3) { queryString[$1] = $3; }
)

console.log('ID: ' + queryString['product_id']) // ID: 2140
console.log('Name: ' + queryString['product_name']) // Name: undefined
console.log('Category: ' + queryString['category']) // Category: 4
```

## 인코딩

### Base64 인코딩
인코딩: btoa() - 문자열 -> Base64 인코딩된 ASCII 문자열 생성 
디코딩: atob() - 인코딩된 자료의 문자열을 디코딩
```js
btoa('hello')
'aGVsbG8='
atob('aGVsbG8=')
'hello'
```

## 문자열 단축
단순화된 URL 압축 알고리즘은 다음과 같이 특정 구조를 따른다.

URL -> 정수기반 고유 ID 생성 -> Base64 인코딩 -> VhU2

| ID       | URL             | 단축ID |     |
| -------- | --------------- | ---- | --- |
| 0        | www.youtube.com | a    |     |
| ...      | ...             | ...  |     |
| 11231230 | www.google.com  | VhU2 |     |
## 암호화
### RSA 암호화
RSA는 큰 정수의 인수분해 난이도에 기반한 알고리즘이다. RSA에서는 두 개의 큰 소수와 보조 값이 공개 키로 생성된다.
누구나 메시지를 암호화하기 위해 공개 키를 사용할 수 있지만 소인수를 지닌 사람만이 메시지를 해독할 수 있다.

이 과정에는 키 생성과 암호화, 복호화 3단계가 존재한다.
- 키 생성: 공개 키(공유됨)와 비밀 키(비밀로 유지됨)가 생성된다. 생성된 키 생성 방법 역시 비밀이어야 한다.
- 암호화: 공개 키를 통해 비밀 메시지를 암호화할 수 있다.
- 복호화: 비밀 키로만 암호화된 메시지를 복호화할 수 있다.
#### 알고리즘의 개요
1. 두 개의 소수 p와 q를 선택한다. 대개 큰 소수를 선택한다.
	1. p와 q의 곱을 n이라고 표기한다.
	2. (p-1)과 (q-1)의 곱을 phi라고 표기한다.
2. 두 개의 지수 e와 d를 선택한다.
	1. e는 일반적으로 3이다. 2보다 큰 다른 값을 사용할 수 있다.
	2. d는 (e * d)%phi = 1 인 값이다.


## 요약
다양한 기본 문자열 함수
정규 표현식

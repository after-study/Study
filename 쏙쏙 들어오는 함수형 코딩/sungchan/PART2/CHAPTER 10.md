## CHAPTER 10 일급 함수 1

#### 코드의 냄새와 중복을 없애 추상화를 잘할 수 있는 리팩터링 두 가지

1. 코드의 냄새: 함수 이름에 있는 암묵적 인자
	- 특징
		- 거의 똑같이 구현된 함수가 있다
		- 함수 이름이 구현에 있는 다른 부분을 가리킨다
2. 리팩터링: 암묵적 인자를 드러내기 리팩터링
	- 단계
		1. 함수 이름에 있는 암묵적 인자를 확인합니다
		2. 명시적인 인자를 추가합니다
		3. 함수 본문에 하드 코딩된 값을 새로운 인자로 바꿉니다
		4. 함수를 호출하는 곳을 고칩니다
3. 리팩터링: 함수 본문을 콜백으로 바꾸기 리팩터링
	- 단계
		1. 함수 본문에서 바꿀 부분의 앞부분과 뒷부분을 확인합니다
		2. 리팩터링 할 코드를 함수로 빼냅니다
		3. 빼낸 함수의 인자로 넘길 부분을 또 다른 함수로 빼냅니다

### 마케팅팀은 여전히 개발팀과 협의해야 합니다

### 코드의 냄새: 함수 이름에 있는 암묵적 인자
- 비슷한게 생긴 함수들에 이름에서 냄새가 납니다
- 중복과 함수안에 필드를 경정하는 문자열이 있는 것이 문제입니다
- 함수 이름에 있는 암묵적 인자`implicit argument in function name`라고 부릅니다
```js
function setPriceByName(cart, name, price) {
	var item = cart[name]
	var newItem = objectSet(item, 'price', price)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

function setShippingByName(cart, name, price) {
	var item = cart[name]
	var newItem = objectSet(item, 'shipping', price)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

function setQuantityByName(cart, name, price) {
	var item = cart[name]
	var newItem = objectSet(item, 'quantity', price)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

function setTaxByName(cart, name, price) {
	var item = cart[name]
	var newItem = objectSet(item, 'tax', price)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

function objectSet(object, key, value) {
	var copy = Object.assign({}, object)
	copy[key] = value
	return copy
}
```

### 리팩터링: 암묵적 인자를 드러내기
암묵적 인자를 드러내기`express implicit argument` 리팩터링으로 암묵적 인자를 명시적인 인자로 바꾸는 단계입니다.
1. 암묵적 인자 확인
2. 명시적 인자 추가
3. 함수 본문에 하드 코딩된 값을 새로운 인자로 변경
4. 함수 호출부 수정

가격만 설정하는 `setPriceByName()`함수를 어떤 필드값이든 설정할 수 있는 `setFieldByName()`함수로 리팩터링 해봅시다.
```js
// 리팩터링 전
function setPriceByName(cart, name, price) {
	var item = cart[name]
	var newItem = objectSet(item, 'price', price)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

cart = setPriceByName(cart, "shoe", 13)
cart = setShippingByName(cart, "shoe", 3)
cart = setQuantityByName(cart, "shoe", 0)
cart = setTaxByName(cart, "shoe", 2.34)
```

```js
// 리팩터링 후
function setFieldByName(cart, name, field, value) {
	var item = cart[name]
	var newItem = objectSet(item, field, value)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

cart = FieldByName(cart, "shoe", 'price', 13)
cart = FieldByName(cart, "shoe", 'quantity', 3)
cart = FieldByName(cart, "shoe", 'shipping', 0)
cart = FieldByName(cart, "shoe", 'tax', 2.34)
// 값에는 큰 따옴표, 키에는 작은 따옴표를 썼습니다.
// 'shoe' 처럼 키로도 쓴다면 큰따옴표를 사용합니다.

// 큰 따옴표, 작은 다옴표를 구분해서 쓰는게 유효할까?
```

리팩터링으로 필드명을 일급 값으로 만들었습니다. 암묵적인 이름은 인자로 넘길 수 있는 값이 되었습니다.
값은 변수나 배열에 담을 수 있어서 일급`first-class`이라고 부릅니다. 일급 값은 언어 전체에 어디서나 쓸 수 있습니다.
일급으로 만드는 것이 이번 장의 주제입니다.

### 일급인 것과 일급이 아닌 것을 구별하기
#### 자바스크립트에는 일급이 아닌 것과 일급인 것이 섞여 있습니다. 다른 언어를 사용해도 마찬가지 입니다.

##### 일급
숫자는 함수에 <u>인자</u>로 넘길 수 있고 <u>리턴값</u>으로 받을 수 있습니다.
<u>변수</u>에 넣을 수 있고 <u>배열이나 객체의 항목</u>으로 넣을 수도 있습니다.
문자열이나 불리언값, 배열, 객체도 비슷하게 할 수 있습니다.
자바스크립트나 다른 많은 언어에서 함수 역시 비슷하게 쓸 수 있습니다.
이런 식으로 쓸 수 있는 값을 <u>일급</u>이라고 합니다.

##### 일급이 아닌 것
- + 연산자, * 연산자와 같은 수식 연산자
- if 키워드, for 키워드

중요한 것은 일급이 아닌 것을 일급으로 바꾸는 방법을 아는 것입니다.

### 필드명을 문자열로 사용하면 버그가 생기지 않을까요?
컴파일 타임에 검사하거나 런타임에 검사해서 문제를 해결할 수 있습니다.
정적 타입 시스템 언어인 타입스크립트와 같은 것을 사용해서 컴파일 타임에 검사하는 방법을 사용할 수 있습니다.
런타임 검사는 함수를 실행할 때마다 동작합니다. 아래는 런타임 검사 방법으로 필드명이 올바른지 확인하는 코드입니다.
```js
var validItemFields = ['price', 'quantity', 'shipping', 'tax']

function setFieldByName(cart, name, field, vlaue) {
	if(!validItemFields.includes(field)) {
		throw "Not a valid item field: " + "'" + field + "'"
	}
	var item = cart[name]
	var newItem = objectSet(item, field, value)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}
```

### 일급 필드를 사용하면 API를 바꾸기 더 어렵나요?
내부에서 정의한 필드명이 바뀐다고 해도 사용하는 사람들이 원래 필드명을 그대로 사용할 수 있도록 내부에서 바꿔 주면 됩니다.
```js
var validItemFields = ['price', 'quantity', 'shipping', 'tax']
var translations = {'quantity': 'number'}

function setFieldByName(cart, name, field, vlaue) {
	if(!validItemFields.includes(field)) {
		throw "Not a valid item field: " + "'" + field + "'"
	}
	if(translations.hasOwnProperty(field)) {
		field = translations[field]
	}
	var item = cart[name]
	var newItem = objectSet(item, field, value)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}
```

이런 방법은 필드명이 일급이기 때문에 할 수 있는 것입니다. 객체나 배열에 담을 수 있다는 뜻이고 언어에 모든 기능을 이용해서 필드명을 처리할 수 있습니다.

### 연습 문제
암묵적 인자 드러내기 리팩터링
```js
function multiplyByFour(x) {
	return x * 4
}

function multiplyBySix(x) {
	return x * 6
}
```

```js
function multiply(x, y) {
	return x * y
}
```

### 연습 문제
- 암묵적 인자를 드러내기 리팩터링
```js
function incrementQuantityByName(cart, name) {
	var item = cart[name]
	var quantity = item['quantity']
	var newQuantity = quantity + 1
	var newItem = objectSet(item, 'quantity', newQuantity)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}

function incrementSizeByName(cart, name) {
	var item = cart[name]
	var size = item['size']
	var newSize = size + 1
	var newItem = objectSet(item, 'size', newSize)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}
```

```js
function incrementFieldByName(cart, name, field) {
	var item = cart[name]
	var value = item[field]
	var newField = value + 1
	var newItem = objectSet(item, field, newField)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}
```


### 연습 문제
- 'size', 'quantity'만 field로 사용하도록 런타임 체크 코드
```js
function incrementFieldByName(cart, name, field) {
	var validItems = ['size', 'quantity']
	if(!validItems.includes(field)) {
		throw 'Not a valid item field: ' + field
	}

	var item = cart[name]
	var value = item[field]
	var newField = value + 1
	var newItem = objectSet(item, field, newField)
	var newCart = objectSet(cart, name, newItem)
	return newCart
}
```


### 객체와 배열을 너무 많이 쓰게 됩니다
장바구니와 제품 엔티티는 일반적이고 재사용할 수 있어야 하기 때문에 일반적인 형식인 객체와 배열을 사용해야 합니다
데이터를 데이터 그대로 사용하는 것의 중요한 장점은 여러 가지 방법으로 해석할 수 있다는 점입니다. 제한된 API로 정의하면 데이터를 제대로 활용할 수 없습니다.
데이터 지향`data orientation`은 이벤트와 엔티티에 대한 사실을 표현하기 위해 일반 데이터 구조를 사용하는 프로그래밍 형식입니다.

### 정적 타입 vs 동적 타입
정적 타입 언어와 동적 타입 언어를 구분하는 것보다 소프트웨어 품질을 위해 숙면을 하는 것이 더 중요하다고 합니다.

### 모두 문자열로 통신합니다
웹브라우저도 JSON을 문자열로 보내고 서버는 그 JSON 문자열을 받아 해석합니다.
서버와 데이터베이스가 통신하는 것도 마찬가지입니다.
API는 클라이언트에게 받은 데이터를 런타임에 체크해야 합니다. 데이터는 항상 해석이 필요합니다.

### 어떤 문법이든 일급 함수로 바꿀 수 있습니다
- + 연산자도 함수로 만들 수 있습니다.
```js
function plus(a, b) {
	return a + b
}
```

### 반복문 예제: 먹고 치우기

```js
// 요리하고 먹기
for(const food of foods) {
	cook(food)
	eat(food)
}

// 설거지 하기
for(const dish of dishes) {
	wash(dish)
	dry(dish)
	putAway(dish)
}
```


```js
const forEach = (array, f) => {
	for(const item of array) {
		f(item)
	}
}

const cookAndEat = (food) => {
	cook(food)
	eat(food)
}

forEach(foods, cookAndEat)

const clean = (dish) => {
	wash(dish)
	dry(dish)
	putAway(dish)
}

forEach(dishes, clean)
```

`forEach()` 함수는 배열과 함수를 인자로 받는 고차 함수`higher-order function`입니다.

### 리팩터링: 함수 본문을 콜백으로 바꾸기
- 코드 본문에 앞부분과 뒷부분의 패턴을 찾으면 함수 본문을 콜백으로 바꾸기 리팩터링에 다가갈 수 있습니다.
```js
try { // 앞부분
	saveUserData(user) // 본문
} catch (error) { // 뒷부분
	logToSnapErrors(error) 
}

try { // 앞부분
	fetchProduct(productId) // 본문
} catch (error) { // 뒷부분
	logToSnapErrors(error) 
}
```
1. 본문과 본문의 앞부분과 뒷부분을 구분합니다.
2. 전체를 함수로 빼냅니다.
3. 본문 부분을 빼낸 함수의 인자로 전달한 함수로 바꿉니다.


```js
function withLogging(f) {
	try {
		f()
	} catch (error) {
		logToSnapErrors(error)
	}
}

withLogging(function() {
	saveUserData(user)
});
```

### 이것은 무슨 문법인가요?

#### 함수를 정의하는 방법 세 가지
- 전역으로 정의하기
```js
function saveCurrentUserData() {
	saveUserData(user)
}

withLogging(saveCurrentUserData)
```
- 지역적으로 정의하기
```js
function someFunction() {
	function saveCurrentUserData() {
		saveUserData(user)
	}
	
	withLogging(saveCurrentUserData)
}
```
- 인라인으로 정의하기
```js
withLogging(function() {
	saveUserData(user)
});
```

### 왜 본문을 함수로 감싸서 넘기나요?
- 함수를 감싸야 `saveUserData(user)`함수가 바로 호출되지 않고 래핑함수가 호출될 때 실행되기 때문
- `user`라는 인자를 넘길 수 있는 것도 장점

자바스크립트 함수는 일급이기 때문에 함수를 정의할 수 있는 방법은 여러 가지가 있습니다.
##### 이름 붙이기
```js
var f = function() {
	saveUserData(user)
}
```

##### 컬렉션에 저장하기
```js
array.push(function() {
	saveUserData(user)
})
```

##### 그냥 넘기기
```js
withLogging(function() {
	saveUserData(user)
})
```

함수 안에 담아 실행을 미뤄 전달한 함수는 선택적으로 호출될 수 있고`(if)` 나중에`(sleep(oneday))` 호출될 수도 있습니다. 또 어떤 문맥 안에서`(try-catch)` 실행될 수도 있습니다.

### 결론
배운 것
- 일급 값
- 일급 함수
- 고차 함수

### 요점 정리
- 일급 값은 변수에 저장, 인자로 전달, 함수 리턴값으로 사용 가능
- 일급이 아닌 기능은 함수로 감싸 일급으로 만들 수 있음
- 일급 함수도 존재. 어떤 단계 이상의 함수형 프로그래밍을 하는 데 필요
- 고차 함수는 다른 함수에 인자로 넘기거나 리턴값으로 받을 수 있는 함수
- 함수 이름에 있는 암묵적 인자는 함수의 이름으로 구분하는 코드의 냄새. 암묵적 인자를 드러내기 리팩터링으로 냄새 제거
- 동작을 추상화하기 위해 본문을 콜백으로 바꾸기 리팩터링 사용 가능. 서로 다른 함수의 동작 차이를 일급 함수로 만듬

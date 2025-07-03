## CHAPTER 6 변경 가능한 데이터 구조를 가진 언어에서 불변성 유지하기

- 불변성과 카피-온-라이트
- 읽기와 쓰기로 설명하는 불변성

> 중첩된 데이터에 대한 불변 동작을 구하는 방법이 무엇인가?

### 동작을 읽기, 쓰기 또는 둘 다로 분류
> 읽기 
> 	데이터에서 정보를 가져옵니다
> 	데이터를 바꾸지 않습니다.
> 쓰기
> 	데이터를 바꿉니다.

쓰기는 불변성 동작 원칙에 따라 구현해야 합니다. (카피-온-라이트)

### 카피-온-라이트 원칙 세 단계
1. 복사본 만들기 (slice)
2. 복사본 변경하기(원하는 만큼)
3. 복사본 리턴하기
예제
```js
function add_element_last(array, elem) {
	var new_array = array.slice();
	new_array.push(elem);
	return new_array;
}
```
위 함수는 데이터를 바꾸지 않았고 정보를 리턴했기 때문에 읽기입니다. 쓰기를 읽기로 바꿨습니다.

### 카피-온-라이트로 쓰기를 읽기로 바꾸기
예제
```js
function remove_item_by_name(cart, name) {
	var idx = null;
	for(var i = 0, i < cart.length; i++) {
		if(cart[i].name === name)
			idx = i;
	}
	if(idx !== null)
		cart.splice(idx, 1); // <-- 장바구니 변경함
}
```

장바구니를 변경하지 않고 변경 불가능한 데이터로 쓰려고 함. 카피-온-라이트 적용
```js
function remove_item_by_name(cart, name) {
	var new_cart = cart.slice(); // 1. 장바구니 복사
	var idx = null;
	for(var i = 0, i < cart.length; i++) {
		if(cart[i].name === name)
			idx = i;
	}
	if(idx !== null)
		cart.splice(idx, 1); 
}

function remove_item_by_name(cart, name) {
	var new_cart = cart.slice(); // 1. 장바구니 복사
	var idx = null;
	for(var i = 0, i < new_cart.length; i++) { // 2. 복사본 변경
		if(new_cart[i].name === name) // 2. 복사본 변경
			idx = i;
	}
	if(idx !== null)
		new_cart.splice(idx, 1); // 2. 복사본 변경
}

function remove_item_by_name(cart, name) {
	var new_cart = cart.slice(); // 1. 장바구니 복사
	var idx = null;
	for(var i = 0, i < new_cart.length; i++) { // 2. 복사본 변경
		if(new_cart[i].name === name) // 2. 복사본 변경
			idx = i;
	}
	if(idx !== null)
		new_cart.splice(idx, 1); // 2. 복사본 변경
	return new_cart // 3. 복사본 리턴
}
```
그리고 이 함수를 사용하는 곳에서 전역변수를 변경
```js
function delete_handler(name) {
	shopping_cart = remove_item_by_name(shopping_cart, name); // <-- 전역변수 변경
	var total = calc_total(shopping_cart);
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total);
}
```

### 원래 버전과 카피-온-라이트 버전의 차이 보기
```js
function remove_item_by_name(cart, name) {
	var idx = null;
	for(var i = 0, i < cart.length; i++) {
		if(cart[i].name === name)
			idx = i;
	}
	if(idx !== null)
		cart.splice(idx, 1); // <-- 장바구니 변경함
}

function remove_item_by_name(cart, name) {
	var new_cart = cart.slice(); // 1. 장바구니 복사
	var idx = null;
	for(var i = 0, i < new_cart.length; i++) { // 2. 복사본 변경
		if(new_cart[i].name === name) // 2. 복사본 변경
			idx = i;
	}
	if(idx !== null)
		new_cart.splice(idx, 1); // 2. 복사본 변경
	return new_cart // 3. 복사본 리턴
}
```

### 앞에서 만든 카피-온-라이트 동작은 일반적입니다
`add_element_last()` 함수처럼 재사용하기 쉽도록 일반화 할 수 있습니다.
`.splice()`메서드를 일반화해 봅시다.
```js
// 원래 코드
function removeItems(array, idx, count) {
	array.splice(idx, count);
}
// 카피-온-라이트 적용
function removeItems(array, idx, count) {
	var copy = array.slice();
	copy.slice(idx, count);
	return copy;
}
```

```js
// 카피-온-라이트 버전
function remove_item_by_name(cart, name) {
	var new_cart = cart.slice(); // removeItems() 함수가 배열을 복사하기 때문에 이렇게 할 필요가 없음
	var idx = null;
	for(var i = 0, i < new_cart.length; i++) { 
		if(new_cart[i].name === name) 
			idx = i;
	}
	if(idx !== null)
		new_cart.splice(idx, 1); 
	return new_cart 
}

// splice() 사용한 카피-온-라이트 버전
function remove_item_by_name(cart, name) {
	var idx = null;
	for(var i = 0, i < cart.length; i++) { // new_cart -> cart
		if(cart[i].name === name) // new_cart -> cart
			idx = i;
	}
	if(idx !== null)
		return removeItems(cart, idx, 1); 
	return cart; // 값을 바꾸지 않으면 복사하지 않아도 됩니다.
}
```

### 자바스크립트 배열 훑어보기

### 연습 문제
- 메일링 리스트에 연락터 추가라는 코드
- 이메일 주소를 전역변수인 리스트에 추가합니다. 입력 폼을 처리하는 핸들러에서 이 동작을 부릅니다.
```js
var mailing_list = [];

function add_contact(email) {
	mailing_list.push(email)
}

function submit_form_handler(event) {
	var form = event.target
	var email = form.elements["email"].value;
	add_contact(email);
}
```
힌트
1. `add_contact()` 가 전역변수에 접근하면 안됩니다. mailing_list를 인자로 받아 복사하고 변경한 다음 리턴해야 합니다.
2. `add_contact()` 함수의 리턴값을 mailing_list 전역변수에 할당해야 합니다.

```js
var mailing_list = [];

function add_contact(mailing_list, email) {
	var new_mailing_list = mailing_list.slice()
	new_mailing_list.push(email)
	return new_mailing_list
}

function submit_form_handler(event) {
	var form = event.target
	var email = form.elements["email"].value;
	mailing_list = add_contact(mailing_list, email);
}
```

### 쓰기를 하면서 읽기 하는 동작은 어떻게 해야 할까요?
- shfit() 메서드가 좋은 예제입니다.
```js
var a = [1,2,3,4]
var b = a.shift()
console.log(b) // 1을  출력, 값을 리턴
console.log(a) // [2,3,4]를 출력, 값이 바뀜
```
`.shift()` 메서드는 값을 바꾸는 동시에 배열에 첫 번째 항목을 리턴합니다. 변경하면서 읽는 동작입니다.

카피-온-라이트로 바꾸기 위한 두 가지 저근 방법이 있습니다.
1. 읽기와 쓰기 함수로 각각 분리한다.
2. 함수에서 값을 두 개 리턴한다.
### 쓰면서 읽기도 하는 함수를 분리하기
1. 쓰기에서 읽기를 분리
2. 쓰기에 카피-온-라이트를 적용해 읽기로 변경

#### 읽기와 쓰기 동작으로 분리
- `.shift()`의 읽기 동작은 단순히 배열의 첫 번째 항목을 리턴하는 동작
```js
function first_element(array) {
	return array[0]
}
```
- `.shift()` 의 쓰기 동작은 메서드가 하는 일을 그대로 감사기만 하면 됩니다. 그리고 리턴값을 무시하도록 처리합니다.
```js
function drop_first(array) {
	array.shift() // .shift 실행하고 결괏값을 무시
}
```
#### 쓰기 동작을 카피-온-라이트로 바꾸기
```js
function drop_first(array) {
	var array_copy = array.slice()
	array_copy.shift() 
	return array_copy
}
```

### 값을 두 개 리턴하는 함수로 만들기
1. `.shift()` 메서드를 바꿀 수 있도록 새로운 함수로 감싸기
2. 읽기와 쓰기를 함께 하는 함수를 읽기만 하는 함수로 바꾸기
#### 동작을 감싸기
```js
function shift(array) {
	return array.shift()
}
```
#### 읽으면서 쓰기도 하는 함수를 읽기 함수로 바꾸기
```js
function shift(array) {
	var array_copy = array.slice()
	var first = array_copy.shift()
	return {
		first: first,
		array: array_copy
	}
}
```

#### 다른 방법
- 첫 번째 접근 방식을 사용해 두 값을 객체로 조합하는 방법
```js
function shift(array) {
	return {
		first: first_element(array),
		array: drop_first(array)
	}
}
```
- 두 함수 모두 계산, 조합해도 계산

### 연습 문제
- `.pop()`메서드도 두 가지 접근 방식을 이용해 읽기로 바꿔 봅시다.
1. 읽기 함수와 쓰기 함수로 분리하기
```js
function last_element(array) {
	return array.slice(-1)[0]
}

function drop_last(array) {
	array.pop()
}

function drop_last_copy_on_wright(array) {
	var array_copy = array.slice()
	array_copy.pop()
	return array_copy
}
```

2. 값 두 개를 리턴하는 함수로 만들기
```js
// 감싸기
function pop(array) {
	return array.pop()
}
// 카피-온-라이트
function pop(array) {
	var array_copy = array.slice()
	var last_element = array_copy.pop()
	return {
		last: last_element,
		array: array_copy
	}
}
```
### 쉬는 시간

### 연습 문제
- push의 카피-온-라이트
```js
function push(array, elem) {
	return [...array, elem]
}
```

### 연습 문제
- 위의 push() 함수를 사용해 리팩터링
```js
function add_contact(mailing_list, email) {
	var list_copy = mailing_list.slice()
	list_copy.push(email)
	return list_copy
}

function add_contact(mailing_list, email) {
	return push(mailing_list, email)
}
```

### 연습 문제
- 배열 항목을 카피-온-라이트 방식으로 설정하는 arraySet() 함수 만들기
```js
a[15] = 2;

function arraySet(array, idx, value) {
	var array_copy = array.slice()
	array_copy[idx] = value
	return array_copy
}
```

### 불변 데이터 구조를 읽는 것은 계산입니다

읽기와 쓰기가 액션과 계산, 데이터와 어떤 관계인가
- 변경 가능한 데이터 읽기 -> 액션
- 변경 불가능한 데이터 읽기 -> 계산
- 쓰기는 데이터를 변경, 쓰기가 없으면 데이터는 불변형
- 쓰기를 읽기로 바꾸면 코드에 계산이 많아짐

### 애플리케이션에는 시간에 따라 변는 상태가 있습니다
- 교체를 함으로써 새로운 값 또는 되돌리기를 사용할 수 있습니다. -> PART 2

### 불변 데이터 구조는 충분히 빠릅니다
일반적으로 불변 데이터 구조는 변경 가능한 데이터 구조보다 메모리를 많이 쓰고 느리지만 충분히 빠릅니다.
언제든 최적화할 수 있습니다.
가비지 콜렉터는 매우 빠릅니다.
생각보다 많이 복사하지 않습니다. `shallow copy`이기 때문입니다. 이것을 구조적 공유 `structural sharing`라고 합니다.
함수형 프로그래밍 언어에는 빠른 구현체가 있습니다.

### 객체에 대한 카피-온-라이트
- 객체 복사
```js
var object = {a:1, b:2}
var object_copy = Object.assign({}, object) // 빈 객체에 모든 키와 값을 복사
```
- 카피-온-라이트
```js
// 예시
function setPrice(item, new_price) {
	item.price = new_price
}

// copy-on-wright
function setPrice(item, new_price) {
	var item_copy = Object.assign({}, item)
	item_copy.price = new_price
	return item_copy
}
```

### 자바스크립트 객체 훑어보기

### 연습 문제
```js
o["price"] = 37

function objectSet(object, key, value) {
	var object_copy = Object.assign({}, object)
	object_copy[key] = value
	return object_copy
}
```

### 연습 문제
- 리팩터링: `objectSet()`을 사용해서 제품 가격을 설정하는 `setPrice()`함수 작성
```js
function setPrice(item, new_price) {
	var item_copy = Object.assign({}, item)
	item_copy.price = new_price
	return item_copy
}

function setPrice(item, new_price) {
	return objectSet(item, "price", new_price)
}
```

### 연습 문제
- `objectSet()` 함수를 이용해 제품 개수를 설정하는 `setQuantity()`함수를 작성
```js
function setQuantity(item, new_quantity) {
	return objectSet(item, 'quantity', new_quantity)
}
```

### 연습 문제
- delete 연산
```js
var a = {x:1}
delete a["x"]

function objectDelete(object, key) {
	var object_copy = Object.assign({}, object)
	delete object_copy[key]
	return object_copy
}
```

### 중첩된 쓰기를 읽기로 바꾸기

```js
function setPriceByName(cart, name, price) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			cart[i].price = price
	}
}

// copy-on-wright
function setPriceByName(cart, name, price) {
	var cartCopy = cart.slice()
	for(var i = 0; i < cartCopy.length; i++) {
		if(cartCopy[i].name === name)
			setPrice(cartCopy[i], price)
	}
	return cartCopy
}
```

### 어떤 복사본이 생겼을까요?

```js
shopping_cart = setPriceByName(shopping_cart, "t-shirt", 13)

function setPriceByName(cart, name, price) {
	var cartCopy = cart.slice() // 배열 복사
	for(var i = 0; i < cartCopy.length; i++) {
		if(cartCopy[i].name === name)
			setPrice(cartCopy[i], price) // 호출
	}
	return cartCopy
}

function setPrice(item, new_price) {
	var item_copy = Object.assign({}, item) // 객체 복사
	item_copy.price = new_price
	return item_copy
}
```

- 중첩된 데이터에 얕은복사로 구조적 공유가 되었습니다.

### 얕은 복사와 구조적 공유를 그림으로 알아보기

### 연습 문제
- 동그라미 표시하기
```js
shopping_cart 배열 복사
socks 객체 복사
```

### 연습 문제

```js
function setQuantityByName(cart, name, quantity) {
	for (var i = 0; i < cart.length; i++) {
		if (cart[i].name === name)
			cart[i].quantity = quantity;
	}
}

function setQuantityByName(cart, name, quantity) {
	var cart_copy = cart.slice()
	for (var i = 0; i < cart.length; i++) {
		if (cart_copy[i].name === name)
			cart_copy[i] = objectSet(cart_copy[i], 'quantity', quantity)
	}
	return cart_copy
}

```

### 결론
- 카피-온-라이트에 대해 더 자세히 배웠습니다.

### 요점 정리
- 함수형 프로그래밍에서 불변 데이터가 필요합니다. 계산에서는 변경 가능한 데이터에 쓰기를 할 수 없습니다.
- 카피-온-라이트를 활용해 데이터를 불변형으로 유지합니다.
- 카피-온-라이트는 얕은 복사를 하고 리턴합니다.
- 보일러 플레이트 코드를 줄이기 위해 기본적인 배열과 객체 동작에 대한 카피-온-라이트 버전을 만들어 두는 것이 좋습니다.

### 다음 장에서 배울 내용
방어적 복사`defensive copy`라는 원칙에 대해 알아보겠습니다.
## CHAPTER 5 더 좋은 액션 만들기
- 암묵적 입력과 출력을 제거해서 재사용하기 좋은 코드를 만드는 방법을 알아봅니다.
- 복잡하게 엉킨 코드를 풀어 더 좋은 구조로 만드는 법을 배웁니다.

### 비즈니스 요구 사항과 설계를 맞추기
#### 요구 사항에 맞춰 더 나은 추상화 단계 선택하기
`gets_free_shipping` 함수는 비즈니스 요구 사항으로 봤을 때 맞지 않는 부분이 있습니다.
요구 사항은 장바구니에 담긴 제품을 주문할 때 무료 배송인지 확인하는 것입니다.
하지만함수를 보면 장바구니로 무료 배송을 확인하지 않고 제품의 합계와 가격으로 확인하고 있습니다.
이것은 비즈니스 요구 사항과 맞지 않는 인자라고 할 수 있습니다.

```js
function gets_free_shipping(total, item_price) { // total, item_price는 요구사항과 맞지 않는 인자입니다.
	return item_price + total >= 20;
}
```

중복된 코드도 있습니다.
```js
function calc_total(cart) { 
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price; // <--- 장바구니 합계를 계산하는 코드가 중복
	}
	return total
}
```

```js
// 다음 함수를
gets_free_shipping(total, item_price)
// 아래와 같이 바꿉니다.
gets_free_shipping(cart)
// 그리고 calc_total() 함수를 재사용하여 중복을 없애봅시다.
```

### 비즈니스 요구 사항과 함수를 맞추기
#### 함수의 동작을 바꿨기 때문에 엄밀히 말하면 리팩터링이라고 할 수 없습니다.

```js
function gets_free_shipping(cart) {
	return calc_total(cart) >= 20;
}
```
바뀐 인수인 장바구니는 전자상거래에서 많이 사용하는 엔티티`entity` 타입이기 때문에 비즈니스 요구 사항과 잘 맞습니다.

함수 시그니처가 바뀌었기 때문에 사용하는 부분도 고쳐야 합니다.
```js
// Before
function update_shipping_icons() { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var overTwenty = gets_free_shipping(shopping_cart_total, item.price) // <--- 이부분
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

// After
function update_shipping_icons() { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(shopping_cart, item.name, item.price)
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

// ...

// add_item이 기억나지 않는다면 아래를 살펴봅시다.
function add_item(cart, name, price) { 
	var new_cart = cart.slice() 
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}
```
이제 `gets_free_shipping` 함수는 장바구니가 무료 배송인지 아닌지 알려줍니다.

> ***생각해보기***
> 방금 바꾼 코드에서 인상적인 부분은?
> 원래 있던 장바구니를 직접 변경하지 않고 복사본`new_cart`을 만들었습니다. 이런 스타일을 함수형 프로그래밍에서 많이 사용합니다.
> 이 방법을 무엇이라고 부를까요? `copy on wright`?

### 쉬는 시간
코드 라인 수가 늘어났습니다. 그래도 좋은 코드인가요?
- 유지보수하기 좋은 코드를 평가하기에 코드 라인 수는 좋은 지표로 사용할 수 있습니다.
- 하지만 코드 라인 수만으로는 좋은 코드인지 판단하기 어렵습니다. 여러 가지 지표 중 또 다른 지표는 함수의 크기입니다.
- 작은 함수는 이해하기 쉽습니다. 우리가 만든 계산 함수는 매우 작습니다. 또 이 함수는 응집력 있고 재사용하기 쉽습니다.
`add_item()` 함수를 부를 때마다 cart 배열을 복사합니다. 비용이 너무 많이 들지는 않나요?
- 배열을 바꾸는 것보다 비용이 더 드는 것은 맞지만 최신 프로그래밍 언어의 런타임과 가비지 컬렉터는 불필요한 메모리를 효율적으로 잘 처리합니다.
- 자바스크립트는 불변형 문자열 구조를 제공합니다. 두 문자열을 합치면 항상 새로운 문자열을 만듭니다. 이 때 모든 문자를 복사하지만, 비용에 대해 고민하지 않습니다.
- 그리고 복사본을 사용할 때 잃는 것보다 얻는 것이 더 많이 있습니다.
- 또 복사본을 만드는 코드가 느리다면 나중에 최적화할 수 있습니다.[[CHAPTER 6]]

### 💡원칙: 암묵적 입력과 출력은 적을수록 좋습니다
인자가 아닌 모든 입력은 암묵적 입력이고 리턴값이 아닌 모든 출력은 암묵적 출력입니다. 
암묵적 입력과 출력이 없는 함수를 작성했고 이 함수를 `계산`이라고 불렀습니다.

계산을 만들기 위해 암묵적 입력과 출력을 없애는 원칙은 `액션`에도 적용할 수 있습니다.
`액션`에서 모든 암묵적 입력과 출력을 없애지 않더라도 암묵적 입력과 출력을 줄이면 좋습니다.

어떤 함수에 암묵적 입력과 출력이 있다면 다른 컴포넌트와 강하게 연결된 컴포넌트라 할 수 있습니다. 
이런 함수의 동작은 연결된 부분의 동작에 의존합니다.
암묵적 입력과 출력을 명시적으로 바꿔 모듈화된 컴포넌트로 만들 수 있습니다.

암묵적 입력이나 암묵적 출력을 사용할 때는 외부에서 영향을 주거나 받는 것을 주의해야 합니다.
암묵적 입력이나 출력이 있는 함수는 아무 때나 실행할 수 없기 때문에 테스트하기 어렵습니다.

계산은 암묵적 입력과 출력이 없기 때문에 테스트하기 쉽습니다. 
모든 암묵적 입력과 출력을 없애지 못해 액션을 계산으로 바꾸지 못해도 암묵적 입력과 출력을 줄이면 테스트하기 쉽고 재사용하기 좋습니다.

### 암묵적 입력과 출력 줄이기
`update_shipping_icons()` 함수에 이 원칙을 적용해 암묵적 입력과 출력을 줄여 봅시다.

```js
// Before
function update_shipping_icons() { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(shopping_cart, item.name, item.price) // shopping_cart는 전역변수
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
// After
function update_shipping_icons(cart) { // 전역변수 대신 cart 인자 추가
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(cart, item.name, item.price) // 전역변수 대신 cart 인자 사용
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

// Before
function calc_cart_total() {
	shopping_cart_total = calc_total(shopping_cart); 
	set_cart_total_dom();
	update_shipping_icons(); // <-- update_shipping_icons 함수를 호출하는 부분
	update_tax_dom(); 
}
// After
function calc_cart_total() {
	shopping_cart_total = calc_total(shopping_cart); 
	set_cart_total_dom();
	update_shipping_icons(shopping_cart); // 인자로 전달
	update_tax_dom(); 
}
```

> ***생각해 보기***
> 암묵적 입력을 없앴지만 아직도 액션입니다.
> 함수가 더 좋아졌나요? 다양한 환경에서 재사용할 수 있나요?
> 테스트하기 더 쉬워졌나요? 

-> 테스트 하긴 쉬워진 것 같음

### 연습 문제

지금까지 만든 액션에서 전역변수를 읽는 부분을 얼마나 인자로 바꿀 수 있을까요?
```js
function add_item_to_cart(name, price) { 
	shopping_cart = add_item(shopping_cart, name, price)
	calc_cart_total(); 
}

function calc_cart_total() { 
	shopping_cart_total = calc_total(shopping_cart); // 전역변수 읽는 부분
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}

function set_cart_total_dom() {
	...
	shopping_cart_total // 전역변수 읽는 부분
	...
}

function update_shipping_icons(cart) { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(cart, item.name, item.price) 
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

const TAX_RATE = 0.10

function update_tax_dom() { 
	var cart_total_with_tax = calc_tax(shopping_cart_total, TAX_RATE) // 전역변수 읽는 부분
	set_tax_dom(cart_total_with_tax)
}
```
- 변경 후
```js
function add_item_to_cart(name, price) {
	shopping_cart = add_item(shopping_cart, name, price)
	calc_cart_total(shopping_cart); // 인자로 전역변수 추가
}

function calc_cart_total(cart) { 
	var total = calc_total(cart); // 새로운 total 변수를 사용
	set_cart_total_dom(total); // total 인수 추가
	update_shipping_icons(cart);
	update_tax_dom(total); // total 인수 추가
	shopping_cart_total = total // 전역변수에 할당
}

function set_cart_total_dom(total) { 
	...
	total // 전역변수 읽는 부분 -> total 인수 사용
	...
}

function update_shipping_icons(cart) { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(cart, item.name, item.price) 
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

const TAX_RATE = 0.10

function update_tax_dom(total) { 
	var cart_total_with_tax = calc_tax(total, TAX_RATE) // 전역변수 읽는 부분 -> total 인수 사용
	set_tax_dom(cart_total_with_tax)
}
```

### 코드 다시 살펴보기
사용하지 않는 shopping_cart_total을 제거하고 조금 과한 calc_cart_total() 함수를 병합 합니다.
- before
```js
function add_item_to_cart(name, price) {
	shopping_cart = add_item(shopping_cart, name, price)
	calc_cart_total(shopping_cart); 
}

function calc_cart_total(cart) { 
	var total = calc_total(cart); 
	set_cart_total_dom(total); 
	update_shipping_icons(cart);
	update_tax_dom(total); 
	shopping_cart_total = total 
}
```
- after
```js
function add_item_to_cart(name, price) { 
	shopping_cart = add_item(shopping_cart, name, price)
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}
```

### 계산 분류하기
#### 의미 있는 계층에 대해 알아보기 위해 계산을 분류해 봅시다.
> C: cart에 대한 동작
> I: item에 대한 동작
> B: 비즈니스 규칙

```js
// C, I
function add_item(cart, name, price) { 
	var new_cart = cart.slice() // slice()는 자바스크립트에서 배열을 복사하는 함수입니다.
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}

// C I B 
function calc_total(cart) { // 이 함수는 cart 구조를 알고 MegaMart에서 합계를 결정하는 비즈니스 규칙도 담고 있습니다.
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}

// B
function gets_free_shipping(cart) {
	return calc_total(cart) >= 20;
}

// B
function calc_tax(amount) {
	return amount * 0.10;
}
```
- 시간이 지날수록 명확하게 나누어질 것입니다. 이렇게 나눈 것은 코드에서 의미있는 계층이 되기 때문에 기억해두면 좋습니다.[[CHAPTER 8]]
- 계층은 엉켜있는 코드를 풀면 자연스럽게 만들어집니다.
- 다음 원칙인 엉켜있는 코드를 푸는 것에 대해 알아봅시다.

### 💡원칙: 설계는 엉켜있는 코드를 푸는 것이다
함수를 사용하면 관심사를 자연스럽게 분리할 수 있습니다.
분리된 것은 언제든 쉽게 조합할 수 있습니다. 
#### 재사용하기 쉽다.
함수는 작을수록 재사용하기 쉽습니다.
#### 유지보수하기 쉽다.
작은 함수는 쉽게 이해할 수 있고 유지보수하기 쉽습니다.
#### 테스트하기 쉽다.
한 가지 일만 하기 때문에 한 가지만 테스트하면 됩니다.

### `add_item()`을 분리해 더 좋은 설계 만들기
- 자세히 살펴보면 `add_item()` 함수도 네 부분으로 나눌 수 있습니다.
```js
// C, I
function add_item(cart, name, price) { 
	var new_cart = cart.slice() // 1. 배열을 복사
	new_cart.push({  // 2. item 객체를 만듭니다. // 3. (push) 복사본에 item을 추가
		name: name,
		price: price
	});
	return new_cart // 4. 복사본을 리턴합니다.
}
```

- `add_item()` 함수는 cart와 item 구조를 모두 알고 있습니다. item에 관한 코드를 별도의 함수로 분리해 봅시다.
```js
function make_cart_item(name, price) { // 생성자 함수를 만듭니다.
	return { // 2. item 객체를 만듭니다.
		name: name,
		price: price
	};
}

function add_item(cart, item) { 
	var new_cart = cart.slice() // 1. 배열을 복사합니다.
	new_cart.push(item); // 3. 복사본에 item을 추가
	return new_cart // 4. 복사본 리턴
}

add_item(shopping_cart, make_cart_item("shoes", 3.45)) // 호출부를 수정합니다.
```

item 구조만 알고 있는 함수(make_cart_item)와 cart 구조만 알고 있는 함수(add_item)로 나눠 원래 코드를 고쳤습니다.
이렇게 분리하면 cart와 item을 독립적으로 확장할 수 있습니다.
예를 들어 배열인 cart를 해시 맵 같은 자료 구조로 바꾼다고 할 때 변경해야 할 부분이 적습니다.

1번과 3번, 4번은 값을 바꿀 때 복사하는 카피-온-라이트`copy-on-wright`를 구현한 부분이기 때문에 함께 두는 것이 좋습니다.[[CHAPTER 6]]

이제 add_item() 함수는 cart와 item에 특화된 함수가 아닙니다. 일반적인 배열과 항목을 넘겨도 잘 동작합니다. 이름을 알맞게 바꿔 봅시다.

### 카피-온-라이트 패턴을 빼내기
- `add_item()` 함수는 일반적인 배열과 항목에 쓸 수 있지만 이름은 일반적이지 않습니다.
- 이름만 보면 장바구니를 넘겨야 쓸 수 있을 것 같습니다.
```js
function add_item(cart, item) { 
	var new_cart = cart.slice() // 1. 배열을 복사합니다.
	new_cart.push(item); // 3. 복사본에 item을 추가
	return new_cart // 4. 복사본 리턴
}
```
- 함수 이름과 인자 이름을 더 일반적인 이름으로 바꿔 봅시다.
- 원래 `add_item()`함수는 간단하게 다시 만들 수 있습니다.
```js
function add_item(cart, item) {
	return add_element_last(cart, item)
}

function add_element_last(array, elem) {
	var new_array = array.slice();
	new_array.push(elem);
	return new_array;
}
```

- 장바구니와 제품에만 쓸 수 있는 함수가 아닌 어떤 배열이나 항목에도 쓸 수 있는 이름으로 바꿨습니다.
- 이 함수는 재사용할 수 있는 유틸리티 함수입니다. 불변성에 대한 내용은 [[CHAPTER 6]][[CHAPTER 7]]에서 자세히 살펴보겠습니다.

### `add_item()` 사용하기

`add_item()`은 cart, name, price 인자가 필요한 함수였다가, cart와 item 인자만 필요해졌습니다.
그리고 item을 만드는 생성자 함수를 분리했습니다.
- before
```js
function add_item(cart, name, price) { 
	var new_cart = cart.slice() 
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}
```
- after
```js
function add_item(cart, item) {
	return add_element_last(cart, item)
}

function make_cart_item(name, price) { 
	return { 
		name: name,
		price: price
	};
}
```
그래서 `add_item()`을 호출하는 곳에서 올바른 인자를 넘기도록 고쳐야 합니다.

- before
```js
function add_item_to_cart(name, price) { 
	shopping_cart = add_item(shopping_cart, name, price)
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}
```
- after
```js
function add_item_to_cart(name, price) { 
	var item = make_cart_item(name, price) // <-- 라인 추가
	shopping_cart = add_item(shopping_cart, item) // <-- 인자 변경
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}
```

### 계산을 분류하기
코드 수정이 끝났습니다. 이제 계산을 한 번 더 봅시다.
> C cart에 대한 동작
> I item에 대한 동작
> B 비즈니스 규칙
> A 배열 유틸리티

```js
// 원래 하나인 함수를 세 개로 나눴습니다.

// add_item
// --->
	// add_item
	// add_element_last
	// make_cart_item

// A
function add_element_last(array, elem) {
	var new_array = array.slice();
	new_array.push(elem);
	return new_array;
}
// C
function add_item(cart, item) {
	return add_element_last(cart, item)
}

// I
function make_cart_item(name, price) { // 생성자 함수를 만듭니다.
	return { // 2. item 객체를 만듭니다.
		name: name,
		price: price
	};
}

// C I B // 변경 없음
function calc_total(cart) { 
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price; 
	}
	return total
}

// B // 변경 없음
function gets_free_shipping(cart) {
	return calc_total(cart) >= 20;
}

// B // 변경 없음
function calc_tax(amount) {
	return amount * 0.10;
}
```

### 쉬는 시간
#### 더 진행하기 전에 가벼운 질문을 보면서 쉬어 갑시다.
- 계산을 유틸리티와 장바구니, 비즈니스 규칙으로 다시 나누는 이유는
	- 최종적으로 코드를 구분된 그룹과 분리된 계층으로 구성할 것인데, 미리 보면 나중에 이해하는 데 도움이 될 것입니다.
- 비즈니스 규칙과 장바구니 기능의 차이는? 전자상거래를 만드는 것이라면 장바구니에 관한 것은 모두 비즈니스 규칙이 아닌가
	- 비즈니스 규칙은 MegaMart에서 운영하는 특별한 규칙입니다. 무료배송 규칙이 그 예시 입니다.
- 비즈니스 규칙과 장바구니에 대한 동작에 모두 속하는 함수도 존재할까
	- 지금 시점에서는 존재하나 계층에 관점에서 보면 코드에서나는 냄새입니다.
	- 비즈니스 규칙에서 장바구니가 배열인지 알아야 한다면 문제가 될 수 있습니다.
	- 비즈니스 규칙은 장바구니 구조와 같은 하위 계층보다 빠르게 바뀝니다. 설계를 진행하면서 이 부분은 분리해야 합니다.

### 연습 문제
`update_shipping_icons()` 이 함수가 하는 일을 나열하고 분류했습니다.

```js
function update_shipping_icons(cart) { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(cart, item) 
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
```
함수가 하는 일
1. 모든 버튼을 가져오기 
2. 버튼을 가지고 반복하기
3. 버튼에 관련된 제품을 가져오기
4. 가져온 제품을 가지고 새 장바구니 만들기
5. 장바구니가 무료 배송이 필요한지 확인하기
6. 아이콘 표시 또는 감추기

1~3: 구매하기 버튼 관련 동작
4~5: cart와 item 관련 동작
6: DOM 관련 동작

이 함수를 하나의 분류에만 속하도록 풀어 봅시다. 푸는 방법은 여러 가지 있습니다.

```js
function update_shipping_icons(cart) { 
	var buy_buttons = get_buy_buttons_dom(); // 구매하기 버튼 관련 동작
	for(var i = 0; i < buy_buttons.length; i++) { // 구매하기 버튼 관련 동작
		var button = buy_buttons[i]; 
		var item = button.item; // 구매하기 버튼 관련 동작
		var new_cart = add_item(cart, item) // cart와 item 관련 동작
		var overTwenty = gets_free_shipping(new_cart) // cart와 item 관련 동작
		if(overTwenty) // DOM 관련 동작
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
```

```js
function update_shipping_icons(cart) { // 구매하기 버튼 관련 동작
	var buy_buttons = get_buy_buttons_dom(); 
	for(var i = 0; i < buy_buttons.length; i++) { 
		var button = buy_buttons[i]; 
		var item = button.item; 
		var overTwenty = gets_free_shipping_with_item(cart, button.item)
		set_free_shipping_icon(button, overTwnety)
	}
}

function gets_free_shipping_with_item(cart, item) { // cart와 item 관련 동작
	var new_cart = add_item(cart, item) 
	return gets_free_shipping(new_cart) 
}

function set_free_shipping_icon(button, isShown) { // DOM 관련 동작
	if(isShown) 
		button.show_free_shipping_icon();
	else
		button.hide_free_shipping_icon();
}
```

### 작은 함수와 많은 계산
- 지금까지 고친 코드에 액션, 계산, 데이터를 표시해 봅시다
```js
var shopping_cart = [] // Action
var shopping_cart_total = 0; 
const TAX_RATE = 0.10

// 액션 함수들

function add_item_to_cart(name, price) {  // Action 전역변수 읽기
	shopping_cart = add_item(shopping_cart, make_cart_item(name, price))
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}


function update_shipping_icons(cart) { // Action 
	var buy_buttons = get_buy_buttons_dom(); 
	for(var i = 0; i < buy_buttons.length; i++) { 
		var button = buy_buttons[i]; 
		var item = button.item; 
		var overTwenty = gets_free_shipping_with_item(cart, button.item)
		set_free_shipping_icon(button, overTwnety) // DOM 수정
	}
}

function gets_free_shipping_with_item(cart, item) { // Calculation 
	var new_cart = add_item(cart, item) 
	return gets_free_shipping(new_cart) 
}

function set_free_shipping_icon(button, isShown) { // Action DOM 수정
	if(isShown) 
		button.show_free_shipping_icon();
	else
		button.hide_free_shipping_icon();
}

function update_tax_dom(total) { // Action
	var cart_total_with_tax = calc_tax(total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}

function calc_cart_total(cart) { // Action
    var total = cacl_total(cart)
	set_cart_total_dom(total);
	update_shipping_icons(cart);
	update_tax_dom(total); 
    shopping_cart_total = total
}

function set_cart_total_dom(total) { // Action
	// ...
	total // 전역변수 읽는 부분 -> total 인수 사용
	// ...
}

// 계산 함수들(암묵적 입력과 출력이 없음)

// Cart
function add_item(cart, item) { 
	return add_element_last(cart, item)
}

// Array utility
function add_element_last(array, elem) { 
	var new_array = array.slice();
	new_array.push(elem);
	return new_array;
}

// Item
function make_cart_item(name, price) { 
	return { 
		name: name,
		price: price
	};
}

// Business
function calc_tax(amount, tax_rate) { // Calculation
	return amount * tax_rate
}

// Business
function gets_free_shipping(cart) { // Calculation
	return cart_total(cart) >= 20;
}

// Cart, Item, Business
function calc_total(cart) { // Calculation
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}


```

### 결론
이제 액션은 데이터 구조에 대해 몰라도 됩니다. 그리고 재사용할 수 있는 유용한 인터페이스함수가 많이 생겼습니다.
하지만 아직 버그가 장바구니에 많이 숨어 있습니다. 곧 알 수 있습니다. 그전에 먼저 불변성에 대해 자세히 알아봐야 합니다.
### 요점 정리
- 일반적으로 암묵적인 입력과 출력은 인자와 리턴값으로 바꿔 없애는 것이 좋습니다.
- 설계는 엉켜있는 것을 푸는 것입니다. 풀려있는 것은 언제든 다시 합칠 수 있습니다.
- 엉켜있는 것을 풀어 각 함수가 하나의 일만 하도록 하면, 개념을 중심으로 쉽게 구성할 수 있습니다.

### 다음 장에서 배울 내용
설계에 대한 내용은[[CHAPTER 8]]에서 다시 살펴보겠습니다. 다음 두 장에서 불변성에 대해 알아보겠습니다.
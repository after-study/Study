## CHAPTER 4 액션에서 계산 빼내기

### MegaMart 코드
```js
// 장바구니 제품과 금액 합계를 담고 있는 전역변수
var shopping_cart = [] 
var shopping_cart_total = 0;

function add_item_to_cart(name, price) {
	shopping_cart.push({ // 장바구니에 제품을 탐기 위해 cart 배열에 레코드 추가
		name: name,
		price: price
	});
	calc_cart_total(); // 장바구니 제품 금액 합계 업데이트
}

function calc_cart_total() {
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shpping_cart_total += item.price; // 모든 제품 값 더하기
	}
	set_cart_total_dom(); // dom 업데이트
}
```

### 무료 배송비 계산하기
#### 새로운 요구사항
구매 합계 20달러 이상이면 무료배송
장바구니에 추가했을 때 20달러가 넘는 제품에 대해 무료 배송 아이콘을 표시

#### 절차적인 방법으로 구현
```js
function update_shipping_icons() {
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		if(item.price + shopping_cart_total >= 20)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
```

합계 금액이 바뀔 떄마다 모든 아이콘을 업데이트하기 위해 calc_cart_total() 함수 마지막에 update_shipping_icons 함수를 호출합니다.
```js
function calc_cart_total() {
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shpping_cart_total += item.price; // 모든 제품 값 더하기
	}
	set_cart_total_dom(); // dom 업데이트
	update_shipping_icons() // 아이콘을 업데이트
}

```

### 세금 계산하기
#### 다음 요구사항
장바구니 금액 합계가 바뀔 때마다 세금을 다시 계산합니다.
```js
function update_tax_dom() {
	set_tax_dom(shopping_cart_total * 0.10);
}
```

calc_cart_total() 함수 마지막에 세금을 계산하는 함수를 호출합니다.
```js
function calc_cart_total() {
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shopping_cart_total += item.price;
	}
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); // 세금 업데이트
}
```

### 테스트하기 쉽게 만들기
#### 비즈니스 규칙을 테스트하기 어려움
코드가 바뀔 때마다 테스트를 만들어야 합니다.
1. 브라우저 설정하기
2. 페이지 로드하기
3. 장바구니에 제품 담기 버튼 클릭
4. DOM이 업데이트될 때까지 기다리기
5. DOM에서 값 가져오기
6. 가져온 문자열 값을 숫자로 바꾸기
7. 예상하는 값과 비교하기

#### 조지(테스트 담당)의 코드 설명
결괏값을 얻을 방법은 DOM에서 값을 가져오는 방법`set_tax_dom`뿐입니다.
테스트하기 전에 전역변숫값`shopping_cart_total`을 설정해야 합니다.
조지가 테스트해야 하는 비즈니스 규칙(`total * 0.10`)
```js
function update_tax_dom() {
	set_tax_dom(shoppung_cart_total * 0.10);
}
```

#### 테스트 개선을 위한 조지의 제안
테스트를 더 쉽게 하려면 다음 조건이 필요합니다.
- DOM 업데이트와 비즈니스 규칙은 분리되어야 합니다.
- 전역변수가 없어야 합니다!

### 재사용하기 쉽게 만들기
#### 결제팀과 배송팀이 재사용하려 합니다
- 장바구니 정보를 전역변수에서 읽어오고 있지만, 결제팀과 배송팀은 데이터베이스에서 장바구니 정보를 읽어 와야 합니다.
- 결과를 보여주기 위해 DOM을 직접 바꾸고 있지만, 결제팀은 영수증을, 배송팀은 운송장을 출력해야 합니다.

#### 코드 설명
```js
function update_shipping_icons() {
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		if(item.price + shopping_cart_total >= 20) // 결제팀과 배송팀에서 이 비즈니스 규칙을 사용하려 합니다 (>=20)
			button.show_free_shipping_icon(); // 이 함수는 전역변수인 shopping_cart_total 값이 있어야 실행할 수 있습니다.
		else
			button.hide_free_shipping_icon(); // 이 코드는 DOM이 있어야 실행할 수 있습니다.
	}
} // 리턴 값이 없기 때문에 결과를 받을 방법이 없습니다.
```

#### 개발팀 제나의 제안
재사용하려면 아래와 같은 조건이 필요합니다.
- 전역변수에 의존하지 않아야 합니다.
- DOM을 사용할 수 있는 곳에서 실행된다고 가정하면 안 됩니다.
- 함수가 결괏값을 리턴해야 합니다.

### 액션과 계산, 데이터를 구분하기
모든 것이 ~~쌔삥~~ Action
```js
// 장바구니 제품과 금액 합계를 담고 있는 전역변수
var shopping_cart = [] // Action
var shopping_cart_total = 0; // Action

function add_item_to_cart(name, price) { // Action(전역변수 변경)
	shopping_cart.push({ // 장바구니에 제품을 탐기 위해 cart 배열에 레코드 추가
		name: name,
		price: price
	});
	calc_cart_total(); // 장바구니 제품 금액 합계 업데이트
}

function update_shipping_icons() { // Action(DOM을 읽고 쓰기)
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		if(item.price + shopping_cart_total >= 20)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

function update_tax_dom() { // Action(DOM 변경)
	set_tax_dom(shoppung_cart_total * 0.10);
}

function calc_cart_total() { // Action(전역변수 변경)
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shopping_cart_total += item.price;
	}
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); // 세금 업데이트
}
```

### 함수에는 입력과 출력이 있습니다
#### 입력과 출력은 명시적이거나 암묵적일 수 있습니다

```js
var total = 0;
function add_to_total(amount) { // amount: 명시적 입력
	console.log("Old total: " + total) // 암묵적 입력: 전역변수 읽기
	total += amount; // 암묵적 출력: 전역변수 변경
	return total; // 명시적 출력
}
```

#### 함수에 암묵적 입력과 출력이 있으면 액션이 됩니다.
암묵적 입력: 인자 외 다른 입력
암묵적 출력: 리턴값 외 다른 출력

**함수에서 암묵적 입력과 출력을 없애면 계산이 됩니다.** 
암묵적 입력은 함수의 인자로 바꾸고, 암묵적 출력은 함수의 리턴값으로 바꾸면 됩니다.

### 테스트와 재사용성은 입출력과 관련 있습니다
테스트를 더 쉽게 하려면 다음 조건이 필요합니다.
- DOM 업데이트와 비즈니스 규칙은 분리되어야 합니다.
	- DOM 업데이트는 암묵적 출력입니다. 비즈니스 규칙과 분리해야 합니다.
- 전역변수가 없어야 합니다.
	- 전역변수를 읽는 암묵적 입력과 전역변수를 변경하는 것은 암묵적 출력입니다.
	- 암묵적 입력은 인자로 바꾸고 암묵적 출력은 리턴값으로 바꾸면 됩니다.
재사용하려면 아래와 같은 조건이 필요합니다.
- 전역변수에 의존하지 않아야 합니다.
	- 암묵적 입력과 출력을 없애자고 제안한 것입니다.
- DOM을 사용할 수 있는 곳에서 실행된다고 가정하면 안 됩니다.
	- DOM을 직접 쓰는 것은 암묵적 출력입니다. 이것은 함수의 리턴값으로 바꿀 수 있습니다.
- 함수가 결괏값을 리턴해야 합니다.
	- 명시적 출력을 사용하자고 제안하고 있습니다.
### 액션에서 계산 빼내기

```js
function calc_cart_total() { 
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shopping_cart_total += item.price;
	}
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}
```
- 서브루틴 추출하기
```js
function calc_cart_total() { 
	calc_total(); // 새로 만든 함수 호출
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}

function calc_total() {
	shopping_cart_total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		shopping_cart_total += item.price;
	}
}
```
- 암묵적 출력을 없앤 코드
```js
function calc_cart_total() { 
	shopping_cart_total = calc_total(); // 새로 만든 함수 호출
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}

function calc_total() {
	var total = 0;
	for(var i = 0; i < shopping_cart.length; i++) {
		var item = shopping_cart[i];
		total += item.price;
	}
	return total
}
```
- 암묵적 입력 없앤 코드
```js
function calc_cart_total() { 
	shopping_cart_total = calc_total(shopping_cart); // 새로 만든 함수 호출
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}

function calc_total(cart) {
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}

```
이제 `calc_total` 함수는 계산입니다. 모든 입력은 인자이고 모든 출력은 리턴값입니다.

### 액션에서 또 다른 계산 빼내기
- 장바구니를 바꾸니 코드에서 함수 추출
```js
function add_item_to_cart(name, price) {
	shopping_cart.push({ 
		name: name,
		price: price
	});
	calc_cart_total(); 
}
```

```js
function add_item_to_cart(name, price) {
	add_item(name, price)
	calc_cart_total(); 
}

function add_item(name, price) {
	shopping_cart.push({ 
		name: name,
		price: price
	});
}
```
- 새로 만든 함수는 아직 액션입니다. 전역변수를 바꾸기 때문입니다.
- 전역변수를 읽고 쓰기 때문에 암묵적 입력과 암묵적 출력이 있습니다.
- 이 것을  인자와 리턴값으로 바꿔 봅시다.

- 암묵적 입력 없애기
```js
function add_item_to_cart(name, price) {
	add_item(shopping_cart, name, price)
	calc_cart_total(); 
}

function add_item(cart, name, price) {
	cart.push({ 
		name: name,
		price: price
	});
}
```
- 암묵적 출력 없애기
- 전역변수를 변경하는 대신 복사본을 만들고 복사본에 추가해 리턴합니다.
```js
function add_item_to_cart(name, price) {
	shpping_cart = add_item(shopping_cart, name, price)
	calc_cart_total(); 
}

function add_item(cart, name, price) {
	var new_cart = cart.slice() // 복사본을 만듭니다
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}
```
- add_item 함수는 암묵적 입력이나 출력이 없는 계산입니다.

### 쉬는 시간
- 코드가 더 많아졌지만 장점은 테스트하기 쉬워졌고 재사용하기 좋아진 것입니다.
- 함수형 프로그래밍에서 테스트와 재사용성 뿐아니라 동시성이나 설계, 데이터 모델링 측면에서 좋은 점들이 있습니다.
- 다른 곳에서 쓰지 않더라도 계산으로 분리하는 것은 테스트하기 쉽고 재사용하기 쉽고 이해하기 쉽기 때문입니다.
- 계산으로 바꾼 함수 안에서 변수를 변경하고 있는데, 값이 바뀌지 않으려면 원칙이 필요한데 [[CHAPTER 6]]에서 다루겠습니다.

### 계산 추출을 단계별로 알아보기
1. 계산 코드를 찾아 빼냅니다.
2. 새 함수에 암묵적 입력과 출력을 찾습니다.
3. 암묵적 입력은 인자로 암묵적 출력은 리턴값으로 바꿉니다.

### 연습 문제
- 결제 부서에서 `shopping_cart_total * 0.10` 이 부분을 세금 계산 코드에 쓰려고 합니다.
- 세금 계산하는 부분을 추출해 보세요.
```js
function update_tax_dom() {
	set_tax_dom(shopping_cart_total * 0.10)
}
```
1. 코드를 선택하고 빼냅니다.
2. 암묵적 입력과 출력을 찾습니다.
3. 입력은 인자로 바꾸고 출력은 리턴값으로 바꿉니다.

```js
const TAX_RATE = 0.10

function update_tax_dom() {
	var cart_total_with_tax = calc_tax(shopping_cart_total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}

function calc_tax(amount, tax_rate) {
	return amount * tax_rate
}
```
- 책에서는 calc_tax에 0.10 값을 암묵적 입력으로 쓰고있는 것 같은데?

### 연습 문제
- 배송팀에서 무료 배송인지 확인하기 위해서 코드를 사용하려 합니다.
- 계산을 추출해 보세요
```js
function update_shipping_icons() {
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		if(item.price + shopping_cart_total >= 20) // 배송팀에서 사용하려는 비즈니스 규칙
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
```

```js
function update_shipping_icons() { 
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var overTwenty = totalOverTwenty(item.price, shopping_cart_total)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

function totalOverTwenty(itemPrice, total) {
	return itemPrice + total >= 20
}
```

### 전체 코드를 봅시다

```js
// 장바구니 제품과 금액 합계를 담고 있는 전역변수
var shopping_cart = [] // Action
var shopping_cart_total = 0; // Action

function add_item_to_cart(name, price) { // Action
	shpping_cart = add_item(shopping_cart, name, price)
	calc_cart_total(); 
}

function add_item(cart, name, price) { // Calculation
	var new_cart = cart.slice() // 복사본을 만듭니다
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}

function update_shipping_icons() { // Action
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var overTwenty = totalOverTwenty(item.price, shopping_cart_total)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}

function totalOverTwenty(itemPrice, total) { // Calculation
	return itemPrice + total >= 20
}

const TAX_RATE = 0.10

function update_tax_dom() { // Action
	var cart_total_with_tax = calc_tax(shopping_cart_total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}

function calc_tax(amount, tax_rate) { // Calculation
	return amount * tax_rate
}

function calc_cart_total() { // Action
	shopping_cart_total = calc_total(shopping_cart); // 새로 만든 함수 호출
	set_cart_total_dom();
	update_shipping_icons();
	update_tax_dom(); 
}

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
모두가 행복해졌습니다.
### 요점 정리
- 액션은 암묵적인 입력 또는 출력을 가지고 있습니다.
- 계산의 정의에 따르면 계산은 암묵적인 입력이나 출력이 없어야 합니다.
- 공유 변수(전역변수 같은)는 일반적으로 암묵적 입력 또는 출력이 됩니다.
- 암묵적 입력은 인자로 바꿀 수 있습니다.
- 암묵적 출력은 리턴값으로 바꿀 수 있습니다.
- 함수형 원칙을 적용하면 액션은 줄어들고 계산은 늘어난다는 것을 확인했습니다.

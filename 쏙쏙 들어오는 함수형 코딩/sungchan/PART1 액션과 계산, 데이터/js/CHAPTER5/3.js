// 1. 계산 분류하기
// 2. add_item()을 분리해 더 좋은 설계 만들기
// 3. 카피-온-라이트 패턴을 빼내기
// 4. add_item() 사용하기
// 5. 계산을 분류하기

// 장바구니 제품과 금액 합계를 담고 있는 전역변수
var shopping_cart = [] // Action
var shopping_cart_total = 0; // Action

function add_item_to_cart(name, price) { // 2. 코드 다시 살펴보기
    var item = make_cart_item(name, price)
	shopping_cart = add_item(shopping_cart, item)
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}
// C I
// function add_item(cart, name, price) { // Calculation
// 	var new_cart = cart.slice() // 복사본을 만듭니다
// 	new_cart.push({ 
// 		name: name,
// 		price: price
// 	});
// 	return new_cart
// }

// I 아이템에 대한 동작
function make_cart_item(name, price) { // 생성자 함수를 만듭니다.
	return { // 2. item 객체를 만듭니다.
		name: name,
		price: price
	};
}
// C 카트에 대한 동작
function add_item(cart, item) {
	return add_element_last(cart, item)
}
// 장바구니와 제품에만 쓸 수 있는 함수가 아닌 어떤 배열이난 항목에도 사용 가능한 이름
// A 배열 유틸리티
function add_element_last(array, elem) {
	var new_array = array.slice();
	new_array.push(elem);
	return new_array;
}

function update_shipping_icons(cart) { // 암묵적 입력과 출력 줄이기. 전역변수 대신 cart 인자 추가
	var buy_buttons = get_buy_buttons_dom();
	for(var i = 0; i < buy_buttons.length; i++) {
		var button = buy_buttons[i];
		var item = button.item;
		var new_cart = add_item(cart, make_cart_item(item.name, item.price)) // 전역변수 대신 cart 인자 사용
		var overTwenty = gets_free_shipping(new_cart)
		if(overTwenty)
			button.show_free_shipping_icon();
		else
			button.hide_free_shipping_icon();
	}
}
// B 비즈니스 규칙
function gets_free_shipping(cart) { // 비즈니스 요구 사항과 함수를 맞추기
	return calc_total(cart) >= 20;
}

const TAX_RATE = 0.10

function update_tax_dom(total) { // Action
	var cart_total_with_tax = calc_tax(total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}
// B
function calc_tax(amount, tax_rate) { // Calculation
	return amount * tax_rate
}

// C I B
function calc_total(cart) { // Calculation
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}

function set_cart_total_dom(total) {
	// ...
	total // 전역변수 읽는 부분
	// ...
}
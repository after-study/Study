// 1. 연습 문제: 전역변수를 읽는 부분을 인자로 바꾸기
// 2. 코드 다시 살펴보기: 사용하지 않는 shopping_cart_total을 제거하고 조금 과한 calc_cart_total() 함수를 병합

// 장바구니 제품과 금액 합계를 담고 있는 전역변수
var shopping_cart = [] // Action
var shopping_cart_total = 0; // Action

// function add_item_to_cart(name, price) { // Action 
// 	shpping_cart = add_item(shopping_cart, name, price)
// 	calc_cart_total(shopping_cart); 
// }

function add_item_to_cart(name, price) { // 2. 코드 다시 살펴보기
	shopping_cart = add_item(shopping_cart, name, price)
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}

function add_item(cart, name, price) { // Calculation
	var new_cart = cart.slice() // 복사본을 만듭니다
	new_cart.push({ 
		name: name,
		price: price
	});
	return new_cart
}

function update_shipping_icons(cart) { // 암묵적 입력과 출력 줄이기. 전역변수 대신 cart 인자 추가
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

function gets_free_shipping(cart) { // 비즈니스 요구 사항과 함수를 맞추기
	return calc_total(cart) >= 20;
}

const TAX_RATE = 0.10

function update_tax_dom(total) { // Action
	var cart_total_with_tax = calc_tax(total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}

function calc_tax(amount, tax_rate) { // Calculation
	return amount * tax_rate
}

// function calc_cart_total(cart) { // Action
// 	var total = calc_total(cart);
// 	set_cart_total_dom(total);
// 	update_shipping_icons(cart);
// 	update_tax_dom(total); 
//     shopping_cart_total = total
// }

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
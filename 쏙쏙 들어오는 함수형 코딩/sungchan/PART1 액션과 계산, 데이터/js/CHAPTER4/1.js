// 요구 사항
// 1. 무료 배송비 계산하기
// 2. 세금 계산하기
// 절차적인 방법으로 구현

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
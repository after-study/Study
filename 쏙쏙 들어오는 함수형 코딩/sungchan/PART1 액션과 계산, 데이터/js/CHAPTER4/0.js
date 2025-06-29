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
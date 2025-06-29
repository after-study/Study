// 1. 작은 함수와 많은 계산
// 액션 함수와 계산 함수 구분

var shopping_cart = [] 
var shopping_cart_total = 0; 
const TAX_RATE = 0.10

// 액션 함수들

function add_item_to_cart(name, price) {  
	shopping_cart = add_item(shopping_cart, make_cart_item(name, price))
	var total = calc_total(shopping_cart); 
	set_cart_total_dom(total);
	update_shipping_icons(shopping_cart);
	update_tax_dom(total); 
}

function update_shipping_icons(cart) { // 구매하기 버튼 관련 동작
	var buy_buttons = get_buy_buttons_dom(); 
	for(var i = 0; i < buy_buttons.length; i++) { 
		var button = buy_buttons[i]; 
		var item = button.item; 
		var overTwenty = gets_free_shipping_with_item(cart, item)
		set_free_shipping_icon(button, overTwenty)
	}
}

function set_free_shipping_icon(button, isShown) { // DOM 관련 동작
	if(isShown) 
		button.show_free_shipping_icon();
	else
		button.hide_free_shipping_icon();
}

function update_tax_dom(total) { 
	var cart_total_with_tax = calc_tax(total, TAX_RATE)
	set_tax_dom(cart_total_with_tax)
}

function calc_cart_total(cart) { 
    var total = cacl_total(cart)
	set_cart_total_dom(total);
	update_shipping_icons(cart);
	update_tax_dom(total); 
    shopping_cart_total = total
}

function set_cart_total_dom(total) { 
	// ...
	total // 전역변수 읽는 부분 -> total 인수 사용
	// ...
}

// 계산 함수들

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
function calc_tax(amount, tax_rate) { 
	return amount * tax_rate
}

// Business
function gets_free_shipping(cart) { 
	return cart_total(cart) >= 20;
}

// Cart, Item
function gets_free_shipping_with_item(cart, item) { 
	var new_cart = add_item(cart, item) 
	return gets_free_shipping(new_cart) 
}

// Cart, Item, Business
function calc_total(cart) { 
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}
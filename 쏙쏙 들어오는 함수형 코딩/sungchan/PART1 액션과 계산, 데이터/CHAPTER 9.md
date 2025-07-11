CHAPTER 9 계층형 설계 2

- 코드를 모듈화하기 위해 추상 벽을 만드는 법을 배웁니다.
- 좋은 인터페이스가 어떤 것이고, 어떻게 찾는지 배웁니다.
- 설계가 이만하면 되었다고 할 수 있는 시점을 압니다.
- 왜 계층형 설계가 유지보수와 테스트, 재사용에 도움이 되는지 이해합니다.

### 계층형 설계 패턴
- 앞장에서 봤던 중요한 네 가지 패턴
#### 패턴 1: 직접 구현
- [[직접 구현 패턴]]은 계층형 설계 구조를 만드는 데 도움이 됩니다.
- 직접 구현된 함수를 읽을 때, 함수 시그니처가 나타내고 있는 문제를 함수 본문에 적절한 구체화 수준에서 해결해야 합니다.
- 만약 너무 구체적이라면 코드에서 나는 냄새입니다.

#### 패턴 2: 추상화 벽
- 인터페이스를 사용하여 코드를 만들면 높은 차원으로 생각할 수 있습니다.
- 고수준의 추상화 단계만 생각하면 되기 때문에 두뇌 용량의 한계를 극복할 수 있습니다.

#### 패턴 3: 작은 인터페이스
- 시스템이 커질수록 비즈니스 개념을 나타내는 중요한 인터페이스는 작고 강력한 동작으로 구성하는 것이 좋습니다.

#### 패턴 4: 편리한 계층
- 계층형 설계 패턴과 실천 방법은 개발자의 요구를 만족시키면서 비즈니스 문제를 잘 풀 수 있어야 합니다.
- 소프트웨어를 더 빠르고 고품질로 제공하는 데 도움이 되는 계층에 시간을 투자해야 합니다.
- 코드와 그 코드가 속한 추상화 계층은 작업할 때 더 편리해야 합니다.

### 패턴 2: 추상화 벽`abstraction barrier`

### 추상화 벽으로 구현을 감춥니다
추상화 벽은 세부 구현을 감춘 함수로 이루어진 계층입니다.

![[Pasted image 20250711124023.png]](<img width="881" height="649" alt="Image" src="https://github.com/user-attachments/assets/84a2ed76-bc04-4e44-b42e-7ec5a553995c" />)

함수형 프로그래머는 문제를 높은 수준으로 생각하기 위해 추상화 벽을 효과적인 도구로 사용합니다.

### 세부적인 것을 감추는 것은 대칭적입니다
추상화 벽을 사용하면 마케팅팀이 세부 구현을 신경 쓰지 않아도 됩니다. 신경 쓰지 않아도 된다는 것은 대칭적입니다.
추상화 벽을 만든 개발 팀은 추상화 벽에 있는 함수를 사용하는 마케팅 관련 코드를 신경 쓰지 않아도 됩니다.
추상화 벽은 흔하게 사용하는 라이브러리나 API와 비슷합니다.
장바구니 데이터 구조를 변경해도 추상화 벽이 잘 동작한다면 마케팅팀 코드를 바꾸지 않아도 됩니다.

### 장바구니 데이터 구조 바꾸기
- 배열을 해시맵으로 변경하기
```js
function remove_item_by_name(cart, name) {
    var idx = indexOfItem(cart, name)
    if (idx !== null)
        return removeItems(cart, idx, 1);
    return cart;
}

function indexOfItem(cart, name) {
	for (var i = 0; i < cart.length; i++) { // <====== 해시맵에서 찾는 것이 빠릅니다.
        if (cart[i].name === name)
            return i;
    }
    return null
}
```

### 연습 문제
- 장바구니 데이터 구졸르 해시 맵으로 바꾸려면 어떤 함수를 고쳐야 할까요?
![[Pasted image 20250711124629.png]](<img width="854" height="301" alt="Image" src="https://github.com/user-attachments/assets/e6eee58c-a795-4ee4-8f4f-c145d11ac6b5" />)
- 추상화 벽에 있는 함수들을 고쳐야 합니다. 나머지 함수는 장바구니가 배열이라는 것을 모릅니다.

### 장바구니를 객체로 다시 만들기
```js
function add_item(cart, item) { 
	return add_element_last(cart, item)
}

function calc_total(cart) { // Calculation
	var total = 0;
	for(var i = 0; i < cart.length; i++) {
		var item = cart[i];
		total += item.price;
	}
	return total
}

function setPriceByName(cart, name, price) {
  var cartCopy = cart.slice();
  for (var i = 0; i < cartCopy.length; i++) {
    if (cartCopy[i].name === name)
      cartCopy[i] = setPrice(cartCopy[i], price);
  }
  return cartCopy;
}

function remove_item_by_name(cart, name) {
    var idx = indexOfItem(cart, name)
    if (idx !== null)
        return removeItems(cart, idx, 1);
    return cart;
}

function indexOfItem(cart, name) {
	for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name)
            return i;
    }
    return null
}

function isInCart(cart, name) {
	return indexOfItem(cart, name) !== null
}
```

```diff
function add_item(cart, item) { 
-	return add_element_last(cart, item)
+	return objectSet(cart, item.name, item)
}

function calc_total(cart) { // Calculation
	var total = 0;
+   var names = Object.keys(cart)
+   for(var i = 0; i < names.length; i++) {
-	for(var i = 0; i < cart.length; i++) {
+       var item = cart[names[i]];
-		var item = cart[i];
		total += item.price;
	}
	return total
}

function setPriceByName(cart, name, price) {
+	if(isInCart(cart, name)) {
+		var item = cart[name]
+		var copy = setPrice(item, price)
+		return objectSet(cart, name, copy)
+	}else{
+		var item = make_item(name, price)
+		return objectSet(cart, name, item)
+	}
-	var cartCopy = cart.slice();
-	for (var i = 0; i < cartCopy.length; i++) {
-	    if (cartCopy[i].name === name)
-		    cartCopy[i] = setPrice(cartCopy[i], price);
-	}
-	return cartCopy;
}

function remove_item_by_name(cart, name) {
+    return objectDelete(cart, name)
-    var idx = indexOfItem(cart, name)
-    if (idx !== null)
-      return removeItems(cart, idx, 1);
-    return cart;
}

-function indexOfItem(cart, name) {
-	for (var i = 0; i < cart.length; i++) {
-        if (cart[i].name === name)
-            return i;
-    }
-    return null
-}

function isInCart(cart, name) {
+   return cart.hasOwnProperty(name)
-	return indexOfItem(cart, name) !== null
}
```

### 추상화 벽이 있으면 구체적인 것을 신경 쓰지 않아도 됩니다.
데이터 구조를 변경하기 위해 함수 다섯 개만 바꿀 수 있었던 것은 바꾼 함수가 추상화 벽에 있는 함수이기 때문입니다. 추상화 벽은 필요하지 않은 것은 무시할 수 있도록 간접적인 단계를 만듭니다.

호출 그래프에서 점선(추상화 벽)을 가로지르는 화살표가 없다는 것이 중요합니다. 만약 점선을 가로지르는 화살표가 있다면 추상화 벽 규칙을 어기는 것입니다.

### 추상화 벽은 언제 사용하면 좋을까요?
#### 1. 쉽게 구현을 바꾸기 위해
프로토타이핑과 같이 최선의 구현을 확신할 수 없는 작업에 유용합니다.
다른 예로 서버에서 데이터를 받아야 하지만 임시 데이터를 사용하는 경우와 같이 바뀔 것을 알고 있지만 준비되지 않은 경우에도 좋습니다.

#### 2. 코드를 읽고 쓰기 쉽게 만들기 위해
때로는 구체적인 것이 버그를 만듭니다. 적절한 것을 감추면 숙련된 프로그래머가 아니더라도 더 생산적인 코드를 만들 수 있습니다.

#### 3. 팀 간에 조율해야 할 것을 줄이기 위헤
다른 팀에 이야기 하지 않고도 데이터 구조를 변경할 수 있습니다.

#### 4. 주어진 문제에 집중하기 위해
진정한 가치는 문제 해결 능력입니다. 추상화 벽을 사용하면 해결하려는 문제의 구체적인 부분을 무시할 수 있습니다.

### 패턴 2 리뷰: 추상화 벽
추상화 벽으로 추상화 벽 아래에 있는 코드와 위에 있는 코드의 의존성을 없앨 수 있습니다.
추상화 벽은 팀 간에 커뮤니케이션 비용을 줄이고, 복잡한 코드를 명확하게 하기 위해 전략적으로 사용해야 합니다.

### 앞에 고친 코드는 직접 구현에 더 가깝습니다
#### 첫  번째 패턴인 직접 구현을 다시 봅시다.
중요한 것은 코드가 적절한 구체화 수준과 일반화가 되어 있는지입니다. 일반적으로 한 줄짜리 코드는 여러 구체화 수준이 섞일 일이 없기 때문에 좋은 코드라는 표시입니다.

### 패턴 3: 작은 인터페이스
설계 감각을 키우기 위한 세 번째 패턴은 작은 인터페이스`minimal interface`입니다.
작은 인터페이스 패턴은 새로운 코드를 추가할 위치에 관한 것입니다. 인터페이스를 최소화하면 하위 계층에 불필요한 기능이 쓸데없이 커지는 것을 막을 수 있습니다.

#### 마케팅팀에서 시계를 할인하려고 합니다.
장바구니에 제품을 많이 담은 사람이 시계를 구입하면 10% 할인해 주려고 합니다.

#### 시계 할인 마케팅을 구현하기 위한 두 가지 방법
1. 추상화 벽에 구현하는 방법
2. 추상화 벽 위에 있는 계층에 구현하는 방법

##### 방법1: 추상화 벽에 만들기
추상화 벽 계층에 있으면 해시 맵 데이터 구조로 되어 있는 장바구니에 접근할 수 있습니다.
하지만 같은 계층에 있는 함수를 사용할 수 없습니다.
```js
function getsWatchDiscount(cart) {
	var total = 0
	var names = Object.keys(cart)
	for(var i = 0; i < names.length; i++) {
		var item = cart(names[i])
		total += item.price
	}
	return total > 100 & cart.hasOwnProperty("watch")
}
```

##### 방법2: 추상화 벽 위에 만들기
추상화 벽 위에 만들면 해시 데이터 구조를 직접 접근할 수 없습니다.
추상화 벽에 있는 함수를 사용해서 장바구니에 접급해야 합니다.
```js
function getsWatchDiscount(cart) {
	var total = calcTotal(cart)
	var hasWatch = isInCart("watch")
	return total > 100 && hasWatch
}
```

#### 추상화 벽 위에 있는 계층에 구현하는 것이 더 좋습니다.
시계 할인 마케팅 관련 코드는 두 번째 방법인 추상화 벽 위에 있는 계층에 만드는 것이 더 좋습니다.
그것이 더 직접 구현에 가깝습니다. 그리고 첫 번째 방법은 시스템 하위 코드가 늘어나기 때문에 좋지 않습니다.

첫 번째 방법은 마케팅을 위한 코드이지만 반복문 같은 구체적인 구현이 있습니다. 마케팅 팀에서 코드를 바꾸고 싶을 때 개발팀에 이야기해야 합니다

추상화 벽을 만드는 함수는 개발팀과 마케팅팀 사이에 계약이라고 할 수 있습니다.
추상화 벽에 새로운 함수가 생긴다면 계약이 늘어나는 것과 같습니다. 더 많은 코드를 이해하고 더 많이 신경 써야 합니다.

새로운 기능을 만들 때 하위 계층에 기능을 추가하거나 고치는 것보다 상위 계층에 만드는 것이 작은 인터페이스 패턴이라고 할 수 있습니다.

#### 마케팅팀은 장바구니에 제품을 담을 때 로그를 남기려고 합니다.
```js
logAddToCart(user_id, item)
```

`add_item()` 함수에서 호출하는 것을 제안했습니다.
```js
function add_item(cart, item) {
	logAddToCart(global_user_id, item)
	return objectSet(cart, item.name, item)
}
```

#### 코드 위치에 대한 설계 결정 
장바구니에 제품을 담을 때마다 로그를 남겨야 하므로 `add_item()`함수에서 로그를 남길 수 있습니다.
하지만, `add_item()`함수에서 로그를 남기기에는 복잡하고 어려운 문제가 있습니다.
`logAddToCart()`함수는 액션입니다. `add_item()`함수와 `add_item()`함수를 호출하는 모든 함수가 액션이 되면서 전체로 퍼집니다. 그렇게 하면 테스트하기 어려워집니다.

아래는 `add_item()`함수를 사용하는 코드입니다.
```js
function update_shipping_icons(cart) {
	var buttons = get_buy_buttons_dom()
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i]
		var item = button.item
		var new_cart = add_item(cart, item) // <-- 사용자가 장바구니에 제품을 추가하지 않아도 add_item()이 호출됩니다 // 여기서 호출을 남기고 싶지는 않습니다.
		if(gets_free_shipping(new_cart)) 
			button.show_free_shipping_icon()
		else
			button.hide_free_shipping_icon()
	}
}
```

`update_shipping_icons()`함수는 장바구니에 제품을 담는 행동을 하지 않아도 `add_item()`함수를 사용합니다. 사용자에게 제품이 표시될 때마다 불리게 됩니다.

위치를 결정하는 데 가장 중요한 요소는 장바구니에 관한 인터페이스를 깔끔하게 유지해야 하는 점입니다.

#### 장바구니 로그를 남길 더 좋은 위치
`logAddToCart()`함수는 액션이고 추상화 벽 위에 있어야 한다는 사실을 알았습니다.
그럼 어디에 위치해야 할까요?

여기서는 `add_item_to_cart()`함수가 로그를 남길 좋은 곳인 것 같습니다.
장바구니에 제품을 담을 때 호출하는 핸들러 함수입니다. 이 함수는 장바구니에 제품을 담는 의도를 정확히 반영하는 위치입니다. 그리고 이 함수는 이미 액션입니다.

```js
function add_item_to_cart(name, price) {
	var item = make_cart_item(name, price)
	shopping_cart = add_item(shopping_cart, item)
	var total = calc_total(shopping_cart)
	set_cart_total_dom(total)
	update_shipping_icons(shopping_cart)
	update_tax_dom(total)
	logAddToCart()
}
```

이 방법이 유일한 정답은 아니지만 우리가 하려는 설계에 잘 맞습니다.
작은 인터페이스 패턴을 사용하면 깨끗하고 단순하고 믿을 수 있는 인터페이스에 집중할 수 있습니다.

### 패턴 3 리뷰: 작은 인터페이스
추상화 벽에 만든 함수는 인터페이스라고 생각할 수 있습니다. 추상화 벽에 있는 인터페이스로 어떤 값의 집합에 접근하거나 값을 조작할 수 있습니다. 그리고 계층형 설계에서 완전한 추상화 벽과 최소한의 인터페이스 사이에 유연하게 조율해야 하는 점이 있다는 것을 알았습니다.

추상화 벽을 작게 만들어야 하는 이유
1. 추상화 벽에 코드가 많을수록 구현이 변경되었을 때 고쳐야 할 것이 많습니다.
2. 추상화 벽에 있는 코드는 낮은 수준의 코드이기 때문에 더 많은 버그가 있을 수 있습니다.
3. 낮은 수준의 코드를 이해하기 더 어렵습니다.
4. 추상화 벽에 코드가 많을 수록 팀 간 조율해야 할 것도 많아집니다.
5. 추상화 벽에 인터페이스가 많으면 알아야 할 것이 많아 사용하기 어렵습니다.

상위 계층에 어떤 함수를 만들 때 가능한 현재 계층에 있는 함수로 구현하는 것이 작은 인터페이스를 실천하는 방법입니다.
작은 인터페이스는 사실 모든 계층에서 쓸 수 있습니다.
호출 그래프 하위 계층에 작고 강력한 동작을 만들었을 때 수년간 소스 파일이 바뀌지 않고 많이 사용되는 이상적인 모습을 볼 수 있습니다.

### 패턴 4: 편리한 계층
앞서 알아본 세 개의 패턴은 계층을 구성하는 것에 관한 패턴입니다. 
편리한 계층 패턴은 다른 패턴과 다르게 조금 더 현실적이고 실용적인 측면을 다루고 있습니다.

편리한 계층 패턴은 언제 패턴을 적용하고 언제 멈춰야 하는지 실용적인 방법을 알려줍니다.
스스로 물어보고 작업하는 코드가 편리하다고 느낀다면 설계는 조금 멈춰도 됩니다.

하지만 구체적인 것을 너무 많이 알아야 하거나, 코드가 지저분하다고 느껴진다면 다시 패턴을 적용하세요.


### 계층형 설계 패턴
다시 살펴봅시다.
#### 패턴 1: 직접 구현
- [[직접 구현 패턴]]은 계층형 설계 구조를 만드는 데 도움이 됩니다.
- 직접 구현된 함수를 읽을 때, 함수 시그니처가 나타내고 있는 문제를 함수 본문에 적절한 구체화 수준에서 해결해야 합니다.
- 만약 너무 구체적이라면 코드에서 나는 냄새입니다.

#### 패턴 2: 추상화 벽
- 인터페이스를 사용하여 코드를 만들면 높은 차원으로 생각할 수 있습니다.
- 고수준의 추상화 단계만 생각하면 되기 때문에 두뇌 용량의 한계를 극복할 수 있습니다.

#### 패턴 3: 작은 인터페이스
- 시스템이 커질수록 비즈니스 개념을 나타내는 중요한 인터페이스는 작고 강력한 동작으로 구성하는 것이 좋습니다.

#### 패턴 4: 편리한 계층
- 계층형 설계 패턴과 실천 방법은 개발자의 요구를 만족시키면서 비즈니스 문제를 잘 풀 수 있어야 합니다.
- 소프트웨어를 더 빠르고 고품질로 제공하는 데 도움이 되는 계층에 시간을 투자해야 합니다.
- 코드와 그 코드가 속한 추상화 계층은 작업할 때 더 편리해야 합니다.

### 그래프로 알 수 있는 코드에 대한 정보는 무엇이 있을까요?
호출 그래프는 함수가 어떤 함수를 호출하는지 보여줍니다. 
호출 그래프에서 함수 이르을 없애면 구조에 대한 추상적인 모습을 볼 수 있습니다.

호출 그래프의 구조는 세 가지 중요한 비기능적 요구사항을 꾸밈없이 보여줍니다.
기능적 요구사항은 소프트웨어가 정확히 해야 하는 일을 말합니다.
비기능적 요구사항은 테스트를 어떻게 할 것인지, 재사용을 잘 할수 있는지, 유지보수하기 어렵지 않은지와 같은 요구사항들입니다.
비기능적 요구사항은 소프트웨어 설계를 하는 중요한 이유입니다. 이런 것은 보통 테스트성 또는 재사용성, 유지보수성과 같이 ~성(ility)이라고 부르기도 하비다.

### 그래프의 가장 위에 있는 코드가 고치기 가장 쉽습니다
높은 계층에 있을수록 코드를 쉽게 바꿀 수 있습니다. 가장 낮은 계층에 있는 함수는 상위 계층에 영향을 줍니다.
따라서 시간이 지나도 변하지 않는 코드는 가장 아래 계층에 있어야 합니다. 앞에서 본 것처럼 카피-온-라이트 함수는 가장 낮은 계층에 있습니다. 이런 함수는 잘 만들어 두면 바꿀 일이 없습니다.

### 아래에 있는 코드는 테스트가 중요합니다.
모든 것을 테스트할 수 없다면 장기적으로 좋은 결과를 얻기 위해 어떤 것을 테스트하는 것이 중요할까요?
아래에 있는 코드를 테스트하면 상위 계층의 함수들을 더 믿고 사용할 수 있습니다.

> 제대로 만들었다면 가장 아래에 있는 코드보다
> 가장 위에 있는 코드가 더 자주 바뀔 것입니다.

테스트도 효율적으로 해야합니다. 자주 바뀌는 코드보다 안정적인 코드를 테스트하는 것이 좋고 테스트 코드도 자주 고칠 필요가 없습니다.
패턴을 사용하면 테스트 가능성에 맞춰 코드를 계층화할 수 있습니다. 하위 계층으로 코드를 추출하거나 상위 계층에 함수를 만드는 일은 테스트의 가치를 결정합니다.

### 아래에 있는 코드가 재사용하기 더 좋습니다
낮은 계층으로 함수를 추출하면 재사용할 가능성이 많아지는 것을 봤습니다.

### 요약: 그래프가 코드에 대해 알려주는 것

#### 유지보수성
규칙: 위로 연결된 것이 적은 함수가 바꾸기 쉽습니다.
핵심: 자주 바뀌는 코드는 가능한 위쪽에 있어야 합니다.

#### 테스트 가능성
규칙: 위쪽으로 많이 연결된 함수를 테스트하는 것이 더 가치 있습니다.
핵심: 아래쪽에 있는 함수를 테스트하는 것이 위쪽에 있는 함수를 테스트하는 것보다 가치 있습니다.

#### 재사용성
규칙: 아래쪽에 함수가 적을수록 더 재사용하기 좋습니다.
핵심: 낮은 수준의 단계로 함수를 빼내면 재사용성이 더 높아집니다.

방금 정한 규칙은 어니언 아키텍처에 대해 [[CHAPTER 16]]에서 자세히 알아보겠습니다.

### 결론
계층형 설계는 바로 아래 계층에 있는 함수로 현재 계층의 함수를 구현해 코드를 구성하는 기술입니다.
비즈니스 요구를 해결하기 충분히 편리한 코드인지는 직관을 따라야 합니다. 그리고 어떤 코드를 테스트하는 것이 좋고, 변경하거나 재사용하기 쉬운 코드는 어떤 코드인지 계층 구조로 알아봤습니다.

### 요점 정리
- 추상화 벽을 패턴을 사용하면 세부적인 것을 완벽히 감출 수 있기 때문에 더 높은 차원에서 생각할 수 있습니다.
- 작은 인터페이스 패턴을 사용하면 완성된 인터페이스에 가깝게 계층을 만들 수 있습니다.
- 편리한 계층 패턴을 이용하면 다른 패턴을 요구 사항에 맞게 사용할 수 있습니다.
- 호출 그래프 구조에서 규칙을 얻을 수 있습니다. 이 규칙으로 테스트 가능성, 유비보수성, 재사용성이 좋은 코드는 어디에 있는 코드인지 알 수 있습니다.

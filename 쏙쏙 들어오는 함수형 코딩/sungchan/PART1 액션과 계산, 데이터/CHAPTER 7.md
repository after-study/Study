## CHAPTER 7 신뢰할 수 없는 코드를 쓰면서 불변성 지키기

- 레거시 코드나 신뢰할 수 없는 코드로부터 내 코드를 보호하기 위해 방어적 복사를 만듭니다.
- 얕은 복사와 깊은 복사를 비교합니다.
- 카피-온-라이트와 방어적 복사를 언제 사용하면 좋은지 알 수 있습니다.

### 레거시 코드와 불변성
레거시 코드에 쓸 수 있는 안전한 인터페이스 만들기
```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    black_friday_promotion(shopping_cart); // <-- 블랙 프라이데이 행사를 위한 코드
}
```

카피-온-라이트 원칙을 지키면서 안전하게 함수를 사용할 수 있는 "방어적 복사`defensive copy"`를 사용해 데이터를 바꾸는 코드와 데이터를 주고받아 봅시다.

### 우리가 만든 카피-온-라이트 코드는 신뢰할 수 없는 코드와 상호작용해야 합니다
- 레거시 코드와 안전지대(불변성이 지켜지는 코드가 있는)가 데이터를 주고 받을 때 문제가 발생합니다.
- 신뢰할 수 없는 코드가 계속 데이터 참조를 가지고 있기 때문에 언제든 바뀔 수 있습니다. 문제는 불변성을 지키면서 데이터를 주고받는 방법을 찾아야 한다는 것입니다.

### 방어적 복사는 원본이 바뀌는 것을 막아 줍니다.
- 신뢰할 수 없는 코드에서 안전지대로 들어올 때 복사본을 사용해 데이터를 보호할 수 있습니다.
- 안전지대에서 밖으로 나갈 때 복사본을 내보내 보호할 수 있습니다.

### 방어적 복사 구현하기
- 인자로 들어온 값이 변경될 수도 있는 함수를 사용하면서 불변성을 지켜야 합니다.
```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    black_friday_promotion(shopping_cart);
}
```
- 데이터를 전달하기전에 복사
```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    var cart_copy = deepCopy(shopping_cart)
    black_friday_promotion(cart_copy);
}
```
- 데이터를 전달하기 전후에 복사
```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    var cart_copy = deepCopy(shopping_cart)
    black_friday_promotion(cart_copy);
    shopping_cart = deepCopy(cart_copy)
}
```
- 이것이 방어적 복사의 패턴입니다. 복사본을 직접 만들어 데이터를 보호했습니다.

### 방어적 복사 규칙
- 규칙1: 데이터가 안전한 코드에서 나갈 때 복사하기
- 규칙2: 안전한 코드에서 변경될 수도 있는 데이터가 들어온다면 
	- 바로 깊은 복사본을 만들어 안전한 코드로 전달합니다.
	- 복사본을 안전한 코드에서 사용합니다.

### 신뢰할 수 없는 코드 감싸기
- 복사본을 만드는 이유에 대해 직관적으로 변경하고, 재사용할 수 있도록 함수를 분리
```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    var cart_copy = deepCopy(shopping_cart)
    black_friday_promotion(cart_copy);
    shopping_cart = deepCopy(cart_copy)
}
```

```js
function add_item_to_cart(name, price) {
    var item = make_cart_item(name, price);
    shopping_cart = add_item(shopping_cart, item);
    var total = calc_total(shopping_cart);
    set_cart_total_dom(total);
    update_shipping_icons(shopping_cart);
    update_tax_dom(total);
    shopping_cart = black_friday_promotion_safe(cart_copy)
}

function black_friday_promotion_safe(cart) {
	var cart_copy = deepCopy(cart)
    black_friday_promotion(cart_copy);
    return deepCopy(cart_copy)
}
```

### 연습 문제

```js
function payrollCalc(employees) {
	// ...
	return payrollChecks;
}

function payrollCalcSafe(employees) {
	var copy = deepCopy(employees)
	var payrollChecks = payrollCalc(copy)
	return deepCopy(payrollChecks)
}
```

연습 문제

```js
userChanges.subscribe(function(user) {
	//...
	processUser(user) // <-- 안전지대에 있는 함수
	//...
})

userChanges.subscribe(function(user) {
	var userCopy = deepCopy(user)
	processUser(userCopy) 
})

```
- 안전지대에서 데이터가 나가지 않기 때문에 복사할 필요가 없습니다.
### 방어적 복사가 익숙할 수도 있습니다

#### 웹 API속에 방어적 복사
대부분 웹 기반 API는 암묵적으로 방어적 복사를 합니다
> 모듈이 서로 통신하기 위해 방어적 복사를 구현했다면 "비공유 아키텍처`shared nothing architecture`"라고 합니다.
> 모듈이 어떤 데이터의 참조도 공유하고 있지 않기 때문입니다.

#### 얼랭과 엘릭서에서 방어적 복사
두 프로그래밍 언어에서 방어적 복사를 잘 구현했습니다.

### 쉬는 시간
- 같은 객체가 두 개 있다면 어떤 것이 진짜일까요?
	- 함수형 프로그래밍에서는 유일한 객체로 사용자를 표현하지 않습니다. 데이터는 이벤트에 대한 사실입니다.
	- 사실은 필요할 때마다 여러번 복사할 수 있습니다

- 카피-온-라이트와 방어적 복사 둘 다 필요할까요?
	- 불변성을 유지하는 것은 둘 다 있지만 비용의 차이가 있습니다.
	- 안전지대에서는 비용이 적게 드는 카피-온-라이트, 신뢰할 수 없는 데이터에 대해서는 방어적 복사를 하면 됩니다

### 카피-온-라이트와 방어적 복사를 비교해 봅시다
| 항목           | **카피-온-라이트**                                                | **방어적 복사**                                                                 |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| **언제 쓰나요?**  | 통제할 수 있는 데이터를 바꿀 때 씀                                        | 신뢰할 수 없는 코드와 데이터를 주고받아야 할 때 씀                                              |
| **어디서 쓰나요?** | 안전지대 어디서나 사용 가능카피-온-라이트가 불변성을 가진 안전지대를 만듦                   | 안전지대의 **경계**에서 데이터가 오고 갈 때 사용                                              |
| **복사 방식**    | 얕은 복사 (비용 적게 듦)                                             | 깊은 복사 (비용 많이 듦)                                                            |
| **규칙**       | 1. 바꿀 데이터의 얕은 복사를 만듭니다.<br>2. 복사본을 변경합니다.<br>3. 복사본을 리턴합니다. | 1. 안전지대로 **들어오는** 데이터에 깊은 복사를 만듭니다.<br>2. 안전지대에서 **나가는** 데이터에 깊은 복사를 만듭니다. |

### 깊은 복사는 얕은 복사보다 비쌉니다
얕은 복사는 원본가 복사본이 데이터를 공유합니다.
깊은 복사는 모든 것을 복사하기 때문에 비용이 많이 듭니다.

### 자바스크립트에서 깊은 복사를 구현하는 것은 어렵습니다
Lodash 라이브러리에 있는 깊은 복사 함수를 쓰는 것을 추천합니다. `.cloneDeeop()`

### 연습 문제
- 중첩된 데이터 구조에 모든 것을 복사합니다. -> DC
- 복사본과 원본 데이터 구조가 많은 부분을 공유하기 때문에 다른 방식보다 비용이 적게 듭니다.    -> SC
- 바뀐 부분만 복사합니다.    -> SC
- 공유하는 데이터 구조가 없기 때문에 신뢰할 수 없는 코드로부터 원본 데이터를 보호할 수 있습니다.    -> DC
- **비공유 아키텍처**(shared nothing architecture)를 구현하기 좋습니다. -> DC

### 카피-온-라이트와 방어적 복사의 대화
- 너 없이 살 수 없어!

### 연습 문제
- 깊은 복사를 합니다.     -> DC
- 다른 것보다 비용이 적게 듭니다.    -> CW
- 불변성을 유지하는 데 중요합니다.    -> DC CW
- 데이터를 바꾸기 전에 복사본을 만듭니다.    -> CW
- 안전지대 안에서 불변성을 유지하기 위해 씁니다. -> CW    
- 신뢰할 수 없는 코드와 데이터를 주고받을 때 씁니다.    -> DC
- 불변성을 위한 완전한 방법입니다. 다른 원칙이 없어도 쓸 수 있습니다.    -> DC
- 얕은 복사를 합니다.    -> CW
- 신뢰할 수 없는 코드로 데이터를 전달하기 전에 복사합니다.    -> DC
- 신뢰할 수 없는 코드로부터 데이터를 받을 때 복사합니다.-> DC

### 연습 문제
불변성을 유지할 수 있는 행동에 관한 문장을 찾고 그 이유를 써보세요.
- 레거시 코드와 데이터를 주고받을 때 방어적 복사를 씁니다.    
	- 맞습니다. 신뢰할 수 없는 코드와 데이터를 주고받을 때 원본의 변경을 방어하기 위함입니다.
- 레거시 코드와 데이터를 주고받을 때 카피-온-라이트 원칙을 씁니다.    
	- 아닙니다. 방어적 복사를 씁니다.
- 데이터를 바꾸는 부분이 있는지 확인하기 위해 레거시 코드를 읽고, 데이터를 바꾸는 부분이 없다면 특별한 원칙을 쓰지 않습니다.    
	- 맞습니다. 하지만 좀 더 방어적으로 하는게 안전하다고 생각됩니다. 레거시 코드를 누가 수정할 수 있으니까요
- 방어적 복사를 쓰지 않고 레거시 코드를 카피-온-라이트 방식으로 고칩니다.    
	- 맞습니다. 레거시 코드를 리팩토링하는 것은 제가 관심이 많아요
- 팀에 있는 코드이기 때문에 안전지대에 있다고 생각합니다.
	- 그럴리가요

### 결론 
- 방어적 복사는 불변성을 스스로 구현할 수 있기 때문에 더 강력합니다. 비용이 많이 듭니다. 카피-온-라이트와 함께 사용하면 효율적입니다.

### 요점 정리
- 방어적 복사는 불변성을 구현하는 원칙입니다.
- 비용이 더 듭니다.
- 신뢰할 수 없는 코드로 부터 데이터를 보호해 줍니다.
- 카피-온-라이트를 더 많이 사용하고, 신뢰할 수 없는 코드로 부터 방어적 복사를 사용합니다.
- 중첩된 데이터를 전체를 복사합니다.


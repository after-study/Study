CHAPTER 8 계층형 설계 1

- 계층형 설계를 이해
- 계층을 나누는 방법

계층형 설계는 바로 아래 계층의 함수로 지금 계층의 함수를 만드는 방법

### 소프트웨어 설계란 무엇입니까?
소프트웨어 설계가 잘 되어 있으면 아래 항목들에 대해 장점을 가집니다.
- 높은 가독성
- 테스트 용이
- 유지보수 쉬움
- 재사용성

### 계층형 설계란 무엇인가요?
계층형 설계는 바로 아래 계층의 함수로 지금 계층의 함수를 만드는 방법

- 계층 다이어그램 또는 호출 그래프
![호출그래프](<img width="759" height="319" alt="Image" src="https://github.com/user-attachments/assets/321a433f-e6a6-400b-acb9-bb51acf5f2dd" />)


### 설계 감각을 키우기
#### 계층형 설계 감각을 키우기 위한 입력

- 계층형 설계에 대한 단서 또는 길잡이

| 함수 본문             | 계층 구조    | 함수 시그니처 |
| ----------------- | -------- | ------- |
| - 길이              | - 화살표 길이 | - 함수명   |
| - 복잡성             | - 응집도    | - 인자 이름 |
| - 구체화 단계          | - 구체화 단계 | - 인잣값   |
| - 함수 호출           |          | - 리턴값   |
| - 프로그래밍 언어의 기능 사용 |          |         |
#### 계층형 설계 감각을 키우기 위한 출력

- 입력을 조합해 코드를 만드는 데 필요한 결정과 해야 할 일

| 조직화                  | 구현           | 변경                    |
| -------------------- | ------------ | --------------------- |
| - 새로운 함수를 어디에 놓을지 결정 | - 구현 바꾸기     | - 새 코드를 작성할 곳 선택하기    |
| - 함수를 다른 곳으로 이동      | - 함수 추출하기    | - 적절한 수준의 구체화 단계 결정하기 |
|                      | - 데이터 구조 바꾸기 |                       |


### 계층형 설계 패턴
- 중요한 네 가지 패턴
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

### 패턴 1: 직접 구현
>GPT:  소프트웨어 계층형 설계에서 **"직접 구현(Direct Implementation)"** 패턴은 **상위 계층에서 요구하는 기능을 하위 계층이 특별한 추상화 없이 직접 구현하는 방식**을 말합니다.

계층 구조는 아무리 강력한 기능을 하는 함수가 있더라도 복잡하지 않게 함수를 표현해야 합니다.
```js
function freeTieClip(cart) {
	var hasTie = false
	var hasTieClip = false

	for(var i = 0; i < cart.length; i++) {
		var item = cart[i]
		if(item.name === 'tie') // 넥타이 있는지 확인
			hasTie = true;
		if(item.name === 'tie clip') // 넥타이 클립이 있는지 확인
			hasTieClip = true;
	}
	if(hasTie && !hasTieClip) {
		var tieClip = make_item("tie clip", 0);
		return add_item(cart, tieClip); // 넥타이 클립 추가
	}
	return cart
}
```
어렵지 않지만 많은 기능이 있습니다. 이 코드는 제대로 설계하지 않고 그냥 기능을 추가한 것입니다.
이렇게 설계 원칙이 없이 코드를 추가하면 유지보수하기 어렵습니다.

이 코드는 직접 구현을 따르지 않고 있습니다. `freeTieClip()`함수가 알아야 할 필요가 없는 구체적인 내용을 담고 있습니다. 

#### 장바구니가 해야 할 동작

코드에 있는 지식으로 장바구니가 해야 할 동작을 정리해 보기로 했습니다.
- 제품 추가하기✅ `add_item()`
- 제품 삭제하기✅ `remove_item_by_name()`
- 장바구니에 제품이 있는지 확인하기 ❌
- 합계 계산하기✅ `calc_total()`
- 장바구니 비우기 ❌
- 제품 이름으로 가격 설정하기✅ `setPriceByName()`
- 세금 계산하기✅ `cartTax()`
- 무료 배송이 되는지 확인하기✅ `gets_free_shipping()`

#### 제품이 있는지 확인하는 함수가 있다면 설계를 개선할 수 있습니다.
제품이 있는지 확인하는 함수를 만들면 `freeClip()`을 더 명확하게 할 수 있을 것 같습니다.
아래 반복문은 장바구니에 넥타이와 넥타이 클립이 있는지 확인하고 있습니다.
```js
for(var i = 0; i < cart.length; i++) { 
	var item = cart[i]
	if(item.name === 'tie') // 넥타이 있는지 확인
		hasTie = true;
	if(item.name === 'tie clip') // 넥타이 클립이 있는지 확인
		hasTieClip = true;
}
```

장바구니 안에 제품이 있는지 확인하는 함수를 만들고 저수준의 반복문을 추출할 수 있습니다.
```js
function freeTieClip(cart) {
	var hasTie = isInCart(cart, 'tie')
	var hasTieClip = isInCart(cart, 'tie clip')

	if(hasTie && !hasTieClip) {
		var tieClip = make_item("tie clip", 0);
		return add_item(cart, tieClip); // 넥타이 클립 추가
	}
	return cart
}

function isInCart(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return true
	}
	return false
}
```
개선한 함수는 짧고 명확합니다. 또 모두 비슷한 구체화 수준에서 작동하고 있기 때문에 읽기 쉽습니다.

#### 호출 그래프를 만들어 함수 호출을 시각화하기
- 호출 그래프로 살펴보겠습니다.
![[Pasted image 20250709075236.png]](<img width="637" height="337" alt="Image" src="https://github.com/user-attachments/assets/c3e7ddbf-84b7-46b4-9b42-a79736ce6cf6" />)

- `make_item()` 함수와 `add_item()` 함수는 직접 만든 함수이고, `array_index()`와 `for loop`은 언어에서 제공하는 기능입니다. 추상화 수준이 다르므로 다이어그램으로 표현하면 아래와 같습니다.
![[Pasted image 20250709075340.png]](<img width="1418" height="496" alt="Image" src="https://github.com/user-attachments/assets/ca3183ed-e46a-4c27-a060-a5092e8d5d5e" />)

#### 직접 구현 패턴을 사용하면 비슷한 추상화 계층에 있는 함수를 호출합니다.
서로 다른 추상화 단계에 있는 기능을 사용하면 직접 구현 패턴이 아닙니다. 
개선된 `freeTieClip()` 함수를 호출 그래프로 그려봅시다.

![[Pasted image 20250709075835.png]](<img width="545" height="281" alt="Image" src="https://github.com/user-attachments/assets/8a12fc85-be38-473e-9b5d-a8370e77d2a3" />)

#### remove_item_by_name() 함수 그래프 그려보기
```js
function remove_item_by_name(cart, name) {
    var idx = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name)
            idx = i;
    }
    if (idx !== null)
        return removeItems(cart, idx, 1);
    return cart;
}
```
![[Pasted image 20250710104414.png]](<img width="427" height="229" alt="Image" src="https://github.com/user-attachments/assets/fd5f9f86-a5c0-4d43-acb1-e89a623397fc" />)

`freeTieClip()`함수 그래프 옆에 붙여 전체 그래프를 확장해 봅시다. `remove_item_by_name()`함수는 어느 계층에 붙여야 할까요?
![[Pasted image 20250710104638.png]](<img width="833" height="347" alt="Image" src="https://github.com/user-attachments/assets/e929aad0-5760-47ab-b9fb-824470d4a5f5" />)

- 가장 높은 곳에 새로운 계층
- 가장 높은 계층
- 사이에 새로운 계층
- 가장 낮은 계층
- 가장 낮은 곳에 새로운 계층

1. `freeTieClip()` 함수는 마케팅 캠페인에 관한 이름입니다. 
2. `remove_item_by_name()` 함수 이름은 마케팅과 관련이 없고 `freeTieClip()`보다 일반적인 동작에 관한 이름입니다.
3. `remove_item_by_name()` 함수는 마케팅 캠페인을 하는 함수나 사용자 인터페이스와 같은 다른 함수에서 호출할 수 있습니다
4. 따라서 화살표가 아래쪽을 향해야 한다는 규칙을 지키기 위해 `remove_item_by_name()` 함수는 가장 높은 계층 보다 아래에 있어야 합니다.
5. 가장 낮은 계층에 있는 함수 이름을 보면 장바구니와 제품을 다루는 함수 이름입니다. `remove_item_by_name()` 함수도 장바구니를 다루기 때문에 괜찮은 위치인 것 같습니다.
6. 가장 낮은 계층에서 `remove_item_by_name()` 함수를 호출할 일은 없기 때문에 가장 낮은 곳 아래 새로운 계층을 만드는 후보는 지워도 됩니다.
![[Pasted image 20250710202929.png]](<img width="769" height="306" alt="Image" src="https://github.com/user-attachments/assets/0535f381-86f6-41b0-9a32-8771172dd014" />)
7. 사이에 새로운 계층은 지워도 될지 확실하지 않습니다.
8. 가장 낮은 계층에 있는 함수가 어떤 함수나 언어 기능을 호출하는지 봅시다.
![[Pasted image 20250710205742.png]](<img width="781" height="408" alt="Image" src="https://github.com/user-attachments/assets/d7bce9e1-1083-4bd0-bab7-767e7b12e5cf" />)
9. `isInCart()`함수와 `remove_item_by_name()`함수는 모두 같은 박스를 가리키고 있습니다.
10. 같은 박스를 가리킨다는 것은 같은 계층에 있어도 좋다는 정보입니다.
11. 지금은 `remove_item_by_name()`함수를 `isInCart()`와 `make_item()`, `add_item()`함수가 있는 가장 낮은 계층에 놓는 것이 좋을 것 같습니다.

### 연습 문제
아직 그래프에 추가하지 않은 함수도 호출 그래프를 그려 적절한 위치에 추가해 보세요.
```js
function calc_total(cart) {
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    total += item.price;
  }
  return total;
}

function gets_free_shipping(cart) {
  return calc_total(cart) >= 20;
}

function setPriceByName(cart, name, price) {
  var cartCopy = cart.slice();
  for (var i = 0; i < cartCopy.length; i++) {
    if (cartCopy[i].name === name)
      cartCopy[i] = setPrice(cartCopy[i], price);
  }
  return cartCopy;
}

function cartTax(cart) {
  return calc_tax(calc_total(cart));
}
```
![[Pasted image 20250710210206.png]](<img width="618" height="271" alt="Image" src="https://github.com/user-attachments/assets/4afdf884-fbd0-4649-9724-80eff3aa52d7" />)

![[Pasted image 20250710210221.png]](<img width="866" height="595" alt="Image" src="https://github.com/user-attachments/assets/f6188cbc-e6a7-4b38-8855-f4264061a869" />)

#### 같은 계층에 있는 함수는 같은 목적을 가져야 합니다.
다이어그램은 명확하고 모호한 것이 없는 여섯 개의 계층으로 되어있습니다. 
각 계층의 목적을 그래프에 표시해 봅시다.
![[Pasted image 20250710210404.png]](<img width="860" height="415" alt="Image" src="https://github.com/user-attachments/assets/41387398-52a9-44bc-966c-ed0019861e0e" />)

각 계층은 추상화 수준이 달라서 어떤 계층에 있는 함수를 읽거나 고칠 때 낮은 수준의 구체적인 내용은 신경 쓰지 않아도 됩니다.
다이어그램은 코드를 높은 차원에서 볼 수 있는 좋은 도구 입니다.

### 3단계 줌 레벨
계층형 설계에서 문제는 세 가지 다른 영역에서 찾을 수 있습니다.
1. 계층 사이의 상호 관계
2. 특정 계층의 구현
3. 특정 함수의 구현
문제를 찾기 위해 알맞은 줌 레벨을 사용해 하나의 영역을 살펴 볼 수 있습니다.
#### 1. 전역 줌 레벨
- 전역 줌 레벨로 전체 중 필요한 부분을 살펴볼 수 있습니다. 계층 사이의 상호 관계를 포함해 모든 문제 영역을 살펴볼 수 있습니다.
#### 2. 계층 줌 레벨
- 계층 줌 레벨은 한 계층과 연결된 바로 아래 계층을 볼 수 있는 줌 레벨입니다.
- 계층이 어떻게 구현되어 있는지 알 수 있습니다.
#### 3. 함수 줌 레벨
- 함수 하나와 바로 아래 연결된 함수들을 볼 수 있습니다.

#### 계층 줌 레벨로 보면 함수가 가리키는 화살표를 계층간에 비교할 수 있습니다.
장바구니 기본 동작 계층을 계층 줌 레벨로 살펴 봅시다.
![[Pasted image 20250710211000.png]](<img width="804" height="305" alt="Image" src="https://github.com/user-attachments/assets/416cf7fd-8527-4d6b-b626-641b39e627eb" />)

직접 구현 패턴을 사용하면 모든 화살표가 같은 길이를 가져야 합니다. 하지만, 위 다이어그램을 보면 어떤 화살표는 한 계층 길이를 가지고 있고, 어떤 화살표는 세 계층 길이를 가지고 있습니다.
이렇게 다양한 계층을 넘나드는 것은 같은 구체화 수준이 아니라는 증거입니다.

#### 함수 줌 레벨을 사용하면 함수 하나가 가진 화살표를 비교할 수 있습니다.
`remove_item_by_name()`함수를 확대해 봅시다.
![[Pasted image 20250710211217.png]](<img width="799" height="241" alt="Image" src="https://github.com/user-attachments/assets/9d381eaf-0a12-4ba0-9f17-51328520cacd" />)

다른 두 계층에 있는 동작을 사용하는 것은 직접 구현 패턴에 맞지 않습니다. 직접 구현 패턴을 적용하면 `remove_item_by_name()`가 모두 같은 길이의 화살표를 가져야 합니다.
가장 일반적인 방법은 중간에 함수를 두고 언어 기능을 사용하는 긴 화살를 줄여야 합니다.
`removeItems()`함수와 같은 계층에 반복문과 배열 인덱스 참조를 담당하는 함수를 만들면 모든 화살표 길이가 같아질 것입니다.
![[Pasted image 20250711072724.png]](<img width="859" height="243" alt="Image" src="https://github.com/user-attachments/assets/dfeba766-99e2-4820-b1bc-a990fefeda82" />)

### 반복문 빼내기
`remove_item_by_name()` 함수에서 반복문을 빼서 새로운 함수로 만들어 봅시다.
```js
function remove_item_by_name(cart, name) {
    var idx = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].name === name)
            idx = i;
    }
    if (idx !== null)
        return removeItems(cart, idx, 1);
    return cart;
}
```

```js
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
```
- 호출 그래프
![[Pasted image 20250711074638.png]](<img width="898" height="248" alt="Image" src="https://github.com/user-attachments/assets/8755cf6a-cddc-4a38-a421-b28359b67976" />)

엄밀히 말하면 `indexOfItem()` 함수가 `removeItems()`함수보다 조금 더 위에 위치합니다.
`indexOfItem()`함수는 배열에 있는 항목이 `name` 속성을 가지고 있다는 것을 알아야합니다.
하지만 `removeItems()`함수는 배열에 들어있는 항목이 어떻게 생겼는지 몰라도 됩니다.
그래서 `removeItems()`함수는  `indexOfItem()`함수보다 더 일반적이고 `indexOfItem()`함수보다 조금 더 낮은 계층에 있습니다. [[CHAPTER 10]]에서 반복문을 더 일반적으로 처리하는 방법을 알아보겠습니다.

### 연습 문제
`isInCart()`함수와 `indexOfItem()`함수에서 비슷한 부분을 함께 쓸 수 있을까요?
```js
function isInCart(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return true
	}
	return false
}

function indexOfItem(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return i
	}
	return null
}
```

`indexOfItem()`함수가 `isInCart()`함수보다 더 낮은 수준의 함수입니다. `indexOfItem()`함수는 인덱스를 리턴하기 때문에 사용하는 곳에서 장바구니가 배열이라는 것을 알아야 합니다. 반면 `isInCart()`함수는 불리언값을 리턴하기 때문에 사용하는 곳에서 장바구니가 어떤 구조인지 몰라도 됩니다.
`indexOfItem()` 함수가 `isInCart()`함수보다 더 낮은 수준에 있기 때문에 `indexOfItem()`함수를 사용해 `isInCart()`함수를 만들 수 있습니다.
```js
function isInCart(cart, name) {
	return indexOfItem(cart, name) !== null
}

function indexOfItem(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return i
	}
	return null
}
```

![[Pasted image 20250711075832.png]](<img width="790" height="236" alt="Image" src="https://github.com/user-attachments/assets/cc620866-651b-40b4-8ed9-e9ee314bc356" />)
재사용으로 코드가 더 짧아지고 계층도 명확해지는 장점을 모두 얻었습니다.

### 연습 문제
`setPriceByName()`함수와 `indexOfItem()`함수에는 비슷한 반복문이 있습니다.
```js
function setPriceByName(cart, name, price) {
  var cartCopy = cart.slice();
  for (var i = 0; i < cartCopy.length; i++) {
    if (cartCopy[i].name === name)
      cartCopy[i] = setPrice(cartCopy[i], price);
  }
  return cartCopy;
}

function indexOfItem(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return i
	}
	return null
}
```
한쪽 함수를 다른 쪽함수를 사용해서 구현해 보고 함수와 반복문, 배열 인덱스의 참조 관계를 다이어그램으로 그려보세요.

```js
function setPriceByName(cart, name, price) {
	var cartCopy = cart.slice();
	var i = indexOfItem(cart, name)
	if(i !== null)
      cartCopy[i] = setPrice(cartCopy[i], price);
    
    return cartCopy;
}

function indexOfItem(cart, name) {
	for(var i = 0; i < cart.length; i++) {
		if(cart[i].name === name)
			return i
	}
	return null
}
```

![[Pasted image 20250711080201.png]](<img width="828" height="245" alt="Image" src="https://github.com/user-attachments/assets/0cb64aa3-c306-4c43-9ce0-b6585ec3ad06" />)
반복문을 없앴기 때문에 코드가 더 좋아졌습니다. 하지만 그래프는 더 좋아진 것 같지 않습니다.
함수가 가리키는 화살표의 길이를 비교하는 것은 복잡성을 측정하는 좋은 방법이지만, 이 경우는 크게 도움이 되지 않습니다.
대신 긴 화살표를 하나 없애 설계를 개선한 것에 초점을 맞춰 봅시다. 화살표 길이를 줄이는 것에 집중하면 더 좋은 계층 구조를 만들 수 있습니다.

### 연습 문제
6장 `arraySet()`함수는 `setPriceByName()`함수와 비슷한 점이 있습니다. `arraySet()`함수를 이용해 `setPriceByName()`함수를 다시 만들 수 있을까요?
```js
function setPriceByName(cart, name, price) {
	var cartCopy = cart.slice();
	var i = indexOfItem(cart, name)
	if(i !== null)
      cartCopy[i] = setPrice(cartCopy[i], price);
    
    return cartCopy;
}

function arraySet(array, idx, value) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}
```

```js
function setPriceByName(cart, name, price) {
	var i = indexOfItem(cart, name)
	if(i !== null)
      return arraySet(cart, i, setPrice(cartCopy[i], price))
    
    return cart;
}

function arraySet(array, idx, value) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}
```

![[Pasted image 20250711081256.png]](<img width="824" height="258" alt="Image" src="https://github.com/user-attachments/assets/b379016d-8079-4cec-9333-d59c6d56f292" />)

계층이 하나 늘었지만 화살표 길이가 더 짧아졌습니다. 지금은 화살표 수보다 길이를 줄이고 있다는 것을 기억하세요.
하지만 개선한 함수도 직접 구현 패턴을 적용한 것 같지 않습니다. 여전히 낮은 수준의 배열 인덱스를 참조하는 동작을 그대로 쓰고 있습니다. 이런 느낌이 중요합니다. 일단 지금은 그대로 두고 다음 장에서 추상화 벽 패턴을 적용해 더 명확한 코드를 만들어 보겠습니다. [[[CHAPTER 10]] 에서 직접 구현을 위한 더 좋을 기술을 알려드리겠습니다.

### 직접 구현 패턴 리뷰
#### 직접 구현한 코드는 한 단계의 구체화 수준에 관한 문제만 해결합니다.
코드의 구체화 단계가 서로 다르면 이해하기 어렵습니다. 직접 구현하면 코드를 읽기 위해 알아야 하는 구체화 단계의 범위를 줄일 수 있습니다.

#### 계층형 설계는 특정 구체화 단계에 집중할 수 있게 도와줍니다.
구체화 수준에 집중하다 보면 설계 감각을 키울 수 있습니다.

#### 호출 그래프는 구체화 단계에 대한 풍부한 단서를 보여줍니다.
함수 시그니처와 본문, 호출 그래프와 같은 다양한 단서를 가지고 직접 코드 패턴을 적용할 수 있습니다.

#### 일반적인 함수가 많을수록 재사용하기 좋습니다.
'중복 코드'를 찾기 위해가 아니라 구현을 명확하기 위해 일반적인 함수를 빼내는 것입니다. 일반적인 함수는 구체적인 함수보다 더 많은 곳에서 쓸 수 있습니다.

#### 복잡성을 감추지 않습니다.
계층형 설계에서 모든 계층은 바로 아래 계층에 의존해야 합니다. 더 낮은 구체화 수준을 가진 일반적인 함수를 만들어 소프트웨어에 직접 구현 패턴을 적용해야 합니다.

### 결론
호출 그래프를 그려 코드를 시각화 하고 계층형 설계에서 가장 중요한 패턴인 직접 구현 패턴을 알아봤습니다.

### 요점 정리
• 계층형 설계는 코드를 추상화 계층으로 구성합니다. 각 계층을 볼 때 다른 계층에 구체적인 내용을 몰라도 됩니다.
- 계층형 설계로 다른 계층에 구체적인 내용을 몰라도 되도록 코드를 추상화 계층으로 구성합니다.
• 문제 해결을 위한 함수를 구현할 때 어떤 구체화 단계로 쓸지 결정하는 것이 중요합니다. 그래야 함수가 어떤 계층에 속할지 알 수 있습니다.
- 함수를 구현할 때 어떤 계층에 속할지는 어떤 구체화 단계로 사용할지 결정에 따릅니다.
• 함수가 어떤 계층에 속할지 알려주는 요소는 많이 있습니다. 함수 이름과 본문, 호출 그래프 등이 그런 요소입니다.
• 함수 이름은 의도를 알려줍니다. 비슷한 목적의 이름을 가진 함수를 함께 묶을 수 있습니다.
• 함수 본문은 중요한 세부 사항을 알려줍니다. 함수 본문은 함수가 어떤 계층 구조에 있어야 하는지 알려줍니다.
• 호출 그래프로 구현이 직접적이지 않다는 것을 알 수 있습니다. 함수를 호출하는 화살표가 다양한 길이를 가지고 있다면 직접 구현되어 있지 않다는 신호입니다.
• 직접 구현 패턴은 함수를 명확하고 아름답게 구현해 계층을 구성할 수 있도록 알려줍니다.

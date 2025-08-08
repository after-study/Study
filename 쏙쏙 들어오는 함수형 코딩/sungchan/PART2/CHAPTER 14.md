## CHAPTER 14 중첩된 데이터에 함수형 도구 사용하기

- 해시 맵에 저장된 값을 다루기 위한 고차 함수
- 중첩 데이터를 고차 함수로 쉽게 다루는 방법
- 재귀를 이해하고 안전하게 재귀를 사용하는 방법
- 깊이 중첩된 엔티티에 추상화 벽을 적용해서 얻을 수 있는 장점

### 객체를 다루기 위한 고차 함수
중첩된 장바구니 제품 객체에 값을 바꾸기
객체를 다룰 수 있는 고차 함수가 필요

### 필드명을 명시적으로 만들기

원래 냄새가 나던 코드
```js
function incrementQuantity(item) {
    var quantity = item['quantity'];
    var newQuantity = quantity + 1;
    var newItem = objectSet(item, 'quantity', newQuantity);
    return newItem;
}
```

인자로 바꾼 코드
```js
function incrementField(item, field) {
    var value = item[field];
    var newValue = value + 1;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}
```

리팩터링 이후 중복이 많이 없어졌지만 비슷한 동작이 생겼습니다.

중복된 코드들
```js
function incrementField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    var value = item[field];
    var newValue = value + 1;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}

function decrementField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    var value = item[field];
    var newValue = value - 1;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}

function doubleField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    var value = item[field];
    var newValue = value * 2;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}

function halveField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    var value = item[field];
    var newValue = value / 2;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}
```
암묵적 인자를 드러내기 리팩터링을 적용할 수 있습니다.

### update() 도출하기
동시에 두 가지 리팩터링을 해야 합니다. 
함수 이름에 있는 암묵적인 인자는 암묵적 인자를 드러내기 리팩터링을 해야합니다.
그런데 명시적으로 바꿔야 할 인자가 일반값이 아니고 동작입니다. 따라서 함수 본문을 콜백으로 바꾸기 리팩터링으로 동작을 함수 인자로 받도록 해야 합니다.

```js
function incrementField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    return updateField(item, field, function(value) {
	    return value + 1
	})
}

function updateField(item, field, modify) {
	var value = item[field];
    var newValue = modify(value);
    var newItem = objectSet(item, field, newValue);
    return newItem;
}
```
이제 바꾸고 싶은 필드와 동작을 콜백으로 전달 할 수 있습니다. 

일반적인 이름 `update()`라고 바꿉시다.
```js
function update(object, key, modify) {
	var value = object[field];
    var newValue = modify(value);
    var newObject = objectSet(object, key, newValue);
    return newObject;
}
```
`update()`는 객체에 있는 값을 바꿉니다. 바꿀 객체와 바꾸려는 키, 바꾸는 동작을 함수로 넘기면 됩니다. `objectSet()`함수를 사용하기 때문에 카피-온-라이트 원칙을 따릅니다.

### 값을 바꾸기 위해 update() 사용하기
직원 데이터가 있고 직원의 월급 10%를 올려주려고 합니다.
```js
var employee = {
	name: "KIM",
	salary: 120000
}

function raise10Percent(salary) {
	return salary * 1.1
}
```

`update()`함수를 사용하면 다음과 같이 호출하면 됩니다.
```js
update(employee, 'salary', raise10percent)
```

`update()`는 `raise10Percent()`를 직원 객체에 사용할 수 있도록 해줍니다. 특정 값을 다루는 동작을 받아 특정키가 있는 해시 맵에 적용합니다. 이것은 중첩된 문맥 안에 있는 값에 함수를 적용하는 것으로 볼 수 있습니다.

### 리팩터링: 조회하고 변경하고 설정하는 것을 update()로 교체하기
이제 두 리팩터링은 한 번에 할 수 있습니다. 암묵적 인자를 드러내기 + 함수 본문을 콜백으로 바꾸기

리팩터링 전
```JavaScript
function incrementField(item, field) { // 동작 이름이 함수 이름에 있습니다.
    var value = item[field];
    var newValue = value + 1;
    var newItem = objectSet(item, field, newValue);
    return newItem;
}
```
리팩터링 후
```js
function incrementField(item, field) { 
    return update(item, field, function(value) {
	    return value + 1
	})
}
```

위 코드의 동작은 세 단계입니다.
1. 객체에서 값을 조회
2. 값을 바꾸기
3. 객체에 값을 설정(카피-온-라이트)

이 동작을 같은 키에 대해 하고 있다면 `update()` 하나로 바꿀 수 있습니다. 객체, 바꿀 키, 바꾸는 계산을 전달하면 됩니다.
#### 조회하고 변경하고 설정하는 것을 update()로 교채하기 단계
이 리팩터링은 두 단계입니다.
1. 조회하고 바꾸고 설정하는 것을 찾기
2. 바꾸는 동작을 콜백으로 전달해서 `update()`로 교체

##### 단계1: 조회하고 바꾸고 설정하는 것 찾기
```js
function halveField(item, field) { 
    var value = item[field]; // 설정
    var newValue = value / 2; // 바꾸기
    var newItem = objectSet(item, field, newValue); // 설정
    return newItem;
}
```

##### 단계2: update()로 교체합니다.
```js
function halveField(item, field) { 
    return update(item, field, function(value) {
	    return value / 2; // 바꾸는 동작 콜백으로 전달
    })
}
```

> 조회하고 변경하고 설정하는 것을 `update()`로 교체하기 리팩터링은 중첩된 객체에 적용하기 좋습니다.

### 함수형 도구: update()
`update()`는 객체를 다루고 있는 함수형 도구입니다.  조금 더 자세히 알아 봅시다.
```js
function update(object, key, modify) {
	var value = object[field];
    var newValue = modify(value);
    var newObject = objectSet(object, key, newValue);
    return newObject;
}

function incrementField(item, field) { 
    return update(item, field, function(value) {
	    return value + 1
	})
}
```

### 객체에 있는 값을 시각화하기
#### 단계1: 키를 가지고 객체에서 값을 조회
#### 단계2: 현재 값으로 modify()를 불러 새로운 값을 생성
#### 단계3: 복사본을 생성

### 중첩된 update 시각화하기
이 함수는 중첩된 options 객체를 다루고 있습니다.
```js
function incrementSize(item) {
	var options = item.options; // 키를 가지고 객체에서 값을 조회
	var size = options.size; // 키를 가지고 객체에서 값을 조회
	var newSize = size + 1; // 새로운 값 생성
	var newOptions = objectSet(options, 'size', newSize); // 복사본 생성
	var newItem = objectSet(item, 'options', newOptions); // 복사본 생성
	return newItem;
}
```

### 중첩된 데이터에 update() 사용하기
조회하고 변경하고 설정하는 것을 `update()`로 교체하기`replace get, modify, set with update` 리팩터링을 하려고 합니다.

리팩터링한 코드
```js
function incrementSize(item) {
	var options = item.options
	var newOptions = update(options, 'size', increment);
	var newItem = objectSet(item, 'options', newOptions);
	return newItem;
}
```

한 번 더 리팩터링
```js
function incrementSize(item) {
	return update(item, 'options', function(options) {
		return update(options, 'size', increment)
	})
}
```
중첩된 객체에 중첩된 update를 사용할 수 있다는 중요한 사실을 알았습니다.

### updateOption() 도출하기
`update()` 안에서 `update()`를 호출하는 코드를 일반화해서 `updateOption()`을 만들 수 있습니다.
```js
function incrementSize(item) {
	return update(item, 'options', function(options) {
		return update(options, 'size', increment) // 함수 이름에 있는 암묵적 인자를 본문에서 두 번이나 쓰고 있습니다!
	})
}
```
암묵적 options 인자 -> 명시적 option 인자
```js
function incrementOption(item, option) {
	return update(item, 'options', function(options) {
		return update(options, option, increment) 
	})
}
```
암묵적 modify 인자 -> 명시적 modify 인자
```js
function updateOption(item, option, modify) {
	return update(item, 'options', function(options) {
		return update(options, option, modify) 
	})
}
```
이 함수는 제품(객체)과 옵션 이름, 옵션을 바꾸는 하수를 받습니다.

같은 냄새가 또 생겼습니다. 암묵적 인자가 함수 이름에 있는 `'options'` 입니다.

### update2() 도출하기
한 번 더 리팩터링 하면 일반적인 함수인 `update2()`를 도출할 수 잇습니다.
```js
function updateOption(item, option, modify) {
	return update(item, 'options', function(options) {
		return update(options, option, modify) 
	})
}
```
숫자 2는 두 번 중첩을 의미. 인자 이름도 일반적으로 변경
```js
function update2(object, key1, key2, modify) { 
	return update(object, key1, function(value1) {
		return update(vlaue1, key2, modify) 
	})
}
```

두 단계로 중첩된 어떤 객체에도 쓸 수 있는 함수가 되었습니다. 그래서 함수를 쓸 때 두개의 키가 필요합니다.
```js
function incrementSize(item) {
	return update2(item, 'options', 'size', function(size) {
		return size + 1
	})
}
```

`update2()`는 조금 추상적이기 때문에 다음 페이지에서 시각화해 봅시다.

### 중첩된 객체에 쓸 수 있는 update2() 시각화하기

### incrementSizeByName()을 만드는 네 가지 방법 (3중첩)
#### 옵션1: update()와 incrementSize()로 만들기

#### 옵션2: update()와 update2()로 만들기

#### 옵션3: update()로 만들기

#### 옵션4: 조회하고 바꾸고 설정하는 것을 직접 만들기

### update3() 도출하기
옵션2 코드를 가지고 시작해 봅시다.
```js
function incrementSizeByName(cart, name) {
	return update(cart, name, function(item) {
		return update2(item, 'options', 'size', function(size) { // 암묵적 인자 options, size
			return size + 1
		})	
	})
}
```

리팩터링 코드
```js
function incrementSizeByName(cart, name) {
	return update3(cart, name, 'option', 'size', function(size) {
		return size + 1
	})
}

function update3(object, key1, key2, key3, modify) {
	return update(object, key1, function(object2) {
		return update2(object2, key2, key3, modify)	
	})
}
```

### nestedUpdate() 도출하기
`update4()`, `update5()`를  만들어보면 패턴이 있다는 것을 알 수 있습니다.
중첩된 개수에 상관없이 쓸 수 있는 `nestedUpdate()`를 만들어 봅시다.

```js
function update3(object, key1, key2, key3, modify) { // 3
	return update(object, key1, function(object2) {
		return update2(object2, key2, key3, modify)	// 3 - 1
	})
}

function update2(object, key1, key2, modify) { // 2
	return update(object, key1, function(value1) {
		return update(vlaue1, key2, modify) // 2 - 1
	})
}
```
`update1()`은 어떻게 생겼을까요?
```js
// update0 문제
function update1(object, key1, modify) { // 1
	return update(object, key1, function(value1) {
		return update0(vlaue1, modify) // 1 - 1
	})
}
```
`update0()`은 사용하는 키가 없고 X-1이 -1이 되기 때문에 경로 길이를 표현할 수 없습니다.

> 기억나지 않는 `update()` 함수 다시보기
```js
function update(object, key, modify) {
	var value = object[field];
    var newValue = modify(value);
    var newObject = objectSet(object, key, newValue);
    return newObject;
}
```

직관적으로 `update0()`은 중첩되지 않은 객체를 의미한다는 것을 알 수 있습니다. 그냥 변경만 하는 함수입니다.
```js
function update0(value, modify) {
	return modify(value)
}
```

이제 함수 이름에 있는 암묵적 인자`implicit argument in function name`를 드러내봅시다.

`update3()`을 봅시다.
```js
function update3(object, key1, key2, key3, modify) { 
	return update(object, key1, function(object2) {
		return update2(object2, key2, key3, modify)	
	})
}
```
깊이`depth`라는 인자를 추가해 봅시다.
```js
function updateX(object, depth, key1, key2, key3, modify) {
	return update(object, key1, function(value1) {
		return updateX(value1, depth - 1, key2, key3, modify)	
	})
}
```
인자를 명시적으로 만들었지만 깊이와 키 개수를 맞춰야 합니다.
키의 개수와 순서가 중요한 단서 입니다.
```js
function updateX(object, keys, modify) {
	var key1 = keys[0]
	var restOfKeys = drop_first(keys)
	return update(object, key1, function(value1) {
		return updateX(value1, restOfKeys, modify)	
	})
}
```
이제 `update0()`을 빼면 나머지는 모두 `updateX()`로 바꿀 수 있습니다.

`update0()`에서는 key가 없습니다. 어떻게 처리해야 할까요?
```js
function updateX(object, keys, modify) {
	if(keys.length === 0) return modify(object) // 재귀 없이 처리
	
	var key1 = keys[0]
	var restOfKeys = drop_first(keys)
	return update(object, key1, function(value1) {
		return updateX(value1, restOfKeys, modify)	// 재귀 호출
	})
}
```
키 길이에 상관없이 쓸 수 있는 `updateX()`가 생겼습니다. 일반적으로 `nestedUpdate()`라고 부릅니다.
```js
// 이름만 바꿈
function nestedUpdate(object, keys, modify) {
	if(keys.length === 0) return modify(object) // 종료 조건(경로 길이가 0일 때)
	
	var key1 = keys[0]
	var restOfKeys = drop_first(keys) // 항목을 하나씩 없앰
	return update(object, key1, function(value1) {
		return updateX(value1, restOfKeys, modify)	// 재귀 호출
	})
}
```

### 안전한 재귀 사용법

#### 1. 종료 조건
종료 조건은 재귀가 멈춰야 하는 곳에 있어야 합니다.
#### 2. 재귀 호출

#### 3. 종료 조건에 다가가기
재귀 함수에서 최소 하나 이상의 인자가 점점 줄어들어야 합니다. 그래야 종료 조건에 가까워 질 수 있습니다.

### nestedUpdate() 시각화하기
책 참고
### 재귀 함수가 적합한 이유
배열을 반복하는 것과 재귀 함수는 다릅니다. 중첩된 데이터를 다루기 때문입니다.
중첩된 조회, 바꾸기, 설정은, 중첩된 데이터 구조를 그대로 반영합니다. 재귀나 호출 스택을 사용하지 않고 중첩된 데이터를 다루기는 어렵습니다.

### 연습 문제
```js
function incrementSizeByName(cart, name) {
	return nestedUpdate(cart, [name, 'options', 'size'], function(size) { 
		return size + 1
	})
} 
```

### 깊이 중첩된 구조를 설계할 때 생각할 점
키 경로가 길면 중간 객체가 어떤 키를 가졌는지 기억하기 어렵습니다.
9장에서 배웠던 직접 구현으로 해결할 수 있습니다. 추상화 벽`abstraction barrier`을 사용하면 도움이 됩니다. 구체적인 것을 몰라도 됩니다.

### 깊이 중첩된 데이터에 추상화 벽 사용하기
추상화 벽을 통해 알아야 할 데이터 구조를 줄일 수 있습니다.

주어진 ID로 블로그를 변경하는 함수
```js
function updatePostById(category, id, modifyPost) { // modifyPost: 분류에 있는 블로그 글이 어떤 구조인지 몰라도 함수를 쓸 수 있습니다.
	return nestedUpdate(category, ['posts', id], modifyPost) // ['posts', id]: 분류의 구조 같은 구체적인 부분은 추상화 벽 뒤로 숨김
}
```

이제 글쓴이를 수정하는 함수를 만들어 봅시다.
```js
function updateAuthor(post, modifyUser) { // 블로그 글 안에 글쓴이가 어떤 구조로 저장되어 있는지 몰라도 함수를 쓸 수 있습니다.
	return update(post, 'author', modifyUser)
}
```

사용자 이름을 대문자로 바꾸는 함수
```js
function capitalizeName(user) {
	return update(user, 'name', capitalize)
}
```

이제 모두 함쳐봅시다.
category > post > author > name
```js
updatePostById(blogCategory, '12', function(post) {
	return updateAuthor(post, capitalizeUserName)
})
```

두 가지가 좋아졌습니다.
1. 기억해야 할 것이 네 가지에서 세 가지로 줄었습니다.
2. 동작의 이름이 있으므로 각각의 동작을 기억하기 쉽다는 점입니다.
이제 어떤 키에 들어있는지 기억하지 않아도 됩니다.

### 앞에서 배운 고차 함수들
앞서 사용했던 고차 함수를 정리해 보면서 얼마나 유용했는지 알아봅시다.
#### 배열을 반복할 때 for 반복문 대신 사용하기
`forEach()`, `map()`, `filter()`, `reduce()`

#### 중첩된 데이터를 효율적으로 다루기
`update()`와 `nestedUpdate()`고차 함수로 중첩 단계에 상관없이 특정한 값을 바꿀 수 있습니다.

#### 카피-온-라이트 원칙 적용하기
`withArrayCopy()`, `withObjectCopy()`

#### try/catch 로깅 규칙을 코드화
`wrapLogging()`

### 결론
중첩된 데이터를 다루기 위해 리팩터링을 적용했습니다. 재귀를 사용했습니다.

### 요점 정리
- `update()` 일반적인 패턴을 구현한 함수형 도구입니다.
- `nestedUpdate()`는 깊이 중첩된 데이터를 다루는 함수형 도구입니다.
- 중첩된 데이터를 다룰 때는 재귀가 더 쉽고 명확합니다.
- 재귀는 스스로 불렀던 곳이 어디인지 유지하기 위해 스택을 사용합니다.
- 깊이 중첩된 데이터는 데이터 구조와 어떤 경로에 어떤 키가 있는지 기억해야 합니다.
- 많은 키를 가지고 있는 깊이 중첩된 구조에 추상화 벽을 사용하면 알아야 할 것이 줄어 듭니다.


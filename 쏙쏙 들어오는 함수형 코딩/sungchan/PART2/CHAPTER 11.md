## CHAPTER 11 일급 함수 2

### 코드 냄새 하나와 리팩터링 두 개
일급 값과 고차 함수는 파트2에서 계속 쓰기 때문에 다시 한번 정리 해봅시다.
1. 코드의 냄새: 함수 이름에 있는 암묵적 인자
	- 특징
		- 거의 똑같이 구현된 함수가 있다
		- 함수 이름이 구현에 있는 다른 부분을 가리킨다
2. 리팩터링: 암묵적 인자를 드러내기 리팩터링
	- 단계
		1. 함수 이름에 있는 암묵적 인자를 확인합니다
		2. 명시적인 인자를 추가합니다
		3. 함수 본문에 하드 코딩된 값을 새로운 인자로 바꿉니다
		4. 함수를 호출하는 곳을 고칩니다
3. 리팩터링: 함수 본문을 콜백으로 바꾸기 리팩터링
	- 단계
		1. 함수 본문에서 바꿀 부분의 앞부분과 뒷부분을 확인합니다
		2. 리팩터링 할 코드를 함수로 빼냅니다
		3. 빼낸 함수의 인자로 넘길 부분을 또 다른 함수로 빼냅니다

### 카피-온-라이트 리팩터링하기
- 앞부분: 복사본 만들기
- 본문: 복사본 변경
- 뒷부분: 복사본 리턴

### 배열에 대한 카피-온-라이트 리팩터링
- 앞부분과 뒷부분이 중복인 카피-온-라이트 함수들

```JavaScript
function arraySet(array, idx, value) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}

function push(array, elem) {
	var copy = array.slice()
	copy.push(elem) 
	return copy
}

function drop_first(array) {
	var copy = array.slice()
	copy.shift() 
	return copy
}

function drop_last(array) {
	var copy = array.slice()
	copy.pop()
	return copy
}
```

- arraySet으로 시작해봅시다
```js
function arraySet(array, idx, value) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}
```

- 함수 빼내기
```js
function arraySet(array, idx, value) {
	return withArrayCopy(array)
}

function withArrayCopy(array) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}
```

- 본문을 콜백으로 바꾸기
```js
function arraySet(array, idx, value) {
	return withArrayCopy(array, function(copy) {
		copy[idx] = value;
	})
}

function withArrayCopy(array, modify) {
	var copy = array.slice()
	modify(copy)
	return copy;
}
```


- 리팩터링 전과 후
```js
// 전
function arraySet(array, idx, value) {
	var copy = array.slice()
	copy[idx] = value;
	return copy;
}

// 후
function arraySet(array, idx, value) {
	return withArrayCopy(array, function(copy) {
		copy[idx] = value;
	})
}

function withArrayCopy(array, modify) {
	var copy = array.slice()
	modify(copy)
	return copy;
}
```

배열에 쓸 수 있는 카피-온-라이트 원칙을 코드로 만들었고 이제 똑같은 코드를 여기저기 만들지 않아도 됩니다. 카피-온-라이트 원칙에 대한 코드를 한 곳에서 관리할 수 있습니다.
또 다른 장점은 `withArrayCopy()`함수는 기본 연산뿐만 아니라 배열을 바꾸는 어떠한 동작에도 쓸 수 있습니다.
```js
// 엄청나게 빠른 정렬 라이브러리를 카피-온-라이트 원칙을 유지하면서 적용
var sortedArray = withArrayCopy(array, function(copy) {
	SuperSorter.sort(copy)
})
```

```js
// 중간 복사본을 생성
var a1 = drop_first(array)
var a2 = push(a1, 10)
var a3 = push(a2, 11)
var a4 = arraySet(a3, 0, 42)

// 본사본을 하나만 생성
var a4 = withArrayCopy(array, function(copy) {
	copy.shift()
	copy.push(10)
	copy.push(11)
	copy[0] = 42
})
```

### 연습 문제
객체 버전
```js
function objectSet(object, key, value) {
	var copy = Object.assign({}, object)
	copy[key] = value
	return copy
}

function objectDelete(object, key) {
	var copy = Object.assign({}, object)
	delete copy[key]
	return copy
}
```
- 정답
```js
function withObjectCopy(object, modify) {
	var copy = Object.assign({}, object)
	modify(copy)
	return copy
}

function objectSet(object, key, value) {
	return withObjectCopy(copy) {
		copy[key] = value
	}
}

function objectDelete(object, key) {
	return withObjectCopy(copy) {
		delete copy[key]
	}
}
```

### 연습 문제
`tryCatch(sendEmail, logToSnapErrors)`
```js
try {
	sendEmail()
} catch(error) {
	logToSnapErrors(error)
}
```

```js
function tryCatch(f, errorHandler) {
	try {
		return f()
	} catch(error) {
		return errorHandler(error)
	}
}
```

### 연습 문제
함수 본문을 콜백으로 바꾸기
```js
if(array.length === 0) {
	console.log("Array is empty")
}

if(hasItem(cart, "shoes")) {
	return setPriceByName(cart, "shoes", 0)
}
```

```js
when(array.length === 0, function() {
	console.log("Array is empty")
})

when(hasItem(cart, "shoes"), function() {
	return setPriceByName(cart, "shoes", 0)
})
```
- 정답
```js
function when(test, then) {
	if(test) {
		return then()
	}
}
```

### 연습 문제
`IF`로 바꾸고 `else`추가
```js
IF(array.length === 0, function() {
	console.log("Array is empty")
}, function() {
	console.log("Array has something in it.")
})

IF(hasItem(cart, "shoes"), function() {
	return setPriceByName(cart, "shoes", 0)
}, function() {
	return cart
})
```

```js
function IF(test, then, ELSE) {
	if(test) {
		return then()
	}else{
		return ELSE()
	}
}
```


### 함수를 리턴하는 함수
- 고차 함수를 사용해 일일이 `try-catch`작업하지 않도록 수정
```js
saveUserData(user) // 원래 코드

// 슈퍼 파워가 생긴 코드
try {
	saveUserData(user)
} catch(error) {
	logToSnapErrors(error)
}
```


```js
function withLogging(f) {
	try {
		f()
	} catch(error) {
		logToSnapErrors(error)
	}
}

withLogging(function() {
	saveUserData(user)
})
```

문제
1. 어떤 부분에 로그를 남기는 것을 깜빡할 수 있음
2. 모든 코드에 수동으로 `withLogging()` 함수를 적용해야 함

```js
try {
	saveUserDataNoLogging(user) // 명확하게 이름을 바꿈
} catch(error) {
	logToSnapErrors(error)
}

function saveUserDataWithLogging(user) { // 함수가 남을 것이라 예상 가능
	try {
		saveUserDataNoLogging(user) 
	} catch(error) {
		logToSnapErrors(error) // 중복 여전히 있음
	}
}
```

```js
// 함수를 인자로 받고
function wrapLogging(f) {
	return function(arg) { // 함수를 리턴 합니다.
		try {
			f(arg)
		} catch (error) {
			logToSnapErrors(error)
		}
	}
} 

// 로그를 남기지 않는 함수를 변환하기 위해 wrapLogging() 함수를 부릅니다.
var saveUserDataWithLogging = wrapLogging(saveUserDataNoLogging)
```

비교 전 후
```js
// 전
try {
	saveUserData(user)
} catch(error) {
	logToSnapErrors(error)
}

// 후
saveUserDataWithLogging(user)
```

아래 함수를 사용해 `saveUserData()` 함수를 `saveUserDataWithLogging()`로 만들 수 있었습니다.
```js
function wrapLogging(f) {
	return function(arg) { 
		try {
			f(arg)
		} catch (error) {
			logToSnapErrors(error)
		}
	}
} 
```


### 연습 문제
에러 발생시 null 리턴
```js
try {
	codeThatMightThrow()
} catch(e) {
	// 에러 무시
}
```

```js
function wrapIgnoreErrors(f) {
	return function(...args) {
		try {
			return f(...args)
		} catch(error) {
			return null
		}
	}
}
```

### 연습 문제

```js
var increment = makeAdder(1)

> increment(10)
11

var plus10 = makeAdder(10)

> plus10(12)
22
```

```js
function makeAdder(a) {
	return function (b) {
		return a + b
	}
}
```

### 결론
배운 것
- 일급 값
- 일급 함수
- 고차 함수
### 요점 정리
- 고차 함수로 패턴이나 원칙을 코드로 만들 수 있습니다.
- 고차 함수로 함수를 리턴하는 함수를 만들 수 있습니다.
- 고차 함수를 사용하면서 잃는 것은 가독성입니다.

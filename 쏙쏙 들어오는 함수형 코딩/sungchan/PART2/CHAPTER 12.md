## CHAPTER 12 함수형 반복
> map(), filter(), reduce() 에 대해 배웁니다.

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

### MegaMart 커뮤니케이션팀
커뮤니케이션팀이 만들어지면서 요구사항이 들어오기 시작했습니다.
#### 데이터 요청: 쿠폰 이메일 처리
3장에서 나왔던 코드
```js
function emailsForCustomers(customers, goods, bests) {
  var emails = [];
  for (var i = 0; i < customers.length; i++) {
    var customer = customers[i];
    var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  }
  return emails;
}
```

forEach() 함수로 리팩터링
```js
function emailsForCustomers(customers, goods, bests) {
  var emails = [];
  forEach(customers, function(customer) {
	  var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  })
  return emails;
}
```

### 예제를 통해 map() 함수 도출하기
- 예제: 앞부분(초기화), 본문(처리), 뒷부분(결과 저장) 구조로 구성되어 있습니다.
```js
function emailsForCustomers(customers, goods, bests) {
  var emails = [];
  forEach(customers, function(customer) {
    var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  });
  return emails;
}

function biggestPurchasePerCustomer(customers) {
  var purchases = [];
  forEach(customers, function(customer) {
    var purchase = biggestPurchase(customer);
    purchases.push(purchase);
  });
  return purchases;
}

function customerFullNames(customers) {
  var fullNames = [];
  forEach(customers, function(customer) {
    var name = customer.firstName + ' ' + customer.lastName;
    fullNames.push(name);
  });
  return fullNames;
}

function customerCities(customers) {
  var cities = [];
  forEach(customers, function(customer) {
    var city = customer.address.city;
    cities.push(city);
  });
  return cities;
}

```
- 함수 본문을 `map()`의 콜백으로 바꾸기
```js
// 원래 코드
function emailsForCustomers(customers, goods, bests) {
  var emails = [];
  forEach(customers, function(customer) {
    var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  });
  return emails;
}

// 콜백으로 바꾼버전
function emailsForCustomers(customers, goods, bests) {
  return map(customers, function(customer) { // 본문을 콜백으로 전달
	  return emailForCustomer(customer, goods, bests)
  })
}

function map(array, f) {
	var newArray = []
	forEach(array, function(element) {
		newArray.push(f(element))
	})
	return newArray
}
```

### 함수형  도구: map()
```js
function map(array, f) { // 배열과 함수를 인자로 받습니다.
	var newArray = [] // 빈 배열을 만듭니다.
	forEach(array, function(element) { 
		newArray.push(f(element)) // 원래 배열 항목으로 새로운 항목을 만들기 위해 f()함수를 부릅니다.
	})
	return newArray // 새로운 배열 리턴합니다.
}
```

타입 검사를 하지 않으므로 `customer`가 넘어오는 것이 보장되지 않습니다. 배열에 고객정보가 있을 것이라 생각해야 합니다.
```js
function emailsForCustomers(customers, goods, bests) {
  return map(customers, function(customer) { // customer가 넘어올 것이라고 확신할 수 있나요?
	  return emailForCustomer(customer, goods, bests)
  })
}
```
사용하는 곳에서 바로 정의해서 인라인으로 익명함수를 사용합니다. 함수를 정의할 때 인자의 이름을 통해 인자가 무엇인지 알 수 있습니다.

### 함수를 전달하는 세 가지 방법
#### 전역으로 정의하기
- 어디서나 쓸 수 있습니다.
#### 지역적으로 정의하기
- 지역 범위 안에서 정의하고 이름을 붙일 수 있습니다. 지역적으로 쓸 수 있습니다.
#### 인라인으로 정의하기
- 함수를 사용하는 곳 바로 정의할 수 있습니다. 이름이 없어서 익명 함수라고 부릅니다.

### 예제: 모든 고객의 이메일 주소

```js
map(customers, function(customer) {
	return customer.email
})
```

### 연습 문제
고객 배열 `customers`
필요 데이터 `customers.firstName`, `customer.lastName`, `customer.address`

```js
map(customers, function(customer) {
	return {
		firstName: customer.firstName,
		lastName: customer.lastName,
		address: customer.address,
	}
})
```

#### 데이터 요청: 우수 고객 목록
`map()`과 비슷하지만 조건문이 필요합니다.
`filter()`를 사용하면 되는군요!

### 예제를 통해 filter()함수 도출하기
- 앞부분, 본문(if문 검사), 뒷부분으로 구성되어 있습니다.
```js
function selectBestCustomers(customers) {
  var newArray = [];
  forEach(customers, function(customer) {
    if (customer.purchases.length >= 3)
      newArray.push(customer);
  });
  return newArray;
}

function selectCustomersAfter(customers, date) {
  var newArray = [];
  forEach(customers, function(customer) {
    if (customer.signupDate > date)
      newArray.push(customer);
  });
  return newArray;
}

function selectCustomersBefore(customers, date) {
  var newArray = [];
  forEach(customers, function(customer) {
    if (customer.signupDate < date)
      newArray.push(customer);
  });
  return newArray;
}

function singlePurchaseCustomers(customers) {
  var newArray = [];
  forEach(customers, function(customer) {
    if (customer.purchases.length === 1)
      newArray.push(customer);
  });
  return newArray;
}
```
- 그 중 하나의 예제를 콜백 함수로 바꿔보기
```js
// 원래 코드
function selectBestCustomers(customers) {
  var newArray = [];
  forEach(customers, function(customer) {
    if (customer.purchases.length >= 3)
      newArray.push(customer);
  });
  return newArray;
}

// 콜백 함수로 바꾼 버전
function selectBestCustomers(customers) {
	return filter(customers, function(customer) {
		return customer.purchases.length >= 3
	})
}

function filter(array, f) {
	var newArray = []
	forEach(array, function(element) {
		if(f(element)) {
			newArray.push(element)
		}
	})
	return newArray
}
```

### 함수형 도구: filter()
- `filter()`는 배열에서 일부 항목을 선택하는 함수로 볼 수 있습니다.
```js
function filter(array, f) { // 배열과 함수를 받습니다.
	var newArray = [] // 빈 배열을 만듭니다.
	forEach(array, function(element) {
		if(f(element)) { // f를 호출해 항목을 결과 배열에 넣을지 확인합니다.
			newArray.push(element) // 조건에 맞으면 원래 항목을 결과 배열에 넣습니다.
		}
	})
	return newArray // 결과 배열을 리턴합니다.
}
```

### 예제: 아무것도 구입하지 않은 고객
- 고객이 아무것도 구입하지 않았다면 `return true`
```js
filter(customers, function(customer) {
	return customer.purchases.length === 0
})
```

#### 주의하세요!
`map()`을 사용할 때 배열에 `null`이 있는 경우도 있습니다. `filter()`를 사용하면 `null`을 쉽게 없앨 수 있습니다.

### 연습 문제
고객 아이디가 3으로 나누어떨어지는 고객을 테스트 그룹으로 만들기
- 전체 고객 배열 `customers`
- 아이디 `customer.id`
- 나머지 연산자 `%`, `x % 3 === 0` 이라면  3으로 나누어떨어지는 값입니다.

```js
var testGroup = filter(customers, function(customer) {
	return customer.id % 3 === 0
})

var nonTestGroup = filter(customers, function(customer) {
	return customer.id % 3 !== 0
})
```

#### 데이터 요청: 모든 고객의 전체 구매수
`reduce()`로 누적하는 방법

### 예제를 통해 reduce() 도출하기
- 앞부분, 본문(합치는 동작), 뒷부분으로 구성되어있습니다.
```js
function countAllPurchases(customers) {
  var total = 0;
  forEach(customers, function(customer) {
    total = total + customer.purchases.length;
  });
  return total;
}

function concatenateArrays(arrays) {
  var result = [];
  forEach(arrays, function(array) {
    result = result.concat(array);
  });
  return result;
}

function customersPerCity(customers) {
  var cities = {};
  forEach(customers, function(customer) {
    cities[customer.address.city] += 1;
  });
  return cities;
}

function biggestPurchase(purchases) {
  var biggest = { total: 0 };
  forEach(purchases, function(purchase) {
    biggest = biggest.total > purchase.total ? biggest : purchase;
  });
  return biggest;
}
```

```js
// 원래 코드
function countAllPurchases(customers) {
  var total = 0;
  forEach(customers, function(customer) {
    total = total + customer.purchases.length;
  });
  return total;
}

// 콜백으로 바꾼 버전
function countAllPurchases(customers) {
  return reduce(
    customers, 0, function(total, customer) {
      return total + customer.purchases.length;
    }
  );
}

function reduce(array, init, f) {
  var accum = init;
  forEach(array, function(element) {
    accum = f(accum, element);
  });
  return accum;
}
```


### 함수형 도구: reduce()
```js
function reduce(array, init, f) { // 배열과 초깃값, 누적함수를 받습니다.
  var accum = init; // 누적된 값을 초기화 합니다.
  forEach(array, function(element) {
    accum = f(accum, element); // 누적 값을 계산하기 위해 현자 값과 배열 항목으로 f() 함수를 부릅니다.
  });
  return accum; // 누적된 값을 리턴합니다.
}
```

### 예제: 문자열 합치기
- 문자열 배열로 부터 모든 문자열을 하나로 합친 문자열이 필요
- 함수: 누적된 문자열과 배열에 있는 현재 문자열을 받아서 합치는 함수
```js
reduce(strings, "", function(accum, string) {
	return accum + string
})
```

#### 주의하세요!
1. 인자의 순서 `reduce()`에는 3개, 전달하는 함수에는 2개
2. 초깃값을 결정하는 방법.
	1. 계산이 어떤 값에서 시작되는가?
	2. 배열이 비어있다면 어떤 값을 리턴할 것인가?

### 연습 문제
```js
// 배열에 모든 수를 더하기
function sum(numbers) {
	return reduce(numbers, 0, function(total, num) {
		return total + num
	})
}

// 배열에 모든 수를 곱하기
function product(numbers) {
	return reduce(numbers, 1, function(total, num) {
		return total + num
	})
}
```

### 연습 문제
숫자배열에서 가장 큰 값과 가장 작은 값을 찾는 함수 만들기
주어진 것
- 자바스크립트에서 가장 큰 숫자인 Number.MAX_VALUE
- 자바스크립트에서 가장 작은 숫자인 Number.MIN_VALUE
```js
function min(numbers) {
	return reduce(numbers, Number.MAX_VALUE, function(m, n) {
		if(m < n) return m
		else return n
	})
}

function max(numbers) {
	return reduce(numbers, Number.MIN_VALUE, function(m, n) {
		if(m > n) return m
		else return n
	})
}
```

### reduce()로 할 수 있는 것들
#### 실행 취소/실행 복귀
리스트 형태의 사용자 입력에 `reduce()`를 적용한 것이 현재 상태라고 생각해 보면, 실행 취소는 리스트의 마지막 사용자 입력을 없애는 것이라고 할 수 있습니다.

#### 테스트할 때 사용자 입력을 다시 실행하기
시스템의 처음 상태가 초깃값이고 사용자 입력이 순서대로 리스트에 있을 때 `reduce()`로 모든 값을 합쳐 현재 상태를 만들 수 있습니다.

#### 시간 여행 디버깅
뭔가 잘못 동작하는 경우 특정 시점 상태의 값을 보관할 수 있습니다. 그리고 문제를 고치고 새로운 코드로 다시 실행해 볼 수 있습니다. 마술처럼 보이지만 `reduce()`를 통해 할 수 있습니다.

#### 회계 감사 추적
특정 시점에 시스템 상태를 알고 싳은 경우가 있습니다. 법무팀에서 12월 31일에 무슨 일이 있었는지 물어볼 수도 있습니다. `reduce()`로 과거에 어떤 일이 있었는지 기록할 수 있습니다. 어떤 일이 있었는지 뿐만 아니라 어떤 과정을 통해 일이 생겼는지도 알 수 있습니다.

### 연습 문제
`reduce()`로 `map()`과 `filter()` 만들기

### 세 가지 하수형 도구를 비교하기

### 결론
함수형 프로그래밍은 잘 동작하는 작은 추상화 함수로 되어있습니다. 만들기 쉽고, 유용한 함수이고, 일반적인 반복 패턴으로 쉽게 도출할 수 있다는 것도 알아봤습니다.

### 요점 정리
- `map()`, `filter()`, `reduce()`를 알아봤습니다.
- 세 함수는 반복문을 대체해서 코드의 목적을 더 명확하게 할 수 있습니다.



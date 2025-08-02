## CHAPTER 13 함수형 도구 체이닝
> 복잡한 쿼리로 데이터를 조회하기 위해 함수형 도구를 조합하는 방법을 배웁니다.
> 복잡한 반복문을 함수형 도구 체인으로 바꾸는 방법을 이해합니다.
> 데이터 변환 파이프라인을 만들어 작업을 수행하는 방법을 배웁니다.

### 고객 커뮤니케이션팀은 계속 일하고 있습니다

#### 데이터 요청: 우수 고객들의 가장 비싼 구매
단계들을 조합해 하나의 쿼리로 만들기. 여러 단계를 조합하는 것을 체이닝`chainning`이라고 합니다.

우수 고객 -> 각 우수 고객의 가장 비싼 구매
filter -> map

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    }); // 1단계

    var biggestPurchases = map(bestCustomers, function(customer) {
        return reduce(customer.purchases, { total: 0 }, function(biggestSoFar, purchase) { // 각 고객의 가장 비싼 구매를 찾아야 하기 때문에 reduce()는 map()의 콜백 안에 있습니다.
            if (biggestSoFar.total > purchase.total)
                return biggestSoFar; // 가장 비싼 구매를 찾기 위해 reduce()를 사용
            else
                return purchase;
        });
    }); // 2단계

    return biggestPurchases;
}
```

잘 동작하지만 콜백이 여러 개 중첩되어 함수가 너무 커졌습니다. 코드를 더 깨끗하게 만들 방법이 많이 있으므로 여기서 멈추지 말고 개선해 봅시다.

중첩된 콜백은 읽기 어렵습니다.

지난 장에 만들었던 `max()`하수와 앞에서 만든 `reduce()` 단계를 비교해 봅시다.

##### 가장 비싼 구매 찾기
```js
reduce(customer.purchases,
  { total: 0 },
  function (biggestSoFar, purchase) {
    if (biggestSoFar.total > purchase.total)
      return biggestSoFar;
    else
      return purchase;
  });
```
##### 가장 큰 수 찾기
```js
reduce(numbers,
  Number.MIN_VALUE,
  function (m, n) {
    if (m > n)
      return m;
    else
      return n;
  });
```
가장 비싼 구매를 찾는 코드는 `total` 값을 비교하고, `max()` 함수는 값을 직접 비교한다는 점이 다릅니다.

total 값을 가져오는 부분을 콜백으로 분리해 봅시다.
```js
reduce(customer.purchases, { total: 0 }, function(biggestSoFar, purchase) { 
	if (biggestSoFar.total > purchase.total)
		return biggestSoFar; 
	else
		return purchase;
})
```
콜백으로 분리
```js
maxKey(customer.purchase, {total: 0}, function(purchase) {
	return purchase.total
})

function maxKey(array, init, f) {
	return reduce(array, init, function(biggestSoFar, element) {
		if (f(biggestSoFar) > f(element)) {
			return biggestSoFar
		} else {
			return element
		}
	})
}
```

원래 함수에 적용
```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    }); // 1단계

    var biggestPurchases = map(bestCustomers, function(customer) {
        return maxKey(customer.purchase, {total: 0}, function(purchase) {
			return purchase.total
		})
    }); // 2단계

    return biggestPurchases;
}
```
코드가 간결해졌습니다. `maxKey()`로 코드가 의미하는 것을 명확하게 표현했습니다. `reduce()`는 일반적이기 때문에 낮은 수준의 함수입니다. `reduce()`는 배열의 값을 조합한다는 의미 말고 특별한 의미가 없습니다.

### 연습 문제
`max()`와 `maxKey()`는 비슷한 함수입니다. 따라서 코드도 비슷할 것입니다. 만약 둘 중 하나로 나머지 하나를 만들 수 있다고 가정하고 다음 질문에 답해 보세요.
```js
function max(numbers) {
	return reduce(numbers, Number.MIN_VALUE, function(m, n) {
		if(m > n) return m
		else return n
	})
}

function maxKey(array, init, f) {
	return reduce(array, init, function(biggestSoFar, element) {
		if (f(biggestSoFar) > f(element)) {
			return biggestSoFar
		} else {
			return element
		}
	})
}
```
1. 어떤 것으로 다른 하나를 만들 수 있을까요? 왜 그런가요?
    maxKey가 일반적이므로 maxKey로 max를 만들 수 있습니다.
2. 코드로 만들어 보세요.
	```js
	function max(array, init) {
		return maxKey(array, init, function(x) {
			return x
		})
	}
	```
3. 두 함수를 호출 그래프로 표현해 보세요.
    ```mermaid
    graph TD
    max --> maxKey
    maxKey --> reduce
    reduce --> forEach
    forEach --> for_loop[for loop]

	```
4. 어떤 함수가 더 일반적인 함수라고 할 수 있나요?
	- maxKey가 더 아래 위치합니다. maxKey가 더 일반적인 함수입니다.

### 체인을 명확하게 만들기 1: 단계에 이름 붙이기

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    }); // 1단계

    var biggestPurchases = map(bestCustomers, function(customer) {
        return maxKey(customer.purchase, {total: 0}, function(purchase) {
			return purchase.total
		})
    }); // 2단계

    return biggestPurchases;
}
```


```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers     = selectBestCustomers(customers); // 1단계
    var biggestPurchases  = getBiggestPurchases(bestCustomers); // 2단계 // 단계가 더 짧아졌고 코드가 모여있어 의미를 이해하기 쉽습니다.
    return biggestPurchases;
}

function selectBestCustomers(customers) { // 고차 함수에 이름을 붙여 현재 문맥에 추가했습니다.
    return filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    });
}


function getBiggestPurchases(customers) { // 고차 함수에 이름을 붙여 현재 문맥에 추가했습니다.
    return map(customers, getBiggestPurchase); // 고차 함수를 함수로 쉽게 빼낼 수 있습니다.
}

function getBiggestPurchase(customer) {
    return maxKey(customer.purchases, { total: 0 }, function(purchase) {
        return purchase.total;
    });
}

```

### 체인을 명확하게 만들기 2: 콜백에 이름 붙이기

```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers = filter(customers, function(customer) {
        return customer.purchases.length >= 3;
    }); // 1단계

    var biggestPurchases = map(bestCustomers, function(customer) {
        return maxKey(customer.purchase, {total: 0}, function(purchase) {
			return purchase.total
		})
    }); // 2단계

    return biggestPurchases;
}
```


```js
function biggestPurchasesBestCustomers(customers) {
    var bestCustomers     = filter(customers, isGoodCustomer); // 1단계
    var biggestPurchases  = map(bestCustomers, getBiggestPurchase); // 2단계
    return biggestPurchases;
}

function isGoodCustomer(customer) { // 콜백에 이름을 붙입니다.
    return customer.purchases.length >= 3;
}

function getBiggestPurchase(customer) { // 콜백에 이름을 붙입니다.
    return maxKey(customer.purchases, { total: 0 }, getPurchaseTotal);
}

function getPurchaseTotal(purchase) {
    return purchase.total;
}
```

### 체인을 명확하게 만들기 3: 두 방법을 비교

일반적으로 두 번째 방법이 더 명확하고 재사용하기도 좋습니다. 인라인 대신 이름을 붙여 콜백을 사용하면 단계가 중첩되는 것도 막을 수 있습니다.
함수형 프로그래머라면 두 가지 방법을 모두 시도해서 어떤 방법이 더 좋은지 코드를 비교해 결정할 것입니다.

### 예제: 한 번만 구매한 고객의 이메일 목록
전체 고객 배열 -> 한 번만 구매한 고객들의 이메일 목록

```js
// 걸러진 결과를 담는 새로운 변수를 정의합니다.
var firstTimers = filter(customers, function(customer) {
    return customer.purchases.length === 1;
});

// 마지막 변수에 구하려고 하는 값이 들어 있을 것입니다.
var firstTimerEmails = map(firstTimers, function(customer) { // 앞에서 정의한 변수를 다음 단계의 인자로 사용합니다.
    return customer.email;
});

```

만약 더 짧고 명확하게 만들려면 다음과 같이 콜백에 이름을 붙여주면 됩니다.
```js
var firstTimers = filter(customers, isFirstTimer);
var firstTimerEmails = map(firstTimers, getCustomerEmail);

function isFirstTimer(customer) { // 이 함수는 다른 곳에서 정의해도 되고 재사용할 수 있습니다.
    return customer.purchases.length === 1;
}

function getCustomerEmail(customer) { // 이 함수는 다른 곳에서 정의해도 되고 재사용할 수 있습니다.
    return customer.email;
}
```

### 연습 문제
구매 금액이 최소 100달러를 넘고(AND) 두 번 이상 구매한 고객 찾기 (큰 손 찾기)
```js
function bigSpenders(customers) {
	var overHundredDollarPurchaser = filter(customers, hasBigPurchase)
	var over2timesOverHundredDollarPurchaser = filter(overHundredDollarPurchaser, has2OrMorePurchases)
	return over2timesOverHundredDollarPurchaser
}

function hasBigPurchase(customer) {
	return filter(customer.purchases, isBigPurchase).length > 0
}

function isBigPurchase(purchase) {
	return purchase.total > 100
}

function has2OrMorePurchases(customer) {
	return customer.purchases.length >= 2
}
```

### 연습 문제
 숫자 배열에 대한 평균값. 평균을 계산하는 함수 만들기
 힌트: 평균은 모두 더한 값을 개수로 나누면 됩니다.
 힌트: `reduce()`를 이용해 모든 값을 더할 수 있습니다.

```js
function average(numbers) {
	return reduce(numbers, 0, plus) / numbers.length
}

function plus(a, b) {
	return a + b
}
```


### 연습 문제
각 고객의 구매액 평균을 구하려고 합니다. 지난 페이지에서 만든 `average()`를 사용하여 구현해 보세요.
```js
function averagePurchaseTotals(customers) {
	return map(customers, function(customer) {
		var purchaseTotals = map(customer.purchases, function(purchase) {
			return purchase.total
		})
		return average(purchaseTotals)
	})
}
```

`map()`, `filter()`함수는 모두 새로운 배열을 만들지만 현대 가비지 컬렉터 성능은 매우 좋기 때문에 걱정할 필요가 없습니다.
그래도 어떤 경우에는 비효율적인 경우가 있는데 체인을 최적화(스트림 결합)할 수 있습니다.

```js
var names = map(customers, getFullName)
var nameLengths = map(names, stringLength)
```

```js
var nameLengths = map(customers, function(customer) {
	return stringLength(getFullName(customer))
})
```
아래 쪽 코드는 가비지 컬렉션이 필요 없습니다.

filter 예제
```js
var goodCustomers    = filter(customers, isGoodCustomer);
var withAddresses    = filter(goodCustomers, hasAddress);

var withAddresses = filter(customers, function(customer) {
  return isGoodCustomer(customer) && hasAddress(customer);
});
```

reduce 예제
```js
var purchaseTotals = map(purchases, getPurchaseTotal);
var purchaseSum    = reduce(purchaseTotals, 0, plus);

var purchaseSum = reduce(purchases, 0, function(total, purchase) {
  return total + getPurchaseTotal(purchase);
});
```

지금 하는 일은 최적화입니다. 병목이 생겼을 때만 쓰는 것이 좋고 대부분의 경우에는 여러 단계를 사용하는 것이 더 명확하고 읽기 쉽습니다.

### 반복문을 함수형 도구로 리팩터링하기
어떤 때에는 기존에 있던 반복문을 함수형 도구로 리팩터링해야합니다.

#### 전략 1: 이해하고 다시 만들기
첫 번째 전략은 단순히 반복문을 읽고 파악한 다음 구현을 잊어버리는 것입니다.
그리고 이 장에 나온 예제를 떠올리면서 다시 만드는 것입니다.
#### 전략 2: 단서를 찾아 리팩터링
기존에 있던 코드를 잘 이해할 수 없을 경우 반복문을 하나씩 선택한 다음 함수형 도구 체인으로 바꾸면 됩니다.

```js
var answer = [];               // answer는 반복문 안에서 결과가 완성되는 배열입니다.

var window = 5;

for (var i = 0; i < array.length; i++) {       // 바깥쪽 배열은 배열 개수만큼 반복합니다.
    var sum = 0;
    var count = 0;
    for (var w = 0; w < window; w++) {         // 안쪽 배열은 0에서 n까지 작은 구간을 반복합니다.
        var idx = i + w;                      // 새로운 인덱스를 계산합니다.
        if (idx < array.length) {
            sum += array[idx];                // 어떤 값을 누적합니다.
            count += 1;
        }
    }
    answer.push(sum / count);                 // answer 배열에 값을 추가합니다.
}
```
가장 눈에 띄는 단서는 원래 배열 크기만큼 answer 배열에 항목을 추가하는 있는 것입니다. -> `map()`
안쪽 반복문은 `reduce()`를 하숑하기 좋습니다. 배열을 돌면서 항목을 값 하나로 만들고 있기 때문입니다.

안족 반복문이 리팩터링을 시작하기 좋은 위치입니다. 

### 팁 1: 데이터 만들기
for 반복문을 사용할 때는 처리할 모든 값이 배열에 들어있지 않아도 됩니다.
첫 번째 팁은 데이터를 배열에 넣으면 함수형 도구를 쓸 수 있다는 것입니다.
다음은 앞에서 만든 코드입니다.
```js
var answer = [];               
var window = 5;

for (var i = 0; i < array.length; i++) {      
    var sum = 0;
    var count = 0;
    for (var w = 0; w < window; w++) { // w는 0부터 window-1까지 바뀌지만 배열에 들어 있는 값은 아닙니다.
        var idx = i + w;               // idx는 i부터 i+window-1 까지 바뀌지만 배열로 만들지는 않습니다.
        if (idx < array.length) {
            sum += array[idx];         // 배열에 있는 작은 범위의 값이지만 배열로 따로 만들지는 않습니다.
            count += 1;
        }
    }
    answer.push(sum / count);                 
}
```

안쪽 반복문은 array에 있는 값들 중 어떤 범위의 값을 반복합니다. 만약 이 범위의 값을 배열로 만들어 반복하면 어떻게 될까요?
```js
var answer = [];

var window = 5;

for (var i = 0; i < array.length; i++) {
    var sum = 0;
    var count = 0;
    var subarray = array.slice(i, i + window); // 하위 배열로 만듭니다.
    for (var w = 0; w < subarray.length; w++) { // 그리고 반복문으로 배열을 반복합니다.
        sum += subarray[w];
        count += 1;
    }
    answer.push(sum/count);
}
```

### 팁 2: 한 번에 전체 배열을 조작하기
하위 배열을 만들었기 때문에 일부 배열이 아닌 배열 전체를 반복할 수 있습니다.
앞에서 만들었던 코드를 보면서 반복문을 어떻게 바꿀지 생각해 봅시다.
```js
var answer = [];

var window = 5;

for (var i = 0; i < array.length; i++) {
    var sum = 0;
    var count = 0;
    var subarray = array.slice(i, i + window); 
    for (var w = 0; w < subarray.length; w++) { // 하위 배열을 반복하는 반복문
        sum += subarray[w]; // 하위 배열의 합과 개수를 구합니다.
        count += 1;
    }
    answer.push(sum/count); // 평균을 구하기 위해 나눕니다.
}
```

전에 만들었던 `average()`함수를 재사용해 평균을 구할 수 있습니다.
```js
var answer = [];

var window = 5;

for(var i = 0; i < array.length; i++) {
	var subarray = array.slice(i, i + window)
	answer.push(average(subarray))
}
```

이제 반복문이 하나 남았습니다. 전체 항목을 반복하기 때문에 `map()`을 사용하기 좋을 것 같습니다. 하지만 반복문이 배열 항목을 사용하지 않으므로 `map()`을 바로 적용할 수는 없습니다.


### 팁 3: 작은 단계로 나누기

```js
var answer = [];

var window = 5;

for(var i = 0; i < array.length; i++) {
	var subarray = array.slice(i, i + window) // 하위 배열을 만들기 위해 반복문의 인덱스를 사용합니다.
	answer.push(average(subarray))
}
```

인덱스로 반복하는 코드를 한 단계로 만들기 어렵거나 어쩌면 불가능할 수도 있습니다. 그래서 더 작은 단계로 나눠야 합니다.
필요한 것이 인덱스이기 때문에 인덱스가 들어 있는 배열(팁1)을 만들어 봅시다. 그리고 나서 인덱스 배열 전체에 함수형 도구(팁2)를 사용해 봅시다.

```js
var indices = []

for(var i = 0; i < array.length; i++) { // 인덱스를 생성하는 작은 단계를 만듭니다.
	indices.push(i)
}
```
새로운 단계가 생겼습니다. 이제 인덱스 배열에 `map()`을 적용해 반복문을 바꿔 봅시다.
```js
var indices = []

for(var i = 0; i < array.length; i++) { 
	indices.push(i)
}

var window = 5

var answer = map(indices, function(i) { // 인덱스 배열에 map()을 사용합니다. 각 항목마다 인덱스를 가지고 콜백을 부릅니다.
	var subarray = array.slice(i, i + window)
	return average(subarray)
})
```
새로운 단계에서는 숫자 배열을 만듭니다. 다음으로 `map()`에 넘기는 콜백은 두 가지 일을 하므로 작은 단계로 나눠 봅시다.

```js
var indices = []
for(var i = 0; i < array.length; i++) { 
	indices.push(i)
}

var window = 5

var windows = map(indices, function(i) { // 단계 1, 하위 배열 만들기
	return array.slice(i, i + window)
})

var answer = map(windows, average) // 단계 2, 평균 계산하기
```

마지막으로 남은 것은 인덱스 배열을 만드는 코드를 빼내 유용한 함수로 정의하는 일입니다.
```js
function range(start, end) { // 재사용성 높음
    var ret = [];
    for (var i = start; i < end; i++)
        ret.push(i);
    return ret;
}

var window = 5;

var indices = range(0, array.length); // 단계 1, 인덱스 배열 생성
var windows = map(indices, function(i) { // 단계 2, 하위 배열 만들기
    return array.slice(i, i + window);
});
var answer = map(windows, average); // 단계 3, 평균 계산하기
```

이제 모든 반복문을 함수형 도구로 체이닝했습니다. 지금까지 한 작업을 다시 살펴봅시다.

### 절차적 코드와 함수형 코드 비교
절차적인 원래 코드
```js
// 원래 코드
var answer = [];              

var window = 5;

for (var i = 0; i < array.length; i++) {       
    var sum = 0;
    var count = 0;
    for (var w = 0; w < window; w++) {         
        var idx = i + w;                     
        if (idx < array.length) {
            sum += array[idx];               
            count += 1;
        }
    }
    answer.push(sum / count);                 
}
```

함수형 도구를 사용한 코드
```js
// 함수형 도구를 사용한 코드
function range(start, end) { // 재사용 가능한 추가 도구
    var ret = [];
    for (var i = start; i < end; i++)
        ret.push(i);
    return ret;
}

var window = 5;

var indices = range(0, array.length); 
var windows = map(indices, function(i) { 
    return array.slice(i, i + window);
});
var answer = map(windows, average); 

```

처음에는 반복문이 중첩되고 인덱스를 계산하며 지역변수를 바꾸는 코드였습니다.
이 과정을 각 단계로 나눠 명확하게 만들었습니다.
완성된 코드는 글로도 그대로 바꿔 쓸 수 있습니다.
##### 배열을 이동하며 평균 구하기
1. 숫자 리스트가 있을 때 각 숫자에 대한 window를 만듭니다.
2. 그리고 각 window의 평균을 구합니다.

### 체이닝 팁 요약
#### 데이터 만들기
함수형 도구는 배열 전체를 다룰 때 잘 동작합니다. 배열 일부에 대해 동작하는 반복문이 있다면 배열 일부를 새로운 배열로 나눌 수 있습니다. 그리고 함수형 도구를 사용하면 작업을 줄일 수 있습니다.
#### 배열 전체를 다루기
어떻게 하면 반복문을 대신해 전체 배열을 한 번에 처리할 수 있을지 생각해 보세요. `map()`은 모든 항목을 변환하고 `filter()`는 항목을 없애거나 유지합니다. 그리고 `reduce()`는 항목을 하나로 합칩니다. 과감하게 배열 전체를 처리해 보세요.
#### 작은 단계로 나누기
알고리즘이 한 번에 너무 많은 일을 한다고 생각된다면 직관에 반하지만 두 개 이상의 단계로 나눠보세요. 단계를 더 만들면 이해하기 쉬워집니다.
#### 보너스: 조건문을 filter()로 바꾸기

#### 보너스: 유용한 함수로 추출하기
스스로 함수형 도구를 추출하고 좋은 이름을 붙여 사용하세요!
#### 보너스: 개선을 위해 실험하기
많은 것을 시도하고 연습하세요!


### 연습 문제
함수형 도구 체인으로 바꿔 보세요.
```js
function shoesAndSocksInventory(products) {
    var inventory = 0;
    for (var p = 0; p < products.length; p++) {
        var product = products[p];
        if (product.type === "shoes" || product.type === "socks") {
            inventory += product.numberInInventory;
        }
    }
    return inventory;
}
```

```js
function shoesAndSocksInventory(products) {
    return products
	    .filter((product) => (product.type === 'shoes' || product.type === 'socks'))
	    .map((product) => product.numberInInventory)
}
```

### 체이닝 디버깅을 위한 팁
고차 하수를 사용하는 것은 매우 추상적이기 때문에 문제가 생겼을 때 이해하기 어려운 때도 있습니다.
다음은 디버깅을 위한 팁입니다.

#### 구체적인 것을 유지하기
의미를 기억하기 쉽게 이름을 붙이세요.
#### 출력해보기

#### 타입을 따라가 보기
함수형 도구는 정확한 타입이 있습니다. 다만 컴파일 타임에 타입을 검사하지 않을 뿐입니다. 
각 단계에서 만들어지는 값의 타입을 따라가면서 단계를 살펴볼 수 있습니다.

### 다양한 함수형 도구
#### pluck()
`map()`으로 특정 필드값을 가져오기 위해 콜백을 작성하는 것보다 `pluck()`을 사용하는 것이 편합니다.
#### concat()
`concat()`으로 배열 안에 배열을 뺄 수 있습니다. 중첩된 배열을 한 단계의 배열로 만듭니다.
#### frequenciesBy()와 groupBy()
개수를 세거나 그룹화하는 일을 종종 쓸모가 있습니다. 이 함수는 객체 또는 맵을 리턴합니다.

### 디양한 함수형 도구를 찾을 수 있는 곳
#### Lodash: 자바스크립트 함수형 도구
#### Laravel 컬렉션: PHP 함수형 도구
#### 클로저 표준 라이브러리

#### 하스켈 Prelude

### 더 편리한 자바스크립트
이 장에서 만든 함수처럼 직접 만들지 않고 자바스크립트 내장 함수를 이용할 수 있습니다.
메서드이기 때문에 체이닝 중간 변수에 할당하지 않아도 됩니다.
화살표 문법으로 콜백을 짧고 명확하게 만들 수 있습니다.

### 자바 스트림
자바8 버전에서 함수형 프로그래밍을 위한 새로운 기능이 추가되었습니다.
#### 람다 표현식
실제로는 컴파일러가 익명 클래스로 바꿉니다. 람다 표현식 안에서 정의한 변수를 범위 밖에서 참조할 수 있는 클로저를 지원하고 이 장에서 했던 것을 모두 할 수 있습니다.
#### 함수형 인터페이스
자바에는 함수형 인터페이스라고 하는 단일 메서드 인터페이스가 있습니다. 모든 함수형 인터페이스는 람다 표현식의 인스턴스입니다.
자바8은 제네릭으로 어떤 타입에도 쓸 수 있는 함수형 인터페이스 몇 가지를 제공합니다. 이 인터페이스로 타입이 있는 함수형 언어처럼 쓸 수 있습니다.
#### 스트림 API
스트림 API는 자바의 함수형 도구입니다. 스트림은 배열이나 컬렉션 같은 데이터로 만들 수 있습니다. 스트림 API에는 스트림을 다룰 수 있는 `map()`, `filter()`, `reduce()`와 같은 함수형 도구가 있습니다. 물론 더 많은 기능이 있습니다. 스트림은 원래 데이터를 바꾸지 않고 체이닝 할 수 있으며 내부적으로 스트림을 효율적으로 사용합니다.

### 값을 만들기 위한 reduce()
고객이 장바구니에 추가한 제품을 배열로 로깅하고 있다가 현재 장바구니 상태로 만들기
```js
var itemsAdded = ["shirt", "shoes", "shirt", "socks", "hat", ...]
```

```js
var shoppingCart = reduce(itemsAdded, {}, function(cart, item) {
    if (!cart[item]) // 추가하려고 하는 제품이 장바구니에 없는 경우
        return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
    else { // 추가하려고 하는 제품이 장바구니에 있는 경우
        var quantity = cart[item].quantity;
        return setFieldByName(cart, item, 'quantity', quantity + 1);
    }
});
```
`reduce()`를 사용해 고객이 추가한 제품으로 장바구니를 만들었습니다.
전달한 함수는 추상화 벽에 추가해 API의 일부가 되기 충분한 함수입니다.

```js
var shoppingCart = reduce(itemsAdded, {}, addOne)

function addOne(cart, item) {
	if (!cart[item]) // 추가하려고 하는 제품이 장바구니에 없는 경우
        return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
    else { // 추가하려고 하는 제품이 장바구니에 있는 경우
        var quantity = cart[item].quantity;
        return setFieldByName(cart, item, 'quantity', quantity + 1);
    }
}
```
이 코드가 의미하는 것은 고객이 장바구니에 제품을 추가한 기록이 모두 있어서 어느 시점의 장바구니라도 만들 수 있습니다.
모든 시점의 장바구니를 만들지 않아도 로그를 이용해 어느 시점의 장바구니라도 다시 만들 수 있습니다.

이는 함수형 프로그래밍에서 중요한 기술입니다. 장바구니에 추가한 제품을 배열 형태로 기록한다면 되돌리기는 어떻게 구현할 수 있을까요?
배열에서 마지막 항목만 없애면 됩니다. 이 책에서 자세히 다루지 않겠지만 관심이 있다면 이벤트 소싱`event sorucing`에 대해 찾아보세요.

이 예제는 고객이 장바구니에서 제품을 제거하는 것을 고려하지 않았습니다. 만약 고객이 제품을 추가하거나 삭제하는 것을 모두 지원하려면 어떻게 해야 할까요?

### 데이터를 사용해 창의적으로 만들기
앞에서 만든 코드입니다.
```js
var itemsAdded = ["shirt", "shoes", "shirt", "socks", "hat", ...]

var shoppingCart = reduce(itemsAdded, {}, addOne)

function addOne(cart, item) {
	if (!cart[item]) // 추가하려고 하는 제품이 장바구니에 없는 경우
        return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
    else { // 추가하려고 하는 제품이 장바구니에 있는 경우
        var quantity = cart[item].quantity;
        return setFieldByName(cart, item, 'quantity', quantity + 1);
    }
}
```

추가했는지 삭제했는지 알려주는 값과 제품에 대한 값을 함꼐 기록하면 고객이 제품을 삭제한 경우도 처리할 수 있습니다.
```js
var itemOps = [
	['add', 'shirt'], ['add', 'shoes'], ['remove', 'shirt'], ...
]
```
이제 제품을 추가한 경우와 삭제한 경우를 모두 처리할 수 있습니다.
```js
var shoppingCart = reduce(itemOps, {}, function(cart, itemOp) {
    var op = itemOp[0];
    var item = itemOp[1];
    if (op === 'add') return addOne(cart, item);
    if (op === 'remove') return removeOne(cart, item);
});

function removeOne(cart, item) {
    if (!cart[item])
        return cart;
    else {
        var quantity = cart[item].quantity;
        if (quantity === 1)
            return remove_item_by_name(cart, item);
        else
            return setFieldByName(cart, item, 'quantity', quantity - 1);
    }
}

function addOne(cart, item) {
	if (!cart[item]) // 추가하려고 하는 제품이 장바구니에 없는 경우
        return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
    else { // 추가하려고 하는 제품이 장바구니에 있는 경우
        var quantity = cart[item].quantity;
        return setFieldByName(cart, item, 'quantity', quantity + 1);
    }
}
```

여기서 중요한 기술을 하나 발견할 수 있습니다. 인자를 데이터로 표현했다는 점입니다. 배열에 동작 이름과 제품 이름인 인자를 넣어 동작을 완전한 데이터로 표현했습니다. 이런 방법은 함수형 프로그래밍에서 자주 사용하는 방법입니다. 인자를 데이터로 만들면 함수형 도구를 체이닝하기 좋습니다. 체이닝을 할 때 리턴할 데이터를 다음 단계의 인자처럼 쓸 수 있도록 만들어 보세요.

### 연습 문제
모든 직원에 대해 적합한 포지션과 얼마나 잘하는지 점수를 매겼습니다.
목록은 이미 높은 점수순으로 정렬되어 있습니다.
```js
var evaluations = [
	{name: 'Jane', position: 'catcher', score: 25},
	{name: 'John', position: 'pitcher', score: 10},
	{name: 'Harray', position: 'pitcher', socre: 3},
]

// 최종 명단은 다음과 같이 만들어야 합니다.
var roster = {
	"pitcher": "John",
	"catcher": "Jane",
	"first base": "Ellen",
	...
}
```

포지션별로 가장 높은 사람을 골라 명단을 완성하는 코드를 만들어 보세요.
##### 성찬 답: 정렬되지 않은 경우
```js
var rosterObj = evaluations.reduce((accum, curr) => {
	var position = curr.position
	if (accum[position]) {
		if(accum[position].score < curr.score) {
			accum[position] = curr
		}
	} else {
		accum[position] = curr
	}
	return accum
}, {})

var roster = Object.entries(rosterObj)
		.map(([key, value]) => ([key, value.name]))
		.reduce((accum, curr) => {
			accum[curr[0]] = curr[1]
			return accum
		}, {})
```
##### 정답: 이미 정렬되어 있을 경우
```js
var roster = reduce(evaluations, {}, function(roster, eval) {
    var position = eval.position;
    if (roster[position]) // 이미 포지션이 결정 되었음
        return roster;      // 아무것도 하지 않음
    return objectSet(roster, position, eval.name);
});
```
### 연습 문제
소프트볼 토너먼트
개인의 적합한 포지션이 무엇인지 알려주는 함수: `recommendPosition()`
```bash
> recommedPosition("Jane")
"catcher"
```
모든 직원 이름을 리스트로 가지고 있습니다. 전체 직원에 대해 직원 이름과 추천 포지션을 구성된 추천 레코드의 목록이 필요합니다.
```js
// 예시
{
	name: "Jane",
	position: "catcher"
}
```
`recommaendPosition()`을 사용해 직원 이름을 리스트를 모든 직원의 추천 레코드로 바꾸는 코드를 만들어 보세요.
```js
var employeeNames = ["John", "Harray", "Jane", ...]

var recommendations = employeeNames.map((name) => {
	return {
		name: name,
		position: recommendPosition(name)
	}
})
```

### 연습 문제
소프트볼 토너먼트2
`scorePlayer()`함수는 직원 이름과 추천 포지션을 넘기면 숫자로 된 점수를 리턴합니다. 높은 점수가 더 좋은 선수입니다.
```bash
> scorePlayer("Jane", "catcher")
25
```

추천 레코드 목록을 가지고 있을 때 레코드값을 인자로 `scorePlayer()`를 불러 다음과 같은 평점 레코드를 만들어야 합니다.
```js
{
	name: "Jane",
	position: "catcher",
	score: 25
}
```

추천 레코드 목록을 받아 인자로 넘겨 평점 목록으로 바꿔 보세요.
```js
var recommendations = [
	{name: "Jane", position: "catcher"},
	{name: "John", position: "pitcher"}
]

var evaluations = recommendations.map(rec => {
	return objectSet(rec, 'score', scorePlayer(rec.name, rec.position))
})
```

### 연습 문제
소프트볼 토너먼트3
앞에 세 개의 연습 문제에서 만든 코드를 체이닝해 봅시다. 모든 직원 이름이 있는 리스트를 하나의 체인으로 엮어 최종 명단을 만들어야 합니다.

다음 두 가지 함수를 이용해 높은 점수순으로 정렬된 평점 목록과 낮은 점수순으로 정렬된 평점 목록도 만들어 보세요.
- `sortBy(array, f)`, array 배열을 받아 f가 리턴한 값을 우선순위로 정렬한 복사본 배열을 리턴합니다(점수로 정렬하기 위해 필요합니다).
- `reverse(array)`, array 배열을 받아 역순으로 정렬된 복사본 배열을 리턴합니다.
```js
var employeeNames = ["John", "Harry", "Jane", ...]

// 정답

// 이름 -> 포지션 추천
var recommendations = map(employeeNames, function(name) {
    return {
        name: name,
        position: recommendPosition(name)
    };
});

// 평점 추가
var evaluations = map(recommendations, function(rec) {
    return objectSet(rec, 'score', scorePlayer(rec.name, rec.position));
});

// 점수 정렬
var evaluationsAscending = sortBy(evaluations, function(eval) {
    return eval.score;
});

// 역순 정렬
var evaluationsDescending = reverse(evaluationsAscending);

//  정렬된 상태에서는 먼저 결정된 포지션의 점수가 가장 높음
var roster = reduce(evaluations, {}, function(roster, eval) {
    var position = eval.position;
    if (roster[position]) // 이미 포지션이 결정 되었음
        return roster;      // 아무것도 하지 않음
    return objectSet(roster, position, eval.name);
});
```

### 메서드 연산자로 정렬하기

앞에서 만들었던 배열을 이동하며 평균을 구하는 예제

#### 이동평균 구현 방법 비교

##### ES6

```javascript
function movingAverage(numbers) {
    return numbers
        .map((e, i) => numbers.slice(i, i + window))
        .map(average);
}
```

##### Lodash를 사용한 전통적인 자바스크립트

```javascript
function movingAverage(numbers) {
    return _.chain(numbers)
        .map(function(e, i) { return numbers.slice(i, i + window); })
        .map(average)
        .value();
}
```

##### 자바8 스트림

```java
public static double average(List<Double> numbers) {
    return numbers
        .stream()
        .reduce(0.0, Double::sum) / numbers.size();
}

public static List<Double> movingAverage(List<Double> numbers) {
    return IntStream
        .range(0, numbers.size())
        .mapToObj(i -> numbers.subList(i, Math.min(i + 3, numbers.size())))
        .map(Utils::average)
        .collect(Collectors.toList());
}
```

##### C\#

```csharp
public static IEnumerable<Double> movingAverage(IEnumerable<Double> numbers) {
    return Enumerable
        .Range(0, numbers.Count())
        .Select(i => numbers.ToList().GetRange(i, Math.Min(3, numbers.Count() - i)))
        .Select(l => l.Average());
}
```

## 특징

각 구현 방식은 동일한 로직을 다른 언어와 라이브러리로 표현한 것입니다:

- **ES6**: 화살표 함수와 체이닝을 활용한 간결한 구현
- **Lodash**: 전통적인 자바스크립트에서 함수형 프로그래밍 패턴 적용
- **Java 8**: 스트림 API를 활용한 함수형 접근
- **C#**: LINQ를 사용한 함수형 스타일 구현

모든 구현에서 슬라이딩 윈도우 방식으로 부분 배열을 생성하고 각각의 평균을 계산하는 동일한 패턴을 따릅니다.


### 결론
함수형 도구를 연결해 체이닝하는 방법을 살펴봤습니다.

### 요점 정리
- 함수형 도구는 여러 단계의 체인으로 조합할 수 있습니다. 함수형 도구를 체인으로 조합하면 복잡한 계산을 작고 명확한 단계로 표현할 수 있습니다.
- 함수형 도구 체인으로 배열을 다루는 복잡한 쿼리를 표현할 수 있습니다.
- 종종 체인의 다음 단계를 위해 새로운 데이터를 만들거나 기존 데이터를 인자로 사용해야 하는 일이 있습니다. 최대한 암묵적인 정보를 명시적으로 표현하는 방법을 찾아야합니다.


## 연습문제
### 어떤 수가 주어졌을 때 배열 내의 어떤 항목 두 개를 합쳐야 해당 수가 되는지 찾아라

```js
function findSum(arr, weight) {
    for (var i=0,arrLength=arr.length; i<arrLength; i++){
        for (var j=i+1; j<arrLength; j++) {
            if (arr[i]+arr[j]==weight){
                return [i,j];
            }
        }
    }
    return -1;
}
findSum([1,2,3,4],5); // [ 0, 3 ]

var arr = [1,2,3,4,5];
var weight = 9;
```
위의 해결책은 두 개의 for 루프를 사용해 **모든 항목의 조합**을 시도한다.
이중 for 루프를 수행하는 것은 높은 시간 복잡도를 갖는다. 
하지만 추가적은 메모리가 필요 없다.

시간 복잡도: O(n<sup>2</sup>)
공간 복잡도: O(1)

어떻게 하면 O(n)의 선형 시간 안에 이를 수행할 수 있을지 생각해보자.
이전에 마추진 항목들을 저장하고, 이미 저장된 항목인지 여부를 쉽게 확인할 수 있다면 어떨까?
```js
function findSumBetter(arr, weight) {
    var hashtable = {};

    for (var i = 0, arrLength = arr.length; i < arrLength; i++) {
        var currentElement = arr[i],
            difference = weight - currentElement;

        // check the right one already exists
        if (hashtable[currentElement] != undefined) {
            return [i, hashtable[currentElement]];
        } else {
            // store index
            hashtable[difference] = i;
        }
    }
    return -1;
}
findSumBetter([1, 2, 3, 4, 5], 9); // [ 4, 3 ]



{
	// index: 0, currentElement: 1, difference: 8
	8: 0, 
	// index: 1, currentElement: 2, difference: 7
	7: 1, 
	// index: 2, currentElement: 3, difference: 6
	6: 2, 
	// index: 3, currentElement: 4, difference: 5
	5: 3, 
	// index: 4, currentElement: 5, difference: 4
	// return [4, 5]
}
```
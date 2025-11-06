# 7장 메모리

JS에서는 가비지 컬렉터가 사용하지 않는 변수를 삭제한다.
하지만 개발자들이 쉽게 빠질 수 있는 함정이 존재한다.

## 메모리 누수

### 객체에 대한 참조
```js
var foo = {
    bar1: memory(), // 5kb
    bar2: memory(), // 5kb
}

function clickEvent() {
    alert(foo.bar[0]) // foo 객체를 참조하므로 10kb 메모리 사용
}
```

### DOM 메모리 누수
이벤트 콜백 외부에서 DOM항목을 가리키는 변수가 선언될 경우 DOM항목을 제거하더라도 해당 항목은 여전히 메모리에 남게 된다.

```js
var one = document.getElementById("one");
var two = document.getElementById("two");
one.addEventListener('click', function() {
    two.remove();
    console.log(two); // 삭제 이후에도 html을 출력할 것이다.
});
```
이벤트 콜백 내부에서 선언하면 메모리 누수를 쉽게 수정할 수 있다.
```js
var one = document.getElementById("one");
one.addEventListener('click', function() {
    var two = document.getElementById("two");
    two.remove();
    console.log(two); // 삭제 이후에도 html을 출력할 것이다.
});
```

DOM 메모리 누수를 막는 또 다른 방법으로 클릭 핸들러를 사용한 뒤 등록 해지하는 방법이 있다.
```js
var one = document.getElementById("one");
var callBackExample = () => {
    var two = document.getElementById("two");
    two.remove();
    one.removeEventListener('click', callBackExample)
}
one.addEventListener('click', callBackExample);
```

### window 전역 객체
window 전역 객체에 포함되는 객체는 메모리에 존재한다.
```js
var a = "apples"; // var 키워드를 통해 전역변수로 선언
b = "oranges";    // var 키워드 없이 전역변수로 선언

console.log(window.a); // "apples"를 출력한다.
console.log(window.b); // "oranges"를 출력한다.
```

### 객체 참조 제한하기
객체에 대한 모든 참조가 제거되면 해당 객체는 제거된다. 함수에 객체의 전체 범위가 아닌 필요한 범위만 전달해야 한다.

```js
// 객체 전체 범위 전달
var test = {
    prop1: 'test'
}

function printProp1(test) {
    console.log(test.prop1);
}

printProp1(test); // 'test'

```

```js
// 속성 전달
var test = {
    prop1: 'test'
}

function printProp1(prop1) {
    console.log(prop1);
}

printProp1(test.prop1); // 'test'

```

### delete 연산자
원치 않는 객체 속성을 delete 연산자로 제거할 수 있다.
```js
var test = {
    prop1: 'test'
}

console.log(test.prop1); // 'test'

delete test.prop1l
console.log(test.prop1); // undefined

```

## 요약
메모리 누수를 다루는 다양한 방법을 잘 활용하자.

## 연습문제
- 쉬워서 생략
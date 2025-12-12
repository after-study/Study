
# 13장 연결 리스트

visualog
https://visualgo.net/en

## SinglyLinkedList

```js
function SinglyLinkedListNode(data) {
    this.data = data;
    this.next = null;
}

function SinglyLinkedList() {
    this.head = null;
    this.size = 0;
}

SinglyLinkedList.prototype.isEmpty = function() {
    return this.size == 0;
}

SinglyLinkedList.prototype.insert = function(value) {
    if (this.head === null) { //If first node
        this.head = new SinglyLinkedListNode(value);
    } else {
        var temp = this.head;
        this.head = new SinglyLinkedListNode(value);
        this.head.next = temp;
    }
    this.size++;
}
var sll1 = new SinglyLinkedList();
sll1.insert(1); // linked list is now: 1 -> null
sll1.insert(12); // linked list is now: 12 -> 1 -> null
sll1.insert(20); // linked list is now: 20 -> 12 -> 1 -> null



SinglyLinkedList.prototype.remove = function(value) {
    var currentHead = this.head;
    if (currentHead.data == value) {
        // just shift the head over. Head is now this new value
        this.head = currentHead.next;
        this.size--;
    } else {
        var prev = currentHead;
        while (currentHead.next) {
            if (currentHead.data == value) {
                // remove by skipping
                prev.next = currentHead.next;
                prev = currentHead;
                currentHead = currentHead.next;
                break; // break out of the loop
            }
            prev = currentHead;
            currentHead = currentHead.next;
        }
        //if wasn't found in the middle or head, must be tail
        if (currentHead.data == value) {
            prev.next = null;
        }
        this.size--;
    }
}
var sll1 = new SinglyLinkedList();
sll1.insert(1); // linked list is now:  1 -> null
sll1.insert(12); // linked list is now: 12 -> 1 -> null
sll1.insert(20); // linked list is now: 20 -> 12 -> 1 -> null
sll1.remove(12); // linked list is now: 20 -> 1 -> null
sll1.remove(20); // linked list is now: 1 -> null 


SinglyLinkedList.prototype.deleteAtHead = function() {
    var toReturn = null;

    if (this.head !== null) {
      toReturn = this.head.data;
      this.head = this.head.next;
      this.size--;    
    }
    return toReturn;
}

var sll1 = new SinglyLinkedList();
sll1.insert(1); // linked list is now:  1 -> null
sll1.insert(12); // linked list is now: 12 -> 1 -> null
sll1.insert(20); // linked list is now: 20 -> 12 -> 1 -> null
sll1.deleteAtHead(); // linked list is now:  12 -> 1 -> null
```

## DoublyLinkedList

```js
function DoublyLinkedListNode(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
}


function DoublyLinkedList() {
    this.head = null;
    this.tail = null;
    this.size = 0;
}
DoublyLinkedList.prototype.isEmpty = function() {
    return this.size == 0;
}

DoublyLinkedList.prototype.insertAtHead = function(value) {
    if (this.head === null) { //If first node
        this.head = new DoublyLinkedListNode(value);
        this.tail = this.head;
    } else {
        var temp = new DoublyLinkedListNode(value);
        temp.next = this.head;
        this.head.prev = temp;
        this.head = temp;
    }
    this.size++;
}
var dll1 = new DoublyLinkedList();
dll1.insertAtHead(10); // ddl1's structure: tail: 10  head: 10 
dll1.insertAtHead(12); // ddl1's structure: tail: 10  head: 12
dll1.insertAtHead(20); // ddl1's structure: tail: 10  head: 20

DoublyLinkedList.prototype.insertAtTail = function(value) {
    if (this.tail === null) { //If first node
        this.tail = new DoublyLinkedListNode(value);
        this.head = this.tail;
    } else {
        var temp = new DoublyLinkedListNode(value);
        temp.prev = this.tail;
        this.tail.next = temp;
        this.tail = temp;
    }
    this.size++;
}

var dll1 = new DoublyLinkedList();
dll1.insertAtHead(10); // ddl1's structure: tail: 10  head: 10 
dll1.insertAtHead(12); // ddl1's structure: tail: 10  head: 12
dll1.insertAtHead(20); // ddl1's structure: tail: 10  head: 20
dll1.insertAtTail(30); // ddl1's structure: tail: 30  head: 20


DoublyLinkedList.prototype.deleteAtHead = function() {
    var toReturn = null;

    if (this.head !== null) {
        toReturn = this.head.data;

        if (this.tail === this.head) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }
    }
    this.size--;
    return toReturn;
}


DoublyLinkedList.prototype.deleteAtTail = function() {
    var toReturn = null;

    if (this.tail !== null) {
        toReturn = this.tail.data;

        if (this.tail === this.head) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
    }
    this.size--;
    return toReturn;
}
var dll1 = new DoublyLinkedList();
dll1.insertAtHead(10); // ddl1's structure: tail: 10  head: 10 
dll1.insertAtHead(12); // ddl1's structure: tail: 10  head: 12
dll1.insertAtHead(20); // ddl1's structure: tail: 10  head: 20
dll1.insertAtTail(30); // ddl1's structure: tail: 30  head: 20
dll1.deleteAtTail();


DoublyLinkedList.prototype.findStartingHead = function(value) {
    var currentHead = this.head;
    while (currentHead.next) {
        if (currentHead.data == value) {
            return true;
        }
        currentHead = currentHead.next;
    }
    return false;
}
var dll1 = new DoublyLinkedList();
dll1.insertAtHead(10); // ddl1's structure: tail: 10  head: 10 
dll1.insertAtHead(12); // ddl1's structure: tail: 10  head: 12
dll1.insertAtHead(20); // ddl1's structure: tail: 10  head: 20
dll1.insertAtTail(30); // ddl1's structure: tail: 30  head: 20
dll1.findStartingHead(10); // true
dll1.findStartingHead(100); // false



DoublyLinkedList.prototype.findStartingTail = function(value) {
    var currentTail = this.tail;
    while (currentTail.prev) {
        if (currentTail.data == value) {
            return true;
        }
        currentTail = currentTail.prev;
    }
    return false;
}

var dll1 = new DoublyLinkedList();
dll1.insertAtHead(10); // ddl1's structure: tail: 10  head: 10 
dll1.insertAtHead(12); // ddl1's structure: tail: 10  head: 12
dll1.insertAtHead(20); // ddl1's structure: tail: 10  head: 20
dll1.insertAtTail(30); // ddl1's structure: tail: 30  head: 20
dll1.findStartingTail(10); // true
dll1.findStartingTail(100); // false




function reverseSingleLinkedList(sll) {
    var node = sll.head;
    var prev = null;
    while (node) {
        var temp = node.next;
        node.next = prev;
        prev = node;
        if (!temp)
            break;
        node = temp;
    }
    return node;
}


// delete duplicates in unsorted linkedlist
function deleteDuplicateInUnsortedSll(sll1) {
    var track = [];

    var temp = sll1.head;
    var prev = null;
    while (temp) {
        if (track.indexOf(temp.data) >= 0) {
            prev.next = temp.next;
            sll1.size--;
        } else {
            track.push(temp.data);
            prev = temp;
        }
        temp = temp.next;
    }
    console.log(temp);
}


//delete duplicates in unsorted linkedlist
function deleteDuplicateInUnsortedSllBest(sll1) {
    var track = {};

    var temp = sll1.head;
    var prev = null;
    while (temp) {
        if (track[temp.data]) {
            prev.next = temp.next;
            sll1.size--;
        } else {
            track[temp.data] = true;
            prev = temp;
        }
        temp = temp.next;
    }
    console.log(temp);
}

```
# 문제 1

https://leetcode.com/problems/design-browser-history/
참고:
[velog - 문제해석](https://velog.io/@changonna/%EC%BD%94%EB%94%A9%ED%85%8C%EC%8A%A4%ED%8A%B8-ALL-IN-ONE-7.-Linked-List%EC%9D%98-%EC%BD%94%ED%85%8C-%EC%A0%81%EC%9A%A9-%EB%B0%A9%EB%B2%95)
[velog - 링크드리스트](https://velog.io/@changonna/%EC%BD%94%EB%94%A9%ED%85%8C%EC%8A%A4%ED%8A%B8-ALL-IN-ONE-6.-Linked-List)
# BrowserHistory 클래스 구현

인터넷 브라우저에서 방문기록과 동일한 작동을 하는 **BrowserHistory class**를 구현한다.  
구현된 브라우저는 `homepage`에서 시작하고, 이후에는 다른 URL을 방문할 수 있다.  
또, “뒤로 가기”와 “앞으로 가기”가 작동하도록 구현한다.

---

## 요구사항

- `BrowserHistory(string homepage)`  
    브라우저는 `homepage`에서 시작한다.
    
- `void visit(string url)`  
    현재 페이지의 **앞에 있는 페이지 기록은 모두 삭제**되고, `url`로 방문한다.
    
- `string back(int steps)`  
    `steps`만큼 “뒤로 가기”.  
    “뒤로 가기”를 할 수 있는 page 개수가 `x`이고 `steps > x`라면 `x`번만 뒤로 간다.  
    이동이 완료되면 현재 URL을 반환한다.
    
- `string forward(int steps)`  
    `steps`만큼 “앞으로 가기”.  
    “앞으로 가기”를 할 수 있는 page 개수가 `x`이고 `steps > x`라면 `x`번만 앞으로 간다.  
    이동이 완료되면 현재 URL을 반환한다.
    
---

## 제약조건

- `1 <= homepage.length <= 20`
- `1 <= url.length <= 20`
- `1 <= step <= 100`
- `homepage`와 `url`은 `:`를 포함한 **lowercase 영어 문자**로 구성됨
- `visit`, `back`, `forward`는 **최대 5000번** 호출될 수 있음
## 예시
### input
```
browserHistory = BrowserHistory("leetcode.com")
browserHistory.visit("google.com")
browserHistory.visit("facebook.com")
browserHistory.visit("youtube.com")
browserHistory.back(1)
browserHistory.back(1)
browserHistory.forward(1)
browserHistory.visit("linkedin.com")
browserHistory.forward(2)
browserHistory.back(2)
browserHistory.back(7)
```
### output
```
None
None
None
None
"facebook.com"
"google.com"
"facebook.com"
None
"linkedin.com"
"google.com"
"leetcode.com"
```


# 문제 2
https://leetcode.com/problems/merge-two-sorted-lists/description/
참고
[풀이](https://www.algodale.com/problems/merge-two-sorted-lists/)

# 문제 3
https://leetcode.com/problems/reverse-linked-list/description/
참고
[풀이](https://www.algodale.com/problems/reverse-linked-list/)

# 문제 4
https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/
참고
[풀이](https://www.algodale.com/problems/remove-nth-node-from-end-of-list/)

# 문제 5
https://leetcode.com/problems/add-two-numbers/description/
참고
[풀이](https://www.algodale.com/problems/add-two-numbers/)
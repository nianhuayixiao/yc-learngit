var reverseArray = function (x, index, str) {
	return index == 0 ? str : reverseArray(x, --index, (str += ' ' + x[index]));
}
var arr = new Array('apple', 'orange', 'peach', 'lime');
var str = reverseArray(arr, arr.length, '');
console.log(str);

var orderArray = function (x, index, str) {
	return index == x.length - 1 ? str : orderArray(x, ++index, (str += x[index] + ' '));
}
var arr2 = ['car', 'boat', 'sun', 'computer'];
str = orderArray(arr2, -1, '');
console.log(str);
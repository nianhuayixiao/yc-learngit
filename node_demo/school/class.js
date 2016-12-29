var teacher = require('./teacher.js');
var student = require('./student.js');
function add(teachName, students) {
	teacher.add(teachName);
	students.forEach(function (item, index) {
		student.add(item);
	})
}

exports.add = add;
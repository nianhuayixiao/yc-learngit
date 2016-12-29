/**
 * Created by yc on 16/12/1.
 * require函数用于在当前模块中加载和使用别的模块，传入一个模块名，返回一个模块导出对象。模块名可使用相对路径（以./开头），或者是绝对路径（以/或C:之类的盘符开头）。另外，模块名中的.js扩展名可以省略。
 * exports对象是当前模块的导出对象，用于导出模块公有方法和属性。别的模块通过require函数使用当前模块时得到的就是当前模块的exports对象。
 */
function say(data_v){
    console.log('my name is ' + data_v.name);

}
var data = require('./data.json');
console.log(data);
exports.say = say(data);

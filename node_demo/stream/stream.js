/**
 * Created by yc on 2017/1/4.
 * 数据流传输演示
 */
var fs = require('fs');
/*
var readStream = fs.createReadStream('hh.jpg');
var writeStream = fs.createWriteStream('hh_e.jpg');
readStream.on('data',function (chunk) {
    if(writeStream.write(chunk)===false){
        console.log('still cached');
        readStream.pause();
    }
})
readStream.on('end',function () {
    writeStream.end();
})
writeStream.on('drain',function () {
    console.log('data drains');
    readStream.resume();
})*/
// 以下代码实现和上方相同的功能
fs.createReadStream('hh.jpg').pipe(fs.createWriteStream('hh_c.jpg'));
/**
 * Created by yc on 2017/1/4.
 */
var http = require('http');
var fs = require('fs');
var request = require('request')
http
    .createServer(function (req,res) {
        /*fs.readFile('hh.jpg',function (err,data) {
            if(err){
                res.end('file error!');
            }else{
                res.writeHeader(200,{'Context-Type':'text/html'});
                res.end(data)
            }
        })*/
        // fs.createReadStream('hh.jpg').pipe(res);
        request('http://static.mukewang.com/static/img/u/temp1.jpg').pipe(res);
    })
    .listen(8090)
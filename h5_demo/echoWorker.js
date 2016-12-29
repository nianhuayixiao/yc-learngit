/**
 * Created by yc on 16/12/9.
 */
onmessage = function(oEvent){
    console.log('2222222222')
    console.log("javascript接收到消息");
    postMessage(new Date());
}
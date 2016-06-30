/**
 * Created by czzou on 2016/6/30.
 */
var EventEmitter = require('events');
var util = require('util');




function MyEmitter() {
    EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);

var myEmitter = new MyEmitter();
myEmitter.on("hehe",function(){
    console.log("hehe")
})
myEmitter.on("hehe",function(){
    console.log("haha")
})
myEmitter.emit("hehe");
console.log(myEmitter.listeners("hehe"));
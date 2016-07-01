/**
 * Created by czzou on 2016/6/30.
 */
var czEvent=require("../czEvent");


var myEmitter = {};
czEvent(myEmitter,true);

myEmitter.addEventListener("hehe",function(){
    console.log("hehe")
})
myEmitter.addEventListener("hehe",function(d1,d2){
    console.log("haha",d1,d2)
})
myEmitter.once("hehe",function(){
    console.log("xixi")
})
myEmitter.trigger("hehe");
myEmitter.trigger("hehe","hello","world");
myEmitter.removeEventListener("hehe");
myEmitter.trigger("hehe");
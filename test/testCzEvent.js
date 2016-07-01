/**
 * Created by czzou on 2016/6/30.
 */
var czEvent=require("../czEvent");


function MyEmitter() {

}
czEvent(MyEmitter);

var myEmitter = new MyEmitter();
var myEmitter2 = new MyEmitter();
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
myEmitter2.trigger("hehe");
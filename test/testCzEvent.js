/**
 * Created by czzou on 2016/6/30.
 */
var czEvent=require("../czEvent");


function MyEmitter() {

}
czEvent(MyEmitter);

var myEmitter = new MyEmitter();
myEmitter.addEventListener("hehe",function(){
    console.log("hehe")
})
myEmitter.addEventListener("hehe",function(){
    console.log("haha")
})
myEmitter.once("hehe",function(){
    console.log("xixi")
})
myEmitter.trigger("hehe");
myEmitter.trigger("hehe");
myEmitter.removeEventListener("hehe");
myEmitter.trigger("hehe");
### nodejs中的事件模块
nodejs中有一个events模块，用来给别的函数对象提供绑定事件、触发事件的能力。这个别的函数的对象，我把它叫做事件宿主对象（非权威叫法），其原理是把宿主函数的原型链指向时间模块的一个对象，做一个函数继承，让宿主函数也拥有处理事件的能力
使用nodejs事件模块的demo如下：
```javascript
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
```
看node events的api http://nodejs.cn/api/events.html ，一个事件模块需要具备如下的基本功能：
- 添加绑定事件
- 添加绑定一次性事件
- 移除事件监听
- 触发事件
- 其他需要的扩展

### 事件模块设计
自己实现一个简单的事件系统，实现上面几个基本的功能就行。
捋一捋思路，我们需要先实现一个事件类，用来创建不同名称的事件对象，例如click事件对象，hehe事件对象等，并在对象内部维持一个事件被触发时的处理函数列表。
对于同一个事件宿主对象而言，对它绑定的事件应该有如下特点：
1. 同一种类型的事件对象只需要有一个
2. 处理函数需要有多个
3. 对于同一个事件，重复绑定同一个事件处理函数应该是无效的

于是得到如下结构：
```javascript
/**
 * 定义一个事件单元类
 * @param eventname
 * @constructor
 */
function EventMeta(eventname){
    this.name=eventname;
    this.handlerMap={};
    this.handlerList=[];
}
```
每个事件宿主对象都应该自己持有一个map，用来保存自己的事件单元对象，加上上面所说的，绑定，一次性绑定、解绑、触发，宿主函数的原型应该被指向这样一个对象：
```javascript
 var prototype={
        addEventListener:addEventListener,
        once:once,
        removeEventListener:removeEventListener,
        trigger:trigger,
        getEventHandlerMap:getEventHandlerMap
  }
```
为了让宿主函数拥有这些属性，需要一个函数来为宿主函数指一下prototype属性，这里要注意的是，一定要调用这个函数之后，再扩展宿主函数自身的prototype属性，否则会被覆盖
```javascript
function czEvent(fn){
        if(typeof fn!=="function") return;
        fn.prototype=Object.create(prototype);
    }
```
用户使用的时候这样调用一下就可以了
```javascript
var czEvent=require("../czEvent");
function MyEmitter() {
}
czEvent(MyEmitter);
```

### 依次实现事件函数
#### addEventListener
```javascript
    /**
     * 绑定事件监听
     * @param type
     * @param handler
     */
    function addEventListener(eventname,handler){
        var EventHandlerMap=this.getEventHandlerMap();
        var meta=EventHandlerMap[eventname];
        if(!meta){
            meta=EventHandlerMap[eventname]=new EventMeta(eventname);
        }
        var handlerId=handler.__handlerId;
        if(!handlerId){
            EventHandlerMap.__handlerId++;
            handler.__handlerId=EventHandlerMap.__handlerId;
            handlerId=handler.__handlerId;
        }
        //对于同一事件的同一处理函数，不重复绑定
        if(!meta.handlerMap[handlerId]){
            meta.handlerMap[handlerId]=handler;
            meta.handlerList.push(handler);
        }
    }
```
#### once
```javascript
    /**
     * 绑定只执行一次的handler
     * @param type
     * @param handler
     */
    function once(eventname,handler){
        handler.__once=true;
        this.addEventListener(eventname,handler);
    }
```
#### removeEventListener
```javascript
    /**
     * 移除事件监听
     * @param type
     * @param handdler
     */
    function removeEventListener(eventname,handdler){
        var EventHandlerMap=this.getEventHandlerMap();
        var meta=EventHandlerMap[eventname];
        if(!meta) return;
        //移除一个handler的绑定
        if(handdler && handdler.__handlerId){
            var index=meta.handlerList.indexOf(handdler);
            if(index>-1){
                meta.handlerList.splice(index,1);
                delete meta.handlerMap[handdler.__handlerId];
                return;
            }
        }
        //移除所有handler
        meta.handlerMap={};
        meta.handlerList.length=0;
    }
```

#### trigger
```javascript
    /**
     * 触发事件
     * @param eventname
     */
    function trigger(){
        var EventHandlerMap=this.getEventHandlerMap();
        var args=[];
        var that=this;
        for(var i=0;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var eventname=args.splice(0,1);
        var meta=EventHandlerMap[eventname];
        if(!meta) return;
        var onceHandlerList=[];
        //依次同步执行handler
        meta.handlerList.forEach(function(handler){
            if(handler.__once){
                onceHandlerList.push(handler)
            }
            handler.apply(this,args);
        });
        //清除绑定为once的事件
        onceHandlerList.forEach(function(handler){
            that.removeEventListener(eventname,handler);
        });
    }
```

#### getEventHandlerMap
```javascript
    function getEventHandlerMap(){
        var EventHandlerMap=this.__EventHandlerMap;
        if(EventHandlerMap) return EventHandlerMap;
        return this.__EventHandlerMap={__handlerId:0};
    }
```
### 包装
学(chao)习(xi)一下jquery的包装技术，让模块支持commonJs和amd
```javascript
/**
 * Created by czzou on 2016/6/30.
 */
( function( global, factory ) {
    "use strict";
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global, true );
    } else {
        factory( global );
    }
}(typeof window !== "undefined" ? window : this,function(window,noGlobal){
	//把上面的代码copy进来
    if ( typeof define === "function" && define.amd ) {
        define( "czEvent", [], function() {
            return czEvent;
        } );
    }
    if ( !noGlobal ) {
        window.czEvent = czEvent;
    }
    return czEvent;
}))
```
### 扩展
如有需求，还可以在此基础上进行一些扩展，比如nodejs的events模块支持的handler函数个数上限、handler函数抛出异常时触发的error事件等，另外，简单改写一下czEvent函数，还可以让事件模块支持给对象赋予事件处理能力的功能
```javascript
    function czEvent(fn,asObj){
        if(asObj){
            for(var key in prototype){
                Object.defineProperty(fn,key,{
                    value:prototype[key]
                })
            }
            return;
        }
        if(typeof fn!=="function") return;
        fn.prototype=Object.create(prototype);
    }
```
### 测试
分别测试nodejs的events模块，czEvent的commonJs用法，amd用法以及直接引用用法，demo就不在这里一一列举了~
![](D:\learn\blog_gitcafe_hexo\nw_blog_creator/../source/blogimgs/2016-07-01/1467344448737.png)

github地址：[https://github.com/zouchengzhuo/czevent](https://github.com/zouchengzhuo/czevent "https://github.com/zouchengzhuo/czevent")
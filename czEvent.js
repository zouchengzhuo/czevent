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
    /**
     * 一个用来记录事件类型和事件单元对象的全局Map，每一种事件只需要创建一个meta对象
     * @type {{handlerId: number}}
     */
    var EventHandlerMap={
        __handlerId:0//一个递增的事件id， 用来赋值给handler，防止同一handler被重复绑定到同一事件上
    }
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
    /**
     * 绑定事件监听
     * @param type
     * @param handler
     */
    function addEventListener(eventname,handler){
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
    /**
     * 绑定只执行一次的handler
     * @param type
     * @param handler
     */
    function once(eventname,handler){
        handler.__once=true;
        addEventListener(eventname,handler);
    }
    /**
     * 移除事件监听
     * @param type
     * @param handdler
     */
    function removeEventListener(eventname,handdler){
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
    /**
     * 触发事件
     * @param eventname
     */
    function trigger(){
        var args=[];
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
            removeEventListener(eventname,handler);
        });
    }
    var prototype={
        addEventListener:addEventListener,
        once:once,
        removeEventListener:removeEventListener,
        trigger:trigger
    }
    function czEvent(fn){
        if(typeof fn!=="function") return;
        fn.prototype=Object.create(prototype);
    }
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
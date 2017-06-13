/**
 * Created by LiYonglei on 2017/6/13.
 * 容器(大部分情况下可能指的就是整个文档)的滚动条滚动到最底部时候执行的插件
 * options:
 *       allowScrollCount: 0,允许最多可以滚动加载多少次,当值为0的时候将无限制
 *       offset:0,距离容器底部多少像素就执行回调函数
 *       done:function(promise){},当滚动条滚动到了底部或者调用done方法执行的回调函数,当之前的委托调用该事件时的委托解决以后才能执行本次回调
 *                                promise jquery委托,done事件中一定要执行该委托的解决(resolve)或者拒绝(reject)方法,否则委托将永远无法完成，那么也就永远无法执行后面再次触发的done事件
 *       fail:function(){},当done中的委托(promise)调用拒绝(reject)方法以后触发的回调函数
 *       pending:function(){},委托刚产生(也就是产生了之后但在解决或拒绝之前)时执行的回调函数
 *       exceed:function(){} 当委托解决了,并且当前执行done的次数超过allowScrollCount的规定数量(当然,allowScrollCount时,永远无法执行该回调)的时候触发的回调
 */
(function($){
    if($.fn.jscroll){
        return;
    }
    var setMethods={
        done:done
    };
    var getMethods={

    };
    $.fn.jscroll=function(){
        var args=arguments,params,method;
        if(!args.length|| typeof args[0] == 'object'){
            return this.each(function(idx){
                var $self=$(this);
                $self.data('jscroll',$.extend(true,{},$.fn.jscroll.default,args[0]));
                params=$self.data('jscroll');
                _init.call( $self,params);
            });
        }else{
            if(!$(this).data('jscroll')){
                throw new Error('You has not init jscroll!');
            }
            params=Array.prototype.slice.call(args,1);
            if (setMethods.hasOwnProperty(args[0])){
                method=setMethods[args[0]];
                return this.each(function(idx){
                    var $self=$(this);
                    method.apply($self,params);
                });
            }else if(getMethods.hasOwnProperty(args[0])){
                method=getMethods[args[0]];
                return method.apply(this,params);
            }else{
                throw new Error('There is no such method');
            }
        }
    };
    $.fn.jscroll.default={
        allowScrollCount: 0,
        offset:0,
        done:function(promise){},
        fail:function(){},
        pending:function(){},
        exceed:function(){}
    };
    function _init(params){
        var _self = this,
            params=_self.data("jscroll"),
            allowScrollCount=params.allowScrollCount,
            offset=params.offset;
            params._scrollCount=0;
        _self.on("scroll",function(){
            if(!allowScrollCount||params._scrollCount<allowScrollCount){
                if(_self.get(0) instanceof Window){
                    if(getScrollTop()+getClientHeight()>=getScrollHeight()-offset){
                        _done.call(_self);
                    }
                }else{
                    if(this.scrollTop+this.clientHeight>=this.scrollHeight-offset){
                        _done.call(_self);
                    }
                }
            }
        });
        return _self;
        /*获取滚动条当前的位置*/
        function getScrollTop() {
            var scrollTop = 0;
            if (document.documentElement && document.documentElement.scrollTop) {
                scrollTop = document.documentElement.scrollTop;
            }
            else if (document.body) {
                scrollTop = document.body.scrollTop;
            }
            return scrollTop;
        }
        /*获取当前可是范围的高度*/
        function getClientHeight() {
            var clientHeight = 0;
            if (document.body.clientHeight && document.documentElement.clientHeight) {
                clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
            }
            else {
                clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
            }
            return clientHeight;
        }
        /*获取文档完整的高度*/
        function getScrollHeight() {
            return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }
    }
    function done(){
        _done.call(this);
    }
    function _done(){
        var _self = this,
        params=_self.data("jscroll"),
        allowScrollCount=params.allowScrollCount;
        if(!params._promise||params._promise.state()=="resolved"){
            params._promise= $.Deferred();
            params._scrollCount++;
            params.pending();
            if(!params._promise){
                params._promise= $.Deferred();
            }
            params.done.call(_self,params._promise);
            params._promise.done(function(){
                if(allowScrollCount<=params._scrollCount){
                    params.exceed.call(_self);
                }
            }).fail(function(){
                params.fail.call(_self);
            })
        }
    }
})(jQuery);

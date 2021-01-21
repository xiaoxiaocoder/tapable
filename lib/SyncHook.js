/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncHookCodeFactory extends HookCodeFactory {
	// 实现了content, 在HookCodeFactory.contentWithInterceptors中使用
	content({ onError, onDone, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) => onError(err),
			onDone,
			rethrowIfPossible
		});
	}
}

const factory = new SyncHookCodeFactory();

const TAP_ASYNC = () => {
	throw new Error("tapAsync is not supported on a SyncHook");
};

const TAP_PROMISE = () => {
	throw new Error("tapPromise is not supported on a SyncHook");
};

const COMPILE = function(options) {
	// 设置实例x属性:	instance._x = options.taps.map(t => t.fn);
	factory.setup(this, options);
	// 生成代码
	return factory.create(options);
};
/**
 * 1. 声明实例 var sync = new SyncHook(['a', 'b'])
 * 2. 注册事件 sync.tap('name', fn)
 * 3. 调用 sync.call(a, b)
 *
 * 1. 声明时创建实例sync, 传入使用实例时需要的参数, 指定实例名称(可选项)
 * 2. 注册事件时, 调用逻辑 SyncHook.tapAsync -> Hook.tapAsync -> Hook._tap, 像实例属性taps集合中添加事件对象
 * 3. 执行注册事件, 触发编译并执行.
 * 	Hook( call -> CALL_DELEGATE -> this._createCall)-> SyncHook.compile ->
 *	factory.setup(this, options) -> factory.create(options)
 */
function SyncHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncHook;
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;
	// 设置compile方法用于编译方法内容
	hook.compile = COMPILE;
	// 构造函数返回对象(new fn()), 则创建的新对象指向该对象(基础类型undefinded、数字、字符串、布尔除外)
	// https://www.cnblogs.com/cc-freiheit/p/10935643.html
	return hook;
}

SyncHook.prototype = null;

module.exports = SyncHook;

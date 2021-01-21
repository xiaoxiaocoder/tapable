/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

const defaultFactory = (key, hook) => hook;

/**
 * Hook 键值对存储
 */
class HookMap {
	constructor(factory, name = undefined) {
		this._map = new Map();
		this.name = name;
		this._factory = factory;
		this._interceptors = [];
	}

	get(key) {
		return this._map.get(key);
	}

	for(key) {
		const hook = this.get(key);
		if (hook !== undefined) {
			return hook;
		}
		// 没有的话, 通过_factory 创建一个新的hook
		let newHook = this._factory(key);
		// interceptors 拦截器, 在注册的钩子函数注册或执行时执行的一些额外操作
		// HookCodeFactory/header -> var _interceptors = this.interceptors;
		// Hook.js/intercept ->  this.interceptors.push
		const interceptors = this._interceptors;
		for (let i = 0; i < interceptors.length; i++) {
			// 有拦截器中, 修改原来注册的钩子函数的执行逻辑
			newHook = interceptors[i].factory(key, newHook);
		}
		// 添加进_map 存储库
		this._map.set(key, newHook);
		return newHook;
	}

	intercept(interceptor) {
		// this._interceptors = this.interceptors
		this._interceptors.push(
			Object.assign(
				{
					factory: defaultFactory
				},
				interceptor
			)
		);
	}
}

HookMap.prototype.tap = util.deprecate(function(key, options, fn) {
	return this.for(key).tap(options, fn);
}, "HookMap#tap(key,…) is deprecated. Use HookMap#for(key).tap(…) instead.");

HookMap.prototype.tapAsync = util.deprecate(function(key, options, fn) {
	return this.for(key).tapAsync(options, fn);
}, "HookMap#tapAsync(key,…) is deprecated. Use HookMap#for(key).tapAsync(…) instead.");

HookMap.prototype.tapPromise = util.deprecate(function(key, options, fn) {
	return this.for(key).tapPromise(options, fn);
}, "HookMap#tapPromise(key,…) is deprecated. Use HookMap#for(key).tapPromise(…) instead.");

module.exports = HookMap;

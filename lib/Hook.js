/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

const deprecateContext = util.deprecate(() => {},
"Hook.context is deprecated and will be removed");

// TODO: CALL_DELEGATE调用时机 @done
const CALL_DELEGATE = function(...args) {
	// TODO: 通过_createCall调用compile创建方法体内容 @done
	// 获取call方法内容后, 调用, 传入上面传入的参数
	this.call = this._createCall("sync");
	return this.call(...args);
};
const CALL_ASYNC_DELEGATE = function(...args) {
	this.callAsync = this._createCall("async");
	return this.callAsync(...args);
};
const PROMISE_DELEGATE = function(...args) {
	this.promise = this._createCall("promise");
	return this.promise(...args);
};

class Hook {
	constructor(args = [], name = undefined) {
		this._args = args;
		this.name = name;
		this.taps = [];
		this.interceptors = [];
		this._call = CALL_DELEGATE;
		this.call = CALL_DELEGATE;
		this._callAsync = CALL_ASYNC_DELEGATE;
		this.callAsync = CALL_ASYNC_DELEGATE;
		this._promise = PROMISE_DELEGATE;
		this.promise = PROMISE_DELEGATE;
		// TODO: _x 即由所有在该实例上注册的事件执行方法集合 @done
		// 参见HookCodeFactory setup
		this._x = undefined;

		this.compile = this.compile;
		// 只是注册方法逻辑, 此时还没有生成执行代码
		// 往taps里里添加代码
		this.tap = this.tap;
		this.tapAsync = this.tapAsync;
		this.tapPromise = this.tapPromise;
	}

	// 需要继承类实现(覆盖), 不能直接调用
	// 如: SyncHook.js 中 hook.compile = COMPILE;
	compile(options) {
		throw new Error("Abstract: should be overridden");
	}

	_createCall(type) {
		return this.compile({
			taps: this.taps,
			interceptors: this.interceptors,
			args: this._args,
			type: type
		});
	}

	_tap(type, options, fn) {
		if (typeof options === "string") {
			options = {
				name: options.trim()
			};
		} else if (typeof options !== "object" || options === null) {
			throw new Error("Invalid tap options");
		}
		if (typeof options.name !== "string" || options.name === "") {
			throw new Error("Missing name for tap");
		}
		if (typeof options.context !== "undefined") {
			deprecateContext();
		}
		// interface Tap {
		// 	name: string,
		// 	type: string
		// 	fn: Function,
		// 	stage: number,
		// 	context: boolean,
		// 	before?: string | Array
		// }
		options = Object.assign({ type, fn }, options);
		options = this._runRegisterInterceptors(options);
		// TODO: 加入新的事件 @done
		// 加入新事件时, 会先重设编译事件
		this._insert(options);
	}

	tap(options, fn) {
		this._tap("sync", options, fn);
	}

	tapAsync(options, fn) {
		this._tap("async", options, fn);
	}

	tapPromise(options, fn) {
		this._tap("promise", options, fn);
	}

	_runRegisterInterceptors(options) {
		// TODO: 	_tap(type, options, fn) { // options = this._runRegisterInterceptors(options);
		// 钩子函数添加拦截器有register时, 可能会修改配置参数
		for (const interceptor of this.interceptors) {
			if (interceptor.register) {
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) {
					options = newOptions;
				}
			}
		}
		return options;
	}

	withOptions(options) {
		const mergeOptions = opt =>
			Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

		return {
			name: this.name,
			tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
			tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
			tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
			intercept: interceptor => this.intercept(interceptor),
			isUsed: () => this.isUsed(),
			withOptions: opt => this.withOptions(mergeOptions(opt))
		};
	}

	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	// 新增拦截器
	intercept(interceptor) {
		this._resetCompilation();
		this.interceptors.push(Object.assign({}, interceptor));
		if (interceptor.register) {
			for (let i = 0; i < this.taps.length; i++) {
				// HookInterceptor  register: (tap: Tap) => Tap,
				this.taps[i] = interceptor.register(this.taps[i]);
			}
		}
	}

	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}

	/** taps: Tap对象数组
	 *  interface Tap { name: string, type: string fn: Function, stage: number, context: boolean, before?: string | Array }
	 *  如果调用tap时只传入了name, fn, 则stage默认为0, before默认为空. 则传入的item会出现在taps的最后一个位置
	 *  具体使用方式参考tests/Hook.js
	 */
	_insert(item) {
		this._resetCompilation();
		let before;
		// before: 插件名称
		if (typeof item.before === "string") {
			before = new Set([item.before]);
		} else if (Array.isArray(item.before)) {
			before = new Set(item.before);
		}
		let stage = 0;
		if (typeof item.stage === "number") {
			// 新插入的元素想要停留的阶段
			stage = item.stage;
		}
		// 这里假设已经注册了两个事件
		let i = this.taps.length;
		// 从最后一个倒序
		// i = 2
		while (i > 0) {
			i--; // i= 1
			const x = this.taps[i];
			// 把当前位置tap复制一个, 并赋值给后面一个位置, 方便后面调用this.taps[i] = item; 赋值
			// this.taps[2] = x
			this.taps[i + 1] = x;
			// 当前元素的stage xStage = 0
			const xStage = x.stage || 0;
			// TODO: 这里将before转成Set类型 x.name @done
			if (before) {
				// Set中包含当前插件 由于前面已经将当前元素移动了位置, 所以从集合中删除当前元素, 继续下一次循环
				if (before.has(x.name)) {
					before.delete(x.name);
					continue;
				}
				// Set中还有元素
				if (before.size > 0) {
					continue;
				}
			}
			// 当前元素的xStage大于stage, 继续遍历, 寻找合适的位置(xStage <= stage)
			if (xStage > stage) {
				continue;
			}
			i++;
			break;
		}
		this.taps[i] = item;
	}
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;

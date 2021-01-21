# Tapable

The tapable package expose many Hook classes, which can be used to create hooks for plugins.

tapable包暴露了很多钩子方法, 这些钩子可以用于创建插件的钩子.  

``` javascript
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
 } = require("tapable");
```

## Installation

## 安装

``` shell
npm install --save tapable
```

## Usage

All Hook constructors take one optional argument, which is a list of argument names as strings.

所有钩子的构造函数使用一个可选参数, 该参数是一个由参数名称(字符串形式)构成的数组.

``` js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```

The best practice is to expose all hooks of a class in a `hooks` property:

最佳实践是在一个类的`hooks`属性中暴露所有的钩子.

``` js
class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			brake: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

	/* ... */
}
```

Other people can now use these hooks:

现在, 其他人可以按照如下方式使用这些钩子:

``` js
const myCar = new Car();

// Use the tap method to add a consument
myCar.hooks.brake.tap("WarningLampPlugin", () => warningLamp.on());
```

It's required to pass a name to identify the plugin/reason.

需要传入一个名字用于区分插件.

You may receive arguments:
你可能会受到如下参数:

``` js
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
```

For sync hooks, `tap` is the only valid method to add a plugin. Async hooks also support async plugins:
对于同步钩子, `tap`是唯一合法的方法来增加一个插件. 异步钩子同时也支持异步插件:

``` js
myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
	// return a promise
	return google.maps.findRoute(source, target).then(route => {
		routesList.add(route);
	});
});
myCar.hooks.calculateRoutes.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
	bing.findRoute(source, target, (err, route) => {
		if(err) return callback(err);
		routesList.add(route);
		// call the callback 执行回调
		callback();
	});
});

// You can still use sync plugins
// 你仍可以使用同步钩子
myCar.hooks.calculateRoutes.tap("CachedRoutesPlugin", (source, target, routesList) => {
	const cachedRoute = cache.get(source, target);
	if(cachedRoute)
		routesList.add(cachedRoute);
})
```
The class declaring these hooks need to call them:

声明的这些钩子, 可以按照如下方式来调用:

``` js
class Car {
	/**
	  * You won't get returned value from SyncHook or AsyncParallelHook,
	  * to do that, use SyncWaterfallHook and AsyncSeriesWaterfallHook respectively
		*	不可以在SyncHook或者AsyncParallelHook返回值
		* 如果需要返回值, 可以使用SyncWaterfallHook或者AsyncSeriesWaterfallHook
	 **/

	setSpeed(newSpeed) {
		// following call returns undefined even when you returned values
		// 即便你的代码返回了值, 下面的执行结果依然会返回undefined
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes.promise(source, target, routesList).then((res) => {
			// res is undefined for AsyncParallelHook
			// 对于AsyncParallelHook, res 是undefined
			return routesList.getRoutes();
		});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```

The Hook will compile a method with the most efficient way of running your plugins. It generates code depending on:
* The number of registered plugins (none, one, many)
* The kind of registered plugins (sync, async, promise)
* The used call method (sync, async, promise)
* The number of arguments
* Whether interception is used

Hook被编译成最有效的执行方式. 她生成代码取决于:
*	被注册的插件的数量(没有, 一个或多个)
*	所注册的插件的类型(同步, 异步或promise)
*	调用方法的类型(同步, 异步或promise)
*	参数的数量
*	是否使用了拦截

This ensures fastest possible execution.

以上这些条件是个更快的执行成为可能

## Hook types

Each hook can be tapped with one or several functions. How they are executed depends on the hook type:

每个钩子可以被一个或多个方法注册, 他们怎么执行取决于钩子的类型:

* Basic hook (without “Waterfall”, “Bail” or “Loop” in its name). This hook simply calls every function it tapped in a row.
* 基础钩子(名称中没有"Waterfall", "Bail"或者"Loop"). 这个钩子简单的执行每一个方法在它的注册的方法中.

* __Waterfall__. A waterfall hook also calls each tapped function in a row. Unlike the basic hook, it passes a return value from each function to the next function.
* __Waterfall__. 一个管道式钩子同样也可以依次被调用, 与基础钩子不同, 它会将上个方法的返回值传递给下一个方法

* __Bail__. A bail hook allows exiting early. When any of the tapped function returns anything, the bail hook will stop executing the remaining ones.
* __Bail__. 一个竞速钩子

* __Loop__. When a plugin in a loop hook returns a non-undefined value the hook will restart from the first plugin. It will loop until all plugins return undefined.
* 循环钩子

Additionally, hooks can be synchronous or asynchronous. To reflect this, there’re “Sync”, “AsyncSeries”, and “AsyncParallel” hook classes:

* __Sync__. A sync hook can only be tapped with synchronous functions (using `myHook.tap()`).
* 同步钩子

* __AsyncSeries__. An async-series hook can be tapped with synchronous, callback-based and promise-based functions (using `myHook.tap()`, `myHook.tapAsync()` and `myHook.tapPromise()`). They call each async method in a row.
* 异步串行

* __AsyncParallel__. An async-parallel hook can also be tapped with synchronous, callback-based and promise-based functions (using `myHook.tap()`, `myHook.tapAsync()` and `myHook.tapPromise()`). However, they run each async method in parallel.
* 异步并行

The hook type is reflected in its class name. E.g., `AsyncSeriesWaterfallHook` allows asynchronous functions and runs them in series, passing each function’s return value into the next function.


## Interception

All Hooks offer an additional interception API:

参数类型见下方HookInterceptor设计

``` js
myCar.hooks.calculateRoutes.intercept({
	call: (source, target, routesList) => {
		console.log("Starting to calculate routes");
	},
	register: (tapInfo) => {
		// tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
		console.log(`${tapInfo.name} is doing its job`);
		return tapInfo; // may return a new tapInfo object
	}
})
```

**call**: `(...args) => void` Adding `call` to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.

**tap**: `(tap: Tap) => void` Adding `tap` to your interceptor will trigger when a plugin taps into a hook. Provided is the `Tap` object. `Tap` object can't be changed.

**loop**: `(...args) => void` Adding `loop` to your interceptor will trigger for each loop of a looping hook.

**register**: `(tap: Tap) => Tap | undefined` Adding `register` to your interceptor will trigger for each added `Tap` and allows to modify it.

## Context

Plugins and interceptors can opt-in to access an optional `context` object, which can be used to pass arbitrary values to subsequent plugins and interceptors.

arbitrary: 任意的
subsequent: 之后的

``` js
myCar.hooks.accelerate.intercept({
	context: true,
	tap: (context, tapInfo) => {
		// tapInfo = { type: "sync", name: "NoisePlugin", fn: ... }
		console.log(`${tapInfo.name} is doing it's job`);

		// `context` starts as an empty object if at least one plugin uses `context: true`.
		// If no plugins use `context: true`, then `context` is undefined.
		if (context) {
			// Arbitrary properties can be added to `context`, which plugins can then access.
			context.hasMuffler = true;
		}
	}
});

myCar.hooks.accelerate.tap({
	name: "NoisePlugin",
	context: true
}, (context, newSpeed) => {
	if (context && context.hasMuffler) {
		console.log("Silence...");
	} else {
		console.log("Vroom!");
	}
});
```

## HookMap

A HookMap is a helper class for a Map with Hooks

``` js
const keyedHook = new HookMap(key => new SyncHook(["arg"]))
```

``` js
keyedHook.for("some-key").tap("MyPlugin", (arg) => { /* ... */ });
keyedHook.for("some-key").tapAsync("MyPlugin", (arg, callback) => { /* ... */ });
keyedHook.for("some-key").tapPromise("MyPlugin", (arg) => { /* ... */ });
```

``` js
const hook = keyedHook.get("some-key");
if(hook !== undefined) {
	hook.callAsync("arg", err => { /* ... */ });
}
```

## Hook/HookMap interface

Public:

``` ts
interface Hook {
	tap: (name: string | Tap, fn: (context?, ...args) => Result) => void,
	tapAsync: (name: string | Tap, fn: (context?, ...args, callback: (err, result: Result) => void) => void) => void,
	tapPromise: (name: string | Tap, fn: (context?, ...args) => Promise<Result>) => void,
	intercept: (interceptor: HookInterceptor) => void
}

interface HookInterceptor {
	call: (context?, ...args) => void,
	loop: (context?, ...args) => void,
	tap: (context?, tap: Tap) => void,
	register: (tap: Tap) => Tap,
	context: boolean
}

interface HookMap {
	for: (key: any) => Hook,
	intercept: (interceptor: HookMapInterceptor) => void
}

interface HookMapInterceptor {
	factory: (key: any, hook: Hook) => Hook
}

interface Tap {
	name: string,
	type: string
	fn: Function,
	stage: number,
	context: boolean,
	before?: string | Array
}
```

Protected (only for the class containing the hook):

``` ts
interface Hook {
	isUsed: () => boolean,
	call: (...args) => Result,
	promise: (...args) => Promise<Result>,
	callAsync: (...args, callback: (err, result: Result) => void) => void,
}

interface HookMap {
	get: (key: any) => Hook | undefined,
	for: (key: any) => Hook
}
```

## MultiHook

A helper Hook-like class to redirect taps to multiple other hooks:

``` js
const { MultiHook } = require("tapable");

this.hooks.allHooks = new MultiHook([this.hooks.hookA, this.hooks.hookB]);
```

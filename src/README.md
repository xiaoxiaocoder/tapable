# Tapbable

Webpack 本质上是一种事件流的机制, 它的工作流是将各个插件串联起来, 而实现这一切的核心就是 tapable, Webpack 中最核心的, 负责编译的 Compiler 和负责创建 bundles 的 Compilation 都是 tapable 构造函数的实例.

https://www.jianshu.com/p/273e1c9904d2

## Sync\*

同步钩子

- SynHook
- SyncBailHook
- SyncWaterfallHook
- SyncLoopHook

## Async\*

异步钩子

### AsyncParallel\*

异步并行

- AsyncParallelHook
- AsyncParallelBailHook

### AsyncSeries\*

异步串行

- AsyncSeriesHook
- AsyncSeriesBailHook
- AsyncSeriesWaterfallHook

## 解读

SyncHook 是一个类, 注册事件需要创建实例, 创建实例时需要支持传入一个数组, 数组内存储事件触发时传入的参数, 实例的`tap`方法用于注册事件, 支持传入两个参数, 第一个参数为事件名称, 在 Webpack 中一般用于存储事件对应的插件名称(名字可以随意定, 只是起到注释作用), 第二个参数为事件处理函数, 函数参数为执行 call 方法触发事件时所传入的参数的形参.

```js
const { SyncHook } = require("tapable");

// 创建实例, 参数为事件触发时传入的参数
let syncHook = new SyncHook(["name", "age"]);

// 注册事件
syncHook.tap("1", (name, age) => console.log("1", name, age));
syncHook.tap("2", (name, age) => console.log("2", name, age));
syncHook.tap("3", (name, age) => console.log("3", name, age));

// 触发事件, 让监听函数执行
syncHook.call("panda", 18);

// 1, panda, 18
// 2, panda, 18
// 3, panda, 18
```

- SyncHook 串行同步执行, 依次执行注册的事件
- SyncBailHook 串行同步执行, 如果事件处理函数执行时有一个不为空(返回值不为 undefined), 则结束执行队列
- SyncWaterfallHook 串行同步执行, 上一个事件处理函数的返回值作为参数传递给下一个事件处理函数
- SyncLoopHook 串行同步执行, 事件处理函数返回 true 表示继续循环, 即新欢执行当前时间处理函数, 返回`undefined`表示循环结束, 与`SyncBailHook`不同的是, `SyncBailHook`只是决定是否继续行下执行后面的事件处理函数, 而`SyncLoopHook`的循环是指循环执行每一个时间吹函数, 知道返回`undefined`为止, 才会技术向下执行其他时间处理函数.

Async 类型钩子

Async 类型可以使用 tap, tapSync 和 tapPromise 注册不同类型的插件"钩子", 分别通过 call, callAsync 和 promise 方法调用.

1. AsyncParalleHook

AsyncParalleHook 为异步并执行, 通过 tapAsync 注册事件, 通过 callAsync 触发, 通过 tapPromise 注册的时间, 通过 promise 触发(返回值可以调用 then 方法)

(1) tapAsync / callAsync

`callAsync`最后一个参数为回调函数, 为所有事件处理函数执行完毕后执行.

2. AsyncSeriesHook

AsyncSeriesHook 为异步串行执行, 与 AsyncParalleHook 相同, 通过 tapAsync 注册的事件, 通过 callAsync 触发; 通过 tapPromise 注册的事件, 通过 promise 触发, 可以调用 then 方法.

1. tapAsync/callAsync

与 AsyncParalleHook 的 callAsync 方法类似, AsyncSeriesHook 的 callAsync 方法也是通过传入回调函数的方式, 再有时间处理完毕后执行 callAsync 的回调函数

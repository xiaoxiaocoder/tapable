/**
 * 异步串行执行
 */
export default class AsyncSeriesHook {
	constructor(args) {
		this.args = args;
		this.tasks = []
	}

	tapAsync(name, task) {
		this.tasks.push(task)
	}

	callAsync(...args) {
		const finalCallBack = args.pop()
		args = args.slice(0, this.args.length)

		// 定义变量i和next函数, 每次取出一个事件处理函数执行, 并维护i的值
		// 直到所有事件处理函数都执行完, 调用callAsync的回调
		// 如果事件处理函数中没有调用next, 则无法继续
		let i = 0;
		let next = () => {
			let task = this.tasks[i++]
			task ? task(...args, next) : finalCallBack()
		}

		next()
	}

	tapPromise(name, task) {
		this.tasks.push(task)
	}

	promise(...args) {
		args = args.slice(0, this.args.length)

		let [ first, ...others ] = this.tasks
		return others.reduce((promise, task) => {
			return promise.then(() => task(...args))
		}, first(...args))
	}
}

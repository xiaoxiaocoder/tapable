export default class AsyncParlleHook {
	constructor(args) {
		this.args = args;
		this.tasks = [];
		this.promiseTasks = [];
	}
	tapAsync(name, task) {
		this.tasks.push(task);
	}
	callAsync(...args) {
		// 取出回调函数
		let callback = args.pop();
		args = args.slice(0, this.args.length);

		/**
		 * 定义一个变量和done函数, 没次执行检测值和队列长度,
		 * 决定是否执行callAsync的回调函数
		 */
		let i = 0;
		let done = () => {
			if (++i === this.tasks.length) {
				callback();
			}
		};

		this.tasks.forEach(task => task(...args, done));
	}

	tapPromise(name, task) {
		this.promiseTasks.push(task);
	}

	promise(...args) {
		// 传入参数严格对应创建实例传入数据中的规定的参数, 执行时多余的参数为undefined
		args = args.slice(0, this.args.length);

		// 将所有事件处理函数转换成Promise实例, 并发实行所有的Promise
		return Promise.all(this.promiseTasks.map(task => task(...args)));
	}
}

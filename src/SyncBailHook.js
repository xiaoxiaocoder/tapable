class SyncBailHook {
	constructor(args) {
		this.args = args;
		this.tasks = [];
	}
	tap(name, task) {
		this.tasks.push(task);
	}

	call(...args) {
		if (args.length < this.args.length)
			throw new Error("paramerarot not enough");
		// 传入参数严格对应创建实例传入数组中的规定的参数，执行时多余的参数为 undefined
		args = args.slice(0, this.args.length);

		let ret,
			i = 0;
		do {
			ret = this.tasks[i++](...args);
		} while (!ret);
	}
}

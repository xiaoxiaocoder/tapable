class SyncHook {
	constructor(args) {
		this.args = args;
		this.tasks = [];
	}
	/**
	 *	注册事件
	 * @param {string} name 事件名称
	 * @param {string} task 执行call时要执行的事件
	 */
	tap(name, task) {
		this.task.push(task);
	}
	call(...args) {
		if (args.length < this.args.length) throw new Error("参数不足");

		this.tasks.forEach(task => task(args));
	}
}

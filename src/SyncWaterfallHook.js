class SyncWaterfallHook {
	constructor(args) {
		this.args = args;
		this.tasks = [];
	}
	tap(name, task) {
		this.tasks.push(task)
	}
	call(...args) {
		args = args.slice(0, this.args.length)

		let [first, ...others] = args
		return others.reduce((ret, task) => task(ret), first(...args));
	}
}

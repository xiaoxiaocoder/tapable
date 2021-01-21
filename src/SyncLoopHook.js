class SyncLoopHook {
	constructor(args) {
		this.args = args
		this.tasks = []
	}
	tap(name, task) {
		this.tasks.push(task)
	}
	call(...args) {
		args = args.slice(0, this.args.length)

		// let flag = false, undef = void 0;
		// for (let i = 0; i < args.length; i++) {
		// 	const task = args[i];
		// 	do {
		// 		flag = task(...args);
		// 	} while (flag);
		// 	if(flag == undef){
		// 		continue;
		// 	}
		// }

		this.tasks.forEach(task => {
			let ret;
			do {
				ret = task(...args)
			} while (ret === true || ret !== undefined);
		})
	}
}

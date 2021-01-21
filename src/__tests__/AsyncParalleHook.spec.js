import AsyncParalleHook from "../AsyncParalleHook";
// const AsyncParlleHook = require("../AsyncParlleHook");

describe("AsyncParlleHook", () => {
	let asyncParalleHook = null;

	beforeEach(() => {
		asyncParalleHook = new AsyncParalleHook(["name", "age"]);
	});
	afterEach(() => {
		asyncParalleHook = null;
	});

	test(" tapAsync/callAsync", done => {
		console.time("asyncTime");

		// 注册事件
		asyncParalleHook.tapAsync("1", (name, age, done) => {
			setTimeout(() => {
				console.log("1", name, age, new Date());
				done();
			}, 1000);
		});

		asyncParalleHook.tapAsync("2", (name, age, done) => {
			setTimeout(() => {
				console.log(2, name, age, new Date());
				done();
			}, 2000);
		});

		asyncParalleHook.tapAsync("3", (name, age, done) => {
			setTimeout(() => {
				console.log(3, name, age, new Date());
				done();
				console.timeEnd("asyncTime");
			}, 3000);
		});

		asyncParalleHook.callAsync("panda", 18, () => {
			console.log("complete");
			done();
		});
	});

	test("tapPromise/callPromise ", done => {
		console.time("promiseTime");
		asyncParalleHook.tapPromise(1, (name, age) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log(1, name, age, new Date());
					resolve(1);
				}, 1000);
			});
		});

		asyncParalleHook.tapPromise(2, (name, age) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log(2, name, age, new Date());
					resolve(2);
				}, 2000);
			});
		});

		asyncParalleHook.tapPromise(3, (name, age) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log(3, name, age, new Date());
					resolve(3);
				}, 3000);
			});
		});

		asyncParalleHook.promise("panada", 28).then(res => {
			console.log("complete", res);
			console.timeEnd("promiseTime");
			done();
		});
	});
});

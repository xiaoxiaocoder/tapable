import AsyncSeriesHook from "../AsyncSeriesHook";

describe("AsyncSeriesHook Test cases", () => {
	let asyncSeriesHook = null;

	beforeEach(() => {
		asyncSeriesHook = new AsyncSeriesHook(["name", "age"]);
	});
	afterEach(() => {
		asyncSeriesHook = null;
	});
	it("tapAsync/callAsync", done => {
		console.time("asyncTime");
		asyncSeriesHook.tapAsync(1, (name, age, next) => {
			setTimeout(() => {
				console.log(1, name, age);
				next();
			}, 1000);
		});

		asyncSeriesHook.tapAsync(2, (name, age, next) => {
			setTimeout(() => {
				console.log(2, name, age);
				next();
			}, 1500);
		});

		asyncSeriesHook.tapAsync(3, (name, age, next) => {
			setTimeout(() => {
				console.log(3, name, age);
				next();
			}, 2000);
		});

		asyncSeriesHook.callAsync("panada", 18, () => {
			console.log("complete");
			console.timeEnd("asyncTime");
			done();
		});
	});
});

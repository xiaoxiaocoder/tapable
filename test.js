var {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} = require("./lib/index");

var bing = require("./test-bing");
var google = require("./test-google");

/**
 *  QA
 * 1. 注册, 调用割裂感觉, calculateRoutes
 */

class Car {
	constructor() {
		// 声明钩子
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			brake: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

	// 钩子调用
	setSpeed(newSpeed) {
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = [];
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if (err) return callback(err);
			callback(null, routesList);
		});
	}
}

// 注册事件
const myCar = new Car();

// 同步事件
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed =>
	console.log(`[LoggerPlugin]Accelrating to ${newSpeed}`)
);
myCar.hooks.accelerate.tap(
	{
		name: "LoggerPlugin2",
		before: "LoggerPlugin"
	},
	newSpeed => console.log(`[LoggerPlugin1]Accelrating to ${newSpeed}`)
);

myCar.hooks.accelerate.tap({
	name: "LoggerPlugin3",
	fn: newSpeed => console.log(`[LoggerPlugin3]Accelrating to ${newSpeed}`)
});

myCar.hooks.accelerate.intercept({
	call: newSpeed => {
		console.log(`The newSpeed is: ${newSpeed}`);
	},
	tap: tapInfo => {
		console.log(`${tapInfo.name} tap was trigged!`);
	},
	register: tapInfo => {
		console.log(`${tapInfo.name} is doing its jos`, JSON.stringify(tapInfo));
		return tapInfo;
	}
});

myCar.setSpeed(60);

// 注册异步事件(Promise)
// myCar.hooks.calculateRoutes.tapPromise(
// 	"GoogleMapsPlugin",
// 	(source, target, routesList) => {
// 		// return a promise
// 		return google.maps.findRoute(source, target).then(route => {
// 			routesList.add(route);
// 		});
// 	}
// );

//  注册异步事件(async)
// myCar.hooks.calculateRoutes.tapAsync({
// 	name: "BingMapsPlugin",
// 	fn: (source, target, routesList, callback) => {
// 		bing.maps.getDrivingRoute(source, target, (err, route) => {
// 			if (err) return callback(err);
// 			routesList.push(route);
// 			callback();
// 		});
// 		// stage, before, type....
// 	}
// });
// myCar.hooks.calculateRoutes.tapAsync(
// 	{
// 		name: "BingMapsPlugin2",
// 		before: "BingMapsPlugin"
// 	},
// 	(source, target, routesList, callback) => {
// 		bing.maps.getDrivingRoute(source, target, (err, route) => {
// 			if (err) return callback(err);
// 			routesList.push(route);
// 			callback();
// 		});
// 		// stage, before, type....
// 	}
// );
// myCar.hooks.calculateRoutes.tapAsync({
// 	name: "BingMapsPlugin3",
// 	fn: (source, target, routesList, callback) => {
// 		bing.maps.getDrivingRoute(source, target, (err, route) => {
// 			if (err) return callback(err);
// 			routesList.push(route);
// 			callback();
// 		});
// 		// stage, before, type....
// 	}
// });

// myCar.hooks.calculateRoutes.intercept({
// 	call: (source, target, routesList) => {
// 		console.log("Starting to calculate routes");
// 	},
// 	tap: tapInfo => {
// 		console.log(`${tapInfo.name} tap was trigged!`);
// 	},
// 	register: tapInfo => {
// 		console.log(`${tapInfo.name} is doing its jos`, JSON.stringify(tapInfo));
// 		return tapInfo;
// 	}
// });

// myCar.useNavigationSystemAsync("beijing", "yuncheng", (err, routes) => {
// 	if (err) return console.log(err.message);
// 	console.log(routes);
// });

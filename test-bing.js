module.exports = {
	maps: {
		getDrivingRoute: function(source, target, callback) {
			new Promise(function(resovle, reject) {
				setTimeout(function() {
					var rand = Math.random();
					if (rand > 0.5) {
						resovle("ok");
					} else {
						reject(new Error("error message"));
					}
				}, 1000);
			})
				.then(res => callback(null, res))
				.catch(err => callback(err));
		}
	}
};

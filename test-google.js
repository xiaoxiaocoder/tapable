module.exports = {
	maps: {
		findRoute: function(source, target, callback) {
			return new Promise(function(resovle, reject) {
				setTimeout(function() {
					var rand = Math.random();
					if (rand > 0.5) {
						resovle("ok");
					} else {
						reject(new Error("error message"));
					}
				}, 1000);
			})
		}
	}
};

const fs = require("fs");

exports.writeFile = function(parameters, body) {
	fs.writeFile("test-code.js", `(${parameters}) => { ${body} }`, () => {
		console.log("生成执行代码成功");
	});
};

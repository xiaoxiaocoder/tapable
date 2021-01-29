const fs = require("fs");

exports.writeFile = function(fn = "", parameters, body) {
	fs.writeFile(
		"test-code.js",
		`function ${fn || "fn"} (${parameters}) { ${body} }`,
		() => {
			console.log("生成执行代码成功");
		}
	);
};

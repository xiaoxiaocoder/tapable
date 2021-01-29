function fn(newSpeed) {
	"use strict";
	var _context;
	var _x = this._x;
	var _taps = this.taps;
	var _interceptors = this.interceptors;
	_interceptors[0].call(newSpeed);
	var _tap0 = _taps[0];
	_interceptors[0].tap(_tap0);
	var _fn0 = _x[0];
	var _result0 = _fn0(newSpeed);
	if (_result0 !== undefined) {
		return _result0;
	} else {
		var _tap1 = _taps[1];
		_interceptors[0].tap(_tap1);
		var _fn1 = _x[1];
		var _result1 = _fn1(newSpeed);
		if (_result1 !== undefined) {
			return _result1;
		} else {
			var _tap2 = _taps[2];
			_interceptors[0].tap(_tap2);
			var _fn2 = _x[2];
			var _result2 = _fn2(newSpeed);
			if (_result2 !== undefined) {
				return _result2;
			} else {
			}
		}
	}
}

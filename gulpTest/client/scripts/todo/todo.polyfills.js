if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // Closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError('Function.prototype.bind: Cannot bind non-callable object');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function() {};
    var fBound = function() {
      var context = this instanceof fNOP && oThis ? this : oThis;
      return fToBind.apply(context, aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
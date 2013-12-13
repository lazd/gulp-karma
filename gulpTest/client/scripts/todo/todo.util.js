(function() {
	var lastId = 1;

	// Valid todo names must contain at least 2 non-space characters
	var validTodoRe = /[^\s]{2,}/;
	var whiteSpaceRe = /^\s+|\s+$/g;

	todo.util = {
		trimTodoName: function(name) {
			return name.replace(whiteSpaceRe, '');
		},
		isValidTodoName: function(name) {
			return validTodoRe.test(name);
		},
		getUniqueId: function() {
			return lastId++;
		}
	};
}());
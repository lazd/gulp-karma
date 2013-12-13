todo.App = function(options) {
	this.el = document.querySelector(options.el);

	this.items = options.items || [];

	this.render();
	this.addListeners();
};

todo.App.prototype.render = function() {
	this.el.classList.add('todo-page');
	this.el.innerHTML = '<ul class="todo-list"></ul>'+
						'<form class="todo-form todo-item">'+
						'<div class="todo-gutter"></div>'+
						'<div class="todo-content"><input class="todo-input" type="text" name="todo"></div>'+
						'</form>';

	this.list = this.el.querySelector('.todo-list');
	this.form = this.el.querySelector('.todo-form');
	this.input = this.el.querySelector('.todo-input');

	this.items.forEach(this.renderItem.bind(this));
};

todo.App.prototype.renderItem = function(item) {
	// Assign ID if necessary
	if (!item.id) {
		item.id = todo.util.getUniqueId();
	}

	// Create a new element or re-use the existing one
	var el = item.el = item.el || document.createElement('li');
	el.className = 'todo-item';
	el.innerHTML = '<div class="todo-gutter-right"><button class="todo-remove"></button></div>'+
					'<div class="todo-gutter"><button class="todo-done"></button></div>'+
					'<div class="todo-content"><input class="todo-input" type="text"></div>';

	var input = el.querySelector('.todo-input');
	input.value = item.name;
	input.setAttribute('data-todo-id', item.id);

	var doneButton = el.querySelector('.todo-done');
	doneButton.setAttribute('data-todo-id', item.id);

	var removeButton = el.querySelector('.todo-remove');
	removeButton.setAttribute('data-todo-id', item.id);

	if (item.done) {
		this.setDone(item);
	}

	this.list.appendChild(el);
};

todo.App.prototype.add = function(name) {
	// Reject todos with invalid names
	if (!todo.util.isValidTodoName(name)) return;

	// Create a new item
	var item = {
		id: todo.util.getUniqueId(),
		name: todo.util.trimTodoName(name),
		done: false
	};

	// Render it
	this.renderItem(item);

	// Store it
	this.items.push(item);

	return item.id;
};

todo.App.prototype.getItem = function(id) {
	id = parseInt(id);

	for (var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		if (item.id === id) {
			return item;
		}
	}
	return null;
};

todo.App.prototype.setDone = function(item) {
	item.el.classList.add('todo-item--done');
};

todo.App.prototype.setNotDone = function(item) {
	item.el.classList.remove('todo-item--done');
};

todo.App.prototype.toggleDone = function(id) {
	var item = this.getItem(id);

	if (item) {
		item.done = !item.done;
		if (item.done) {
			this.setDone(item);
		}
		else {
			this.setNotDone(item);
		}
	}
};

todo.App.prototype.remove = function(id) {
	var item = this.getItem(id);

	if (item) {
		this.items.splice(this.items.indexOf(item), 1);

		item.el.parentNode.removeChild(item.el);
	}
};

todo.App.prototype.addListeners = function() {
	this.el.addEventListener('click', this.handleListClick.bind(this), false);
	this.el.addEventListener('change', this.handleItemChange.bind(this), false);
	this.el.addEventListener('submit', this.handleFormSubmit.bind(this), false);
};

todo.App.prototype.handleFormSubmit = function(evt) {
	// Stop form from submitting
	event.preventDefault();

	// Add a new item
	this.add(this.input.value);

	// Clear the form
	this.form.reset();
};

todo.App.prototype.handleListClick = function(event) {
	var target = event.target;
	var id = target.getAttribute('data-todo-id');
	if (target.classList.contains('todo-done')) {
		this.toggleDone(id);
	}
	else if (target.classList.contains('todo-remove')) {
		this.remove(id);
	}
};

todo.App.prototype.handleItemChange = function(event) {
	var target = event.target;
	if (target.classList.contains('todo-input')) {
		var id = target.getAttribute('data-todo-id');

		// Only react to change events for existing items
		if (id) {
			var item = this.getItem(id);
			item.name = target.value;
		}
	}
};

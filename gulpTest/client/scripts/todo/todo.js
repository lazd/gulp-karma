var todo = {
  init: function(todos) {
    console.log('Starting todo app...');
    todo.app = new todo.App({
      el: '#todo-app',
      items: todos
    });
  }
};

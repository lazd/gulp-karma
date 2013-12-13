describe('todo.utils', function() {
  describe('#trimTodoName', function() {
    it('should remove leading whitespace', function() {
      expect(todo.util.trimTodoName(' name')).toBe('name');
    });

    it('should remove trailing whitespace', function() {
      expect(todo.util.trimTodoName('name ')).toBe('name');
    });

    it('should remove leading and trailing whitespace', function() {
      expect(todo.util.trimTodoName(' name ')).toBe('name');
    });
  });

  describe('#isValidTodoName', function() {
    it('should be invalid for empty string', function() {
      expect(todo.util.isValidTodoName('')).toBe(false);
    });

    it('should be invalid for string of length 1', function() {
      expect(todo.util.isValidTodoName('a')).toBe(false);
    });

    it('should be invalid for string consisting of spaces', function() {
      expect(todo.util.isValidTodoName('   ')).toBe(false);
    });

    it('should be valid for string of length 2', function() {
      expect(todo.util.isValidTodoName('ab')).toBe(true);
    });
  });
});

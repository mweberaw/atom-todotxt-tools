"use strict";
var TodoView = (function () {
    function TodoView() {
        this.element = document.createElement('div');
        this.element.classList.add('todo-view');
        this.element.style.overflow = 'scroll';
        this.element.style.height = '200px';
        var todoList = document.createElement('ul');
        this.element.appendChild(todoList);
        for (var i = 0; i < 100; i++) {
            var todoItem = document.createElement('li');
            todoItem.textContent = "Item " + i;
            todoList.appendChild(todoItem);
        }
    }
    TodoView.prototype.destroy = function () {
        this.element.remove();
    };
    TodoView.prototype.getElement = function () {
        return this.element;
    };
    return TodoView;
}());
exports.TodoView = TodoView;

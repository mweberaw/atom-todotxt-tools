export class TodoView {
  element: HTMLElement

  constructor() {
    this.element = document.createElement('div')
    this.element.classList.add('todo-view')
    this.element.style.overflow = 'scroll'
    this.element.style.height = '200px'

    const todoList = document.createElement('ul')
    this.element.appendChild(todoList)

    for(let i = 0; i<100; i++) {
      let todoItem = document.createElement('li')
      todoItem.textContent = `Item ${i}`
      todoList.appendChild(todoItem)
    }
  }

  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element
  }
}

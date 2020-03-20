<!-- frontend/pages/index.vue -->
<template lang="pug">
  v-row.justify-center
    v-col.pb-1(cols='8')
      // emit'ы теперь нам не нужны
      new-todo-form
    v-col.my-1(v-for='todo of todoList' :key='todo.id' cols='8')
      todo-item(:todo='todo')
</template>

<script>
import NewTodoForm from '../components/NewTodoForm'
import TodoItem from '../components/TodoItem'
// импортируем свеженаписанные запросы
import { GET_TODO_LIST } from '../graphql'

export default {
  components: { TodoItem, NewTodoForm },
  data() {
    return {
      todoList: []
    }
  },
  apollo: {
    // получаем список todoList. При таком объявлении запроса переменная todoList
    // должна записаться результатами запроса, однако запрос должен называться
    // аналогично с переменной
    todoList: { query: GET_TODO_LIST }
  }
}
</script>
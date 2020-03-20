<!-- frontend/components/NewTodoForm.vue -->
<template lang="pug">
  v-card
    v-card-title.pb-1(style='overflow-wrap: break-word;')
      b {{ todo.title }}
      v-spacer
        // Изменено событие
      v-btn(@click='remove' text small icon style='position: absolute; right: 0; top: 0')
        v-icon(:disabled='$nuxt.isServer' small) mdi-close
    v-card-text.py-1
      v-row(row justyfy-center align-center)
        v-col(cols='11' style='overflow-wrap: break-word;')
          | {{ todo.text }}
        v-col(cols='1')
          div(style='text-align: right;')
            // Добавлена обработка клика
            v-checkbox.pa-0.ma-0(:value='todo.done' @click.once='toggle' hide-details style='display: inline-block;' color='green lighten-1')
            | {{ todo.done }}
    v-card-actions
      span.grey--text
        | Выполнить до
        v-icon(small) mdi-calendar
        |  {{ todo.dueDate }} | Создано
        v-icon(small) mdi-calendar-today
        |  {{ todo.createdDate }}
      v-spacer
      span.grey--text
        // Изменен путь получения имени категории
        v-icon(small) mdi-pen
        | Категория: {{ todo.category.name }}
</template>

<script>
// импортируем свеженаписанные запросы
import { GET_TODO_LIST, REMOVE_TODO, TOGGLE_TODO } from '../graphql'

export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      default: () => ({})
    }
  },
  // с этого момента изменения по-серьезнее
  methods: {
    toggle() {
      // Для запроса который возвращает измененный элемент не обязательно
      // вручную прописывать функцию update. Apollo сам найдёт в каких
      // запросах "участвует" измененная запись, и разошлет всем подписчикам
      // измененный объект. В нашем случае это запрос в компоненте index.vue
      // на получение списка Todo
      this.$apollo.mutate({
        mutation: TOGGLE_TODO,
        variables: {
          todoId: this.todo.id
        }
      })
    },
    remove() {
      // функция update не видит контекста this
      const todoId = this.todo.id
      this.$apollo.mutate({
        mutation: REMOVE_TODO,
        variables: {
          todoId
        },
        update(store, { data: { removeTodo } }) {
          if (!removeTodo) return
          // В случае успешного удаления удаляем текущий элемент из кэша
          const data = store.readQuery({ query: GET_TODO_LIST })
          data.todoList = data.todoList.filter(todo => todo.id !== todoId)
          // Самоуничтожаемся!
          store.writeQuery({ query: GET_TODO_LIST, data })
        }
      })
    }
  }
}
</script>
<template lang="pug">
  v-form(ref='form' v-model='valid')
    v-card
      v-card-text.pt-0.mt-0
        v-row(row wrap)
          v-col(cols='8') {{ newTodo }}
            v-text-field(
              v-model='newTodo.title'
              :rules='[nonEmptyField]'
              label='Задача'
              prepend-icon='mdi-check-circle-outline')
          v-col(cols='4')
            v-menu(
              ref='menu'
              v-model='menu'
              :close-on-content-click='false'
              :nudge-right='40'
              :return-value.sync='newTodo.dueDate'
              transition='scale-transition'
              offset-y
              min-width='290px')
              template(v-slot:activator='{ on }')
                v-text-field(v-model='newTodo.dueDate' :rules='[nonEmptyField]' v-on='on' label='Дата выполнения' prepend-icon='mdi-calendar' readonly)
              v-date-picker(v-model='newTodo.dueDate' no-title scrollable locale='ru-ru' first-day-of-week='1')
                v-spacer
                v-btn(@click='menu = false' text color='primary') Отмена
                v-btn(@click='$refs.menu.save(newTodo.dueDate)' text color='primary') Выбрать
          v-col(cols='12')
            v-textarea.py-0.my-0(v-model='newTodo.text' :rules='[nonEmptyField]' label='Описание' prepend-icon='mdi-account' hide-details rows='1')
      v-card-actions
        v-combobox.my-0.mx-2.mb-2.pt-0(v-model='newTodo.category' :rules='[nonEmptyField]' :items='categories' hide-details label='Категория' prepend-icon='mdi-pen')
        v-spacer
        v-btn(:disabled='!valid' :loading='loading' @click='add' color='blue lighten-1' text) Добавить
</template>

<script>
// импортируем свеженаписанные запросы
import { ADD_TODO, GET_CATEGORIES, GET_TODO_LIST } from '../graphql'

export default {
  name: 'NewTodoForm',
  data() {
    return {
      newTodo: null,
      categories: [],
      valid: false,
      menu: false,
      nonEmptyField: text =>
        text ? !!text.length : 'Поле не должно быть пустым',
      loading: false // индикация выполнения запроса
    }
  },
  apollo: {
    // загрузка данных для селектора категорий
    categories: {
      query: GET_CATEGORIES,
      update({ categories }) {
        return categories.map(c => c.name)
      }
    }
  },
  created() {
    this.clear()
  },
  methods: {
    add() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: ADD_TODO,
          variables: {
            ...this.newTodo
          },
          // кэш аполло позволяет манипулировать данными из этого кэша, вне зависимости
          // от того, в каком компоненте выполняется код. Здесь в качестве ответа
          // сервера мы получаем новую запись Todo. Добавляем её в кэш, записываем
          // обратно по запросу GET_TODO_LIST, таким образом переменная Apollo
          // сам разошлет всем подписчикам данного запроса измененные данные. В нашем
          // случае подписчиком является переменная todoList в компоненте index.vue
          update: (store, { data: { addTodo } }) => {
            // если в кэше отсутствуют данные по запросу, то бросится исключение
            const todoListData = store.readQuery({ query: GET_TODO_LIST })

            todoListData.todoList.unshift(addTodo)
            // store.writeQuery({ query: GET_CATEGORIES, data: todoListData })

            const categoriesData = store.readQuery({ query: GET_CATEGORIES })
            // В списке категорий ищем категорию новой записи Todo. При неудачном поиске
            // добавляем в кэш. Таким образом селектор категорий всегда остается
            // в актуальном состоянии
            const category = categoriesData.categories.find(
              c => c.name === addTodo.category.name
            )
            if (!category) {
              categoriesData.categories.push(addTodo.category)
              store.writeQuery({ query: GET_CATEGORIES, data: categoriesData })
            }
          }
        })
        .then(() => {
          this.clear()
          this.loading = false
          this.$refs.form.reset() // сброс валидации формы
        })
    },
    clear() {
      this.newTodo = {
        title: '',
        text: '',
        dueDate: '',
        category: ''
      }
    }
  }
}
</script>
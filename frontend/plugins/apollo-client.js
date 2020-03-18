import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { from, concat } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'

// Если плагин является функцией, то в процессе инициализации Nuxt передаёт в неё контекст ctx
export default ctx => {
  /**
   * По-умолчанию при рендере со стороны сервера заголовки
   * в запросе к бэкенду не отправляются, так что "пробрасываем"
   * заголовки от клиента.
   */
  const ssrMiddleware = setContext((_, { headers }) => {
    if (process.client) return headers
    return {
      headers: {
        ...headers,
        connection: ctx.app.context.req.headers.connection,
        referer: ctx.app.context.req.headers.referer,
        cookie: ctx.app.context.req.headers.cookie
      }
    }
  })

  /**
   * Добавление CSRF-токена к запросу.
   * https://docs.djangoproject.com/en/2.2/ref/csrf/#ajax
   */
  const csrfMiddleware = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'X-CSRFToken': ctx.app.$cookies.get('csrftoken') || null
      }
    }
  })
  const httpLink = new HttpLink({
    uri: 'http://localhost:8000/graphql/',
    credentials: 'include'
  })
  // Middleware в Apollo это примерно тоже самое что и middleware в Django,
  // только на стороне клиента. Объединяем их в цепочку. Последовательность важна.
  const link = from([csrfMiddleware, ssrMiddleware, httpLink])
  // Инициализируем кэш. При должном усердии он может заменить Vuex,
  // но об этом как-нибудь в другой раз
  const cache = new InMemoryCache()

  return {
    link,
    cache,
    // без отключения стандартного apollo-module HttpLink'a в консоль сыпятся варнинги
    defaultHttpLink: false
  }
}
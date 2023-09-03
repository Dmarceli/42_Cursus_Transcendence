import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// import {library} from '@fortawesome/fontawesome-svg-core'
// import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import router from './router'
import VueCookies from 'vue-cookies';
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { createStore } from 'vuex'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  }
})

const store1 = createStore({
  state() {    
     return {
      user_dm: 0    
     }
  },
  mutations: {
    user_dm(state,user_id) {
      state.user_dm = user_id
    }
  }

})

const app = createApp(App)
app.use(router)
app.use(VueCookies)
app.use(vuetify)
app.use(store1)
app.mount('#app')

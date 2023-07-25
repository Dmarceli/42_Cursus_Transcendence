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

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  }
})

const app = createApp(App)
app.use(router)
app.use(VueCookies)
app.use(vuetify)
app.mount('#app')

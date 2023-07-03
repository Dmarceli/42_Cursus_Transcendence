import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// import {library} from '@fortawesome/fontawesome-svg-core'
// import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import router from './router'
import VueCookies from 'vue-cookies';

// library.add()

const app = createApp(App)
app.use(router)
app.use(VueCookies)
app.mount('#app')

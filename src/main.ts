import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'virtual:uno.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowPointer,
  faReply,
  faShare,
  faSquare,
  faCircle,
  faPlay,
  faDrawPolygon,
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'

library.add(faArrowPointer, faReply, faShare, faSquare, faCircle, faPlay, faDrawPolygon)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

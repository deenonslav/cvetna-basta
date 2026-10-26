import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailsView from '@/views/DetailsView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import CartView from '@/views/CartView.vue'
import UserView from '@/views/UserView.vue'

const router = createRouter({
  // Hash režim: prototip radi i kada se otvori kao statički fajl
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Biljke' } },
    { path: '/details/:id', component: DetailsView, meta: { title: 'Detalji' } },
    { path: '/cart', component: CartView, meta: { title: 'Korpa rezervacija' } },
    { path: '/user', component: UserView, meta: { title: 'Profil' } },
    { path: '/login', component: LoginView, meta: { title: 'Prijava' } },
    { path: '/signup', component: SignupView, meta: { title: 'Registracija' } }
  ],
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} :: Cvetna bašta`
  }
})

export default router

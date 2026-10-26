<script setup lang="ts">
import { useRouter } from 'vue-router';
import { UserService, userVersion } from './services/user.service';
import { computed } from 'vue';
import Chatbot from './components/Chatbot.vue';
import { showConfirm } from './utils.ts';

const router = useRouter();

// userVersion se menja pri svakoj izmeni podataka, pa se meni automatski osvežava
const activeUser = computed(() => {
  userVersion.value
  return UserService.getActiveUser()
})

const cartCount = computed(() => {
  userVersion.value
  return activeUser.value?.reservations.filter(r => r.status === 'rezervisano').length ?? 0
})

function logout() {
  showConfirm('Da li ste sigurni da želite da se odjavite?', () => {
    UserService.logout();
    router.push('/login');
  })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-botanic mb-4" data-bs-theme="dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="fa-solid fa-spa" style="color: var(--zb-gold)"></i> Cvetna bašta
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Prikaži meni">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/">
              <i class="fa-solid fa-leaf"></i> Biljke
            </RouterLink>
          </li>

          <li class="nav-item" v-if="activeUser">
            <RouterLink class="nav-link" active-class="active" to="/cart">
              <i class="fa-solid fa-basket-shopping"></i> Korpa rezervacija
              <span class="badge rounded-pill text-bg-warning" v-if="cartCount > 0">{{ cartCount }}</span>
            </RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav mb-2 mb-lg-0">
          <template v-if="activeUser">
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/user">
                <i class="fa-solid fa-user"></i> {{ activeUser.fullName }}
              </RouterLink>
            </li>
            <li class="nav-item">
              <button type="button" class="nav-link" @click="logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Odjava
              </button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/login">
                <i class="fa-solid fa-right-to-bracket"></i> Prijava
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" active-class="active" to="/signup">
                <i class="fa-solid fa-user-plus"></i> Registracija
              </RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container pb-5">
    <RouterView :key="$route.fullPath" />
  </div>

  <Chatbot />

</template>

<script setup lang="ts">
import { activeUser, UserService } from '@/services/user.service'
import { showConfirm, showToast } from '@/utils'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const reservedCount = computed(() =>
    activeUser.value?.orders.filter(o => o.status === 'rezervisano').length ?? 0
)

async function logout() {
    if (await showConfirm('Odjava', 'Da li želite da se odjavite?', 'Odjavi me')) {
        UserService.logout()
        showToast('Odjavljeni ste.', 'info')
        router.push('/')
    }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="fa-solid fa-seedling"></i> Zeleni kutak
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#glavniMeni"
        aria-controls="glavniMeni" aria-expanded="false" aria-label="Otvori meni">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="glavniMeni">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" exact-active-class="active" to="/">
              <i class="fa-solid fa-leaf"></i> Katalog
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/korpa">
              <i class="fa-solid fa-basket-shopping"></i> Korpa
              <span v-if="reservedCount" class="badge rounded-pill text-bg-light ms-1">{{ reservedCount }}</span>
            </RouterLink>
          </li>
        </ul>

        <ul v-if="activeUser" class="navbar-nav align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/profil">
              <i class="fa-solid fa-user"></i> {{ activeUser.firstName }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" @click="logout()">
              <i class="fa-solid fa-right-from-bracket"></i> Odjava
            </button>
          </li>
        </ul>

        <ul v-else class="navbar-nav align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" to="/prijava">
              <i class="fa-solid fa-right-to-bracket"></i> Prijava
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="btn btn-sm btn-light ms-lg-2 mt-2 mt-lg-0" to="/registracija">
              Registracija
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container pb-5">
    <RouterView />
  </main>
</template>
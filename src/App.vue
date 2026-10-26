<script setup lang="ts">
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
            </RouterLink>
          </li>
        </ul>

        <!-- Desno: nalog -->
        <ul class="navbar-nav align-items-lg-center">
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
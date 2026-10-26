<script setup lang="ts">
</script>

<template>
  <nav class="navbar navbar-dark mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="fa-solid fa-seedling"></i> Zeleni kutak
      </RouterLink>
      <span class="navbar-text small d-none d-md-inline">rasadnik i prodavnica biljaka</span>
    </div>
  </nav>

  
  <main class="container pb-5">
    <RouterView />
  </main>
</template>
<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleUnauthorized = () => {
  authStore.user = null;
  router.push({ name: 'Login' });
};

onMounted(() => {
  window.addEventListener('unauthorized', handleUnauthorized);
});

onUnmounted(() => {
  window.removeEventListener('unauthorized', handleUnauthorized);
});
</script>

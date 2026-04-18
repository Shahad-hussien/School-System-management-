<template>
  <aside
    class="w-70 bg-primary-700 text-white flex flex-col shadow-xl min-h-screen"
  >
    <div
      class="p-6 text-2xl font-bold border-b border-primary-900 text-split1-400 text-center"
    >
      نظام إدارة المدرسة
    </div>

    <nav class="flex-1 p-4 space-y-2 mt-4">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-100 hover:bg-primary-900/50 hover:text-white"
        active-class="!bg-split1-600 !text-white shadow-lg"
      >
        <UIcon :name="link.icon" class="w-5 h-5" />
        <span class="text-base">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div
      class="p-4 border-t border-primary-900 text-xs text-center text-gray-300 italic"
    >
      2026 - شهد الزبيدي
    </div>
  </aside>
</template>

<script setup lang="ts">
const links = [
  { label: "لوحة التحكم", to: "/", icon: "i-heroicons-home" },
  { label: "إدارة الطلاب", to: "/students", icon: "i-heroicons-users" },
  {
    label: "السنوات الدراسية",
    to: "/academic-years",
    icon: "i-heroicons-calendar",
  },
  { label: "إدارة الكادر", to: "/teachers", icon: "i-heroicons-academic-cap" },
];
</script>

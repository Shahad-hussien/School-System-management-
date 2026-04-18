<script setup lang="ts">
// استخدام defineModel ميزة رائعة في Vue 3.4+ تربط المتغير مباشرة بدون تعقيد
const isOpen = defineModel<boolean>();

// نستقبل عنوان المودال كـ Prop ليتغير حسب الحاجة (إضافة طالب، سنة، الخ)
defineProps<{
  title: string;
}>();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div class="absolute inset-0"></div>

    <div
      class="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 p-6 relative z-10 flex flex-col max-h-[90vh]"
    >
      <div
        class="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-800 pb-3"
      >
        <h3 class="text-xl font-bold text-split1-400">{{ title }}</h3>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="isOpen = false"
        />
      </div>

      <div class="overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</template>

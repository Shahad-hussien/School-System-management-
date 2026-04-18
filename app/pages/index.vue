<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-extrabold text-primary-900 dark:text-white">
        مرحباً بك في بوابة الإدارة
      </h1>
      <p class="text-gray-500 mt-2">
        يرجى اختيار المرحلة الدراسية للبدء بالإدارة
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      <NuxtLink
        v-for="stage in stages"
        :key="stage.id"
        :to="`/stages/${stage.id}`"
        class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-b-8"
        :style="{ borderColor: stage.color }"
      >
        <div class="flex flex-col items-center text-center space-y-4">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"
            :style="{ backgroundColor: stage.color + '20', color: stage.color }"
          >
            <UIcon :name="stage.icon" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ stage.name }}
          </h2>
          <p class="text-sm text-gray-500">{{ stage.description }}</p>

          <div class="pt-4">
            <UButton
              :color="stage.uiColor as any"
              variant="soft"
              trailing-icon="i-heroicons-arrow-left"
              >دخول للمرحلة</UButton
            >
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const stages = [
  {
    id: "primary",
    name: "المرحلة الابتدائية",
    icon: "i-heroicons-academic-cap",
    color: "#10b981",
    uiColor: "emerald",
    description: "إدارة الصفوف من الأول إلى السادس",
  },
  {
    id: "middle",
    name: "المرحلة المتوسطة",
    icon: "i-heroicons-building-library",
    color: "#3b82f6",
    uiColor: "blue",
    description: "إدارة الصفوف من الأول إلى الثالث",
  },
  {
    id: "high",
    name: "المرحلة الإعدادية",
    icon: "i-heroicons-beaker",
    color: "#8b5cf6",
    uiColor: "purple",
    description: "الرابع، الخامسا، والسادس (علمي/أدبي)",
  },
] as const;
</script>

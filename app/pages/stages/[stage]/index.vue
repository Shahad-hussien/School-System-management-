<template>
  <div class="space-y-8 pb-10">
    <nav
      class="flex text-sm text-gray-500 dark:text-gray-400 gap-2 items-center"
    >
      <NuxtLink to="/" class="hover:text-emerald-600 transition-colors"
        >الرئيسية</NuxtLink
      >
      <UIcon name="i-heroicons-chevron-left" class="rtl:rotate-180" />
      <span class="font-bold text-gray-800 dark:text-white">{{
        stageName
      }}</span>
    </nav>

    <div
      class="mb-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-8"
    >
      <div>
        <h1
          class="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white"
        >
          <UIcon name="i-heroicons-squares-2x2" class="text-emerald-500" />
          لوحة تحكم {{ stageName }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          اختر القسم الذي تود إدارته الآن
        </p>
      </div>

      <UButton
        label="تصدير تقرير سريع"
        icon="i-heroicons-document-arrow-down"
        color="neutral"
        variant="soft"
        class="rounded-xl"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="task in tasks"
        :key="task.to"
        :to="`/stages/${$route.params.stage}/${task.to}`"
        class="bg-white dark:bg-gray-900 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 group"
      >
        <div class="p-8 flex items-start gap-6">
          <div class="flex-shrink-0">
            <UIcon :name="task.icon" class="w-12 h-12 text-emerald-500" />
          </div>

          <div class="space-y-1.5 flex-grow">
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors"
            >
              {{ task.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ task.desc }}
            </p>
          </div>
        </div>

        <div
          class="px-8 py-4 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center border-t border-gray-100 dark:border-gray-800"
        >
          <span class="text-xs font-medium text-gray-400 dark:text-gray-500"
            >إدارة كاملة</span
          >
          <UIcon
            name="i-heroicons-arrow-left"
            class="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors group-hover:translate-x-[-4px] transform"
          />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const stageId = route.params.stage;

// تحويل المعرف لنص مقروء
const stageName = computed(() => {
  if (stageId === "primary") return "المرحلة الابتدائية";
  if (stageId === "middle") return "المرحلة المتوسطة";
  if (stageId === "high") return "المرحلة الإعدادية";
  return "المرحلة";
});

// قمنا بحذف خاصية 'color' من هنا لأننا وحدنا الألوان في التصميم
const tasks = [
  {
    title: "إدارة الطلاب",
    desc: "إضافة، تعديل، وترحيل الطلاب سجلاتهم",
    icon: "i-heroicons-users",
    to: "students",
  },
  {
    title: "المواد الدراسية",
    desc: "توزيع المناهج والكتب حسب الصفوف",
    icon: "i-heroicons-book-open",
    to: "subjects",
  },
  {
    title: "المدرسين",
    desc: "تخصيص الكادر التدريسي لمواد هذه المرحلة",
    icon: "i-heroicons-academic-cap",
    to: "teachers",
  },
];
</script>

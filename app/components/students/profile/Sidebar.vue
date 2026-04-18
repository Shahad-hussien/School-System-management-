<template>
  <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm rounded-2xl">
    <div class="flex flex-col items-center text-center p-2">
      <UAvatar
        :src="student.imageUrl || undefined"
        :alt="student.fullName"
        size="3xl"
        icon="i-heroicons-user"
        class="bg-orange-100 text-orange-500 mb-4 ring-4 ring-white dark:ring-gray-900"
      />
      <h2
        class="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2"
      >
        {{ student.fullName }}
      </h2>

      <UBadge
        :color="currentEnrollment?.status === 'ACTIVE' ? 'success' : 'neutral'"
        variant="subtle"
        size="sm"
        class="rounded-full px-3"
      >
        {{
          currentEnrollment?.status === "ACTIVE"
            ? "مستمر بالدراسة"
            : "غير مستمر"
        }}
      </UBadge>
    </div>

    <UDivider class="my-5 border-gray-100 dark:border-gray-800" />

    <div class="space-y-4 px-2">
      <div class="flex flex-col gap-1">
        <span
          class="text-xs text-gray-400 font-medium flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-academic-cap"
            class="w-4 h-4 text-blue-400"
          />
          الصف الحالي
        </span>
        <span class="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {{ currentEnrollment?.gradeLevel || "غير محدد" }} - شعبة
          {{ currentEnrollment?.section || "أ" }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          class="text-xs text-gray-400 font-medium flex items-center gap-1.5"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4 text-blue-400" />
          هاتف ولي الأمر
        </span>
        <span
          class="font-bold text-gray-800 dark:text-gray-200 text-sm text-right"
          dir="ltr"
        >
          {{ student.parentPhone }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          class="text-xs text-gray-400 font-medium flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-arrow-left-on-rectangle"
            class="w-4 h-4 text-blue-400"
          />
          تاريخ النقل
        </span>
        <span class="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {{ formatDate(student.transferInDate) }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          class="text-xs text-gray-400 font-medium flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-computer-desktop"
            class="w-4 h-4 text-blue-400"
          />
          مسجل بالنظام
        </span>
        <span class="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {{ formatDate(student.createdAt) }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// استلام البيانات من الصفحة الرئيسية
defineProps({
  student: { type: Object, required: true },
  currentEnrollment: { type: Object, default: null },
});

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "غير متوفر";
  return new Date(date).toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

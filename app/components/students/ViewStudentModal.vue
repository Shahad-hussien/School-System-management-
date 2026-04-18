<template>
  <ClientOnly>
    <BaseModal
      :model-value="isOpen"
      @update:model-value="$emit('close')"
      title="البطاقة التعريفية للطالب"
      size="md"
    >
      <div v-if="student" class="p-6 space-y-6">
        <div
          class="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6"
        >
          <UAvatar
            :src="student.imageUrl || undefined"
            :alt="student.fullName"
            size="2xl"
            icon="i-heroicons-user"
            class="bg-orange-100 text-orange-500"
          />
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ student.fullName }}
            </h2>
            <UBadge
              :color="student.status === 'ACTIVE' ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
              class="mt-1"
            >
              {{ student.status === "ACTIVE" ? "مستمر" : "غير مستمر" }}
            </UBadge>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 text-sm">
          <div class="space-y-1">
            <span class="text-gray-500 flex items-center gap-1">
              <UIcon name="i-heroicons-academic-cap" /> الصف
            </span>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ student.gradeLevel }} - شعبة {{ student.section || "أ" }}
            </p>
          </div>

          <div class="space-y-1">
            <span class="text-gray-500 flex items-center gap-1">
              <UIcon name="i-heroicons-phone" /> هاتف ولي الأمر
            </span>
            <p class="font-medium text-gray-900 dark:text-white" dir="ltr">
              {{ student.parentPhone }}
            </p>
          </div>

          <div class="space-y-1">
            <span class="text-gray-500 flex items-center gap-1">
              <UIcon name="i-heroicons-computer-desktop" /> تاريخ التسجيل
              بالنظام
            </span>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formatDate(student.createdAt) }}
            </p>
          </div>

          <div class="space-y-1">
            <span class="text-gray-500 flex items-center gap-1">
              <UIcon name="i-heroicons-calendar-days" /> تاريخ النقل للمدرسة
            </span>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ formatDate(student.transferInDate) }}
            </p>
          </div>
        </div>

        <div
          class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800"
        >
          <UButton
            label="إغلاق"
            color="neutral"
            variant="soft"
            @click="$emit('close')"
          />
          <UButton
            label="عرض الملف الكامل"
            color="primary"
            icon="i-heroicons-document-magnifying-glass"
            class="px-6"
            @click="goToProfile"
          />
        </div>
      </div>
    </BaseModal>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  student: any;
}>();

const emit = defineEmits(["close"]);
const router = useRouter();

// دالة تنسيق التاريخ ليظهر بشكل مفهوم (مثلاً: 25 مارس 2026)
const formatDate = (date: string | Date | undefined) => {
  if (!date) return "غير متوفر";
  return new Date(date).toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const goToProfile = () => {
  if (props.student?.id) {
    emit("close");
    router.push(`/students/profile/${props.student.id}`);
  }
};
</script>

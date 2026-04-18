<template>
  <div class="py-6">
    <div
      class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-8"
    >
      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-right"
          color="neutral"
          variant="ghost"
          class="rounded-full rtl:rotate-180"
          @click="router.back()"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            الملف الشامل للطالب
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            عرض وتعديل تفاصيل السجل الأكاديمي
          </p>
        </div>
      </div>
      <UButton
        label="تصدير السجل الكامل"
        icon="i-heroicons-printer"
        color="primary"
        variant="soft"
        class="rounded-xl"
      />
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-5xl text-primary-400"
      />
    </div>
    <div v-else-if="error || !student" class="text-center py-20">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="text-6xl text-red-500 mb-4"
      />
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
        لم يتم العثور على الطالب
      </h2>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <div class="lg:col-span-1 sticky top-6">
        <StudentsProfileSidebar
          :student="student"
          :current-enrollment="currentEnrollment"
        />
      </div>

      <div class="lg:col-span-3">
        <UCard
          class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm rounded-2xl min-h-[600px] overflow-hidden"
        >
          <UTabs :items="profileTabs" class="w-full" dir="rtl">
            <template #general>
              <StudentsProfileNotesTab
                :current-enrollment="currentEnrollment"
              />
            </template>

            <template #grades>
              <StudentsProfileGradesTab
                :current-enrollment="currentEnrollment"
              />
            </template>
            <template #attendance>
              <StudentsProfileAttendanceTab
                :current-enrollment="currentEnrollment"
              />
            </template>
            <template #documents>
              <StudentsProfileDocumentsTab
                :current-enrollment="currentEnrollment"
              />
            </template>
          </UTabs>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface StudentProfile {
  id: string;
  fullName: string;
  imageUrl: string | null;
  parentPhone: string;
  transferInDate: Date | string;
  createdAt: Date | string;
  enrollments: Array<any>;
}

const route = useRoute();
const router = useRouter();
const yearStore = useYearStore();

const {
  data: student,
  pending,
  error,
} = await useFetch<StudentProfile>(`/api/students/profile/${route.params.id}`, {
  query: { yearId: yearStore.selectedYear?.id },
  watch: [() => yearStore.selectedYear?.id],
});

const profileTabs = [
  {
    label: "لوحة المتابعة",
    slot: "general",
    icon: "i-heroicons-clipboard-document-list",
  },
  { label: "سجل الدرجات", slot: "grades", icon: "i-heroicons-academic-cap" },
  {
    label: "سجل الغيابات",
    slot: "attendance",
    icon: "i-heroicons-calendar-days",
  },
  {
    label: "الوثائق والأرشيف",
    slot: "documents",
    icon: "i-heroicons-folder-open",
  },
];

const currentEnrollment = computed(() => {
  if (
    student.value &&
    student.value.enrollments &&
    student.value.enrollments.length > 0
  ) {
    return student.value.enrollments[0];
  }
  return null;
});
</script>

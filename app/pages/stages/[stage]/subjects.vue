<template>
  <div>
    <UContainer class="py-8">
      <div
        class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-emerald-500">
            منهج {{ stageDisplayName }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            عرض وتوزيع المواد الدراسية لعام {{ yearStore.selectedYear?.name }}
          </p>
        </div>

        <UButton
          label="إضافة مادة جديدة"
          icon="i-heroicons-plus-circle"
          size="lg"
          class="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md rounded-xl"
          @click="isModalOpen = true"
        />
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-5xl text-emerald-400"
        />
      </div>

      <div v-else class="space-y-8">
        <div
          v-if="stageId === 'high'"
          class="flex justify-center md:justify-start"
        >
          <div
            class="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 inline-flex gap-1"
          >
            <UButton
              v-for="tab in branchTabs"
              :key="tab.value"
              :label="tab.label"
              :color="selectedBranch === tab.value ? 'info' : 'neutral'"
              :variant="selectedBranch === tab.value ? 'solid' : 'ghost'"
              class="rounded-xl px-8 transition-all duration-200"
              @click="selectedBranch = tab.value"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="(uniqueSubjects, gradeName) in groupedSubjects"
            :key="gradeName"
            class="ring-1 ring-gray-100 dark:ring-gray-800 shadow-sm hover:shadow-lg transition-all rounded-2xl bg-white dark:bg-gray-900"
            :ui="{
              header: 'p-5 border-b border-gray-100 dark:border-gray-800',
              body: 'p-5',
            }"
          >
            <template #header>
              <h3
                class="font-bold text-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
              >
                <UIcon name="i-heroicons-academic-cap" class="w-6 h-6" />
                الصف {{ gradeName }}
              </h3>
            </template>

            <ul class="space-y-3">
              <li
                v-for="subject in uniqueSubjects"
                :key="subject.id"
                class="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <span class="font-medium text-gray-800 dark:text-gray-200">
                  {{ subject.name }}
                </span>

                <UBadge
                  :color="subject.isActive ? 'success' : 'error'"
                  variant="subtle"
                  size="xs"
                  class="rounded-full px-2.5"
                >
                  {{ subject.isActive ? "مفعل" : "معطل" }}
                </UBadge>
              </li>

              <li
                v-if="uniqueSubjects.length === 0"
                class="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl"
              >
                لا توجد مواد مدرجة
              </li>
            </ul>
          </UCard>
        </div>
      </div>
    </UContainer>

    <BaseModal
      v-model="isModalOpen"
      :title="`إضافة مادة لـ ${stageDisplayName}`"
    >
      <div class="p-6 text-center text-gray-500">فورم الإضافة قريباً...</div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const route = useRoute();
const yearStore = useYearStore();
const stageId = route.params.stage as string; // primary, middle, high
const isModalOpen = ref(false);

// ✨ حالة الفرع المختار (افتراضياً علمي للإعدادية) ✨
const selectedBranch = ref("SCIENTIFIC");

interface Subject {
  id: string;
  name: string;
  stage: string;
  gradeLevel: string;
  branch: string;
  isActive: boolean;
}

// تعريف التبويبات للفرع الإعدادي
const branchTabs = [
  { label: "الفرع العلمي", value: "SCIENTIFIC" },
  { label: "الفرع الأدبي", value: "LITERARY" },
];

// جلب المواد من الـ API (التي زرعناها عبر الـ Seed)
const { data: allSubjects, pending } =
  await useFetch<Subject[]>("/api/subjects");

// 1. فلترة المواد بناءً على المرحلة في الرابط
const stageFilteredSubjects = computed(() => {
  if (!allSubjects.value) return [];
  return allSubjects.value.filter(
    (s) => s.stage.toLowerCase() === stageId.toLowerCase(),
  );
});

// ✨ 2. فلترة ذكية: للابتدائي/المتوسط جلب كل شيء، للإعدادي جلب الفرع المختار فقط ✨
const currentSubjects = computed(() => {
  if (stageId !== "high") return stageFilteredSubjects.value;

  // للمرحلة الإعدادية، نفلتر المواد بناءً على الفرع المختار في التبويبات
  return stageFilteredSubjects.value.filter(
    (s) => s.branch === selectedBranch.value,
  );
});

// تحديد ترتيب كروت الصفوف حسب المرحلة
const gradesOrder = computed(() => {
  if (stageId === "primary")
    return ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
  if (stageId === "middle") return ["الأول", "الثاني", "الثالث"];
  if (stageId === "high") return ["الرابع", "الخامس", "السادس"];
  return [];
});

const stageDisplayName = computed(() => {
  const names: Record<string, string> = {
    primary: "المرحلة الابتدائية",
    middle: "المرحلة المتوسطة",
    high: "المرحلة الإعدادية",
  };
  return names[stageId] || "المرحلة";
});

// ✨ 3. تجميع المواد حسب الصفوف مع حل مشكلة التكرار البصري ✨
const groupedSubjects = computed(() => {
  const groups: Record<string, Subject[]> = {};

  gradesOrder.value.forEach((grade) => {
    // جلب المواد لهذا الصف (التي تم فلترتها بالفرع سابقاً)
    const subjectsInGrade = currentSubjects.value.filter(
      (s) => s.gradeLevel === grade,
    );

    // ✨ حيلة الـ JavaScript للفلترة بصرياً:
    // نقوم بتجميع المواد الفريدة بناءً على "اسم المادة" فقط، لكي لا يظهر اسم "اللغة العربية" مرتين.
    // (برمجياً نأخذ أول مادة نجدها تحمل هذا الاسم لتمثيل المادة بصرياً)
    const uniqueByIdenticalName: Subject[] = [];
    const seenNames = new Set();

    subjectsInGrade.forEach((subject) => {
      if (!seenNames.has(subject.name)) {
        uniqueByIdenticalName.push(subject);
        seenNames.add(subject.name);
      }
    });

    // ترتيب أبجدي للمواد
    groups[grade] = uniqueByIdenticalName.sort((a, b) =>
      a.name.localeCompare(b.name, "ar"),
    );
  });

  return groups;
});
</script>

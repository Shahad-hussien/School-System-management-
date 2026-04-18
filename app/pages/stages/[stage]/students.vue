<template>
  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div>
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <UIcon name="i-heroicons-users" class="text-emerald-500" />
          إدارة طلاب {{ stageName }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          عرض وتصفية سجلات الطلاب المسجلين حالياً
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass-20-solid"
          size="md"
          placeholder="ابحث عن طالب..."
          class="w-full md:w-64"
        />

        <UButton
          icon="i-heroicons-user-plus"
          size="md"
          label="تسجيل طالب جديد"
          class="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-auto justify-center"
          @click="isAddModalOpen = true"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 px-1">
      <UButton
        label="الكل"
        :color="selectedGrade === 'الكل' ? 'primary' : 'neutral'"
        :variant="selectedGrade === 'الكل' ? 'solid' : 'soft'"
        class="rounded-full px-6 transition-all duration-200"
        @click="selectGrade('الكل')"
      />
      <UButton
        v-for="grade in availableGrades"
        :key="grade"
        :label="`الصف ${grade}`"
        :color="selectedGrade === grade ? 'primary' : 'neutral'"
        :variant="selectedGrade === grade ? 'solid' : 'soft'"
        class="rounded-full px-6 transition-all duration-200"
        @click="selectGrade(grade)"
      />
    </div>

    <div
      v-if="selectedGrade !== 'الكل'"
      class="flex flex-wrap items-center gap-2 px-1 mt-2"
    >
      <UButton
        label="الكل"
        :color="selectedSection === 'الكل' ? 'primary' : 'neutral'"
        :variant="selectedSection === 'الكل' ? 'solid' : 'ghost'"
        class="rounded-lg px-5 transition-all duration-200"
        @click="selectedSection = 'الكل'"
      />
      <UButton
        v-for="section in currentGradeSections"
        :key="section"
        :label="`شعبة ${section}`"
        :color="selectedSection === section ? 'primary' : 'neutral'"
        :variant="selectedSection === section ? 'solid' : 'ghost'"
        class="rounded-lg px-5 transition-all duration-200"
        @click="selectedSection = section"
      />
    </div>
    <div v-if="selectedSection !== 'الكل'" class="flex justify-end mt-4 mb-2">
      <div
        class="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1 items-center border border-gray-200 dark:border-gray-700"
      >
        <UButton
          label="قائمة الطلاب"
          icon="i-heroicons-list-bullet"
          :variant="viewMode === 'students' ? 'solid' : 'ghost'"
          :color="viewMode === 'students' ? 'primary' : 'neutral'"
          class="rounded-lg px-4"
          @click="viewMode = 'students'"
        />
        <UButton
          label="سجل الحضور والغياب"
          icon="i-heroicons-calendar-days"
          :variant="viewMode === 'attendance' ? 'solid' : 'ghost'"
          :color="viewMode === 'attendance' ? 'success' : 'neutral'"
          class="rounded-lg px-4 transition-all"
          @click="viewMode = 'attendance'"
        />
      </div>
    </div>

    <div>
      <div v-if="viewMode === 'students'">
        <StudentsTable
          :rows="filteredRows"
          :pending="pending"
          @delete="openDeleteModal"
          @edit="handleEdit"
          @view="handleView"
        />
      </div>

      <div v-else-if="viewMode === 'attendance'" class="mt-4 animate-fade-in">
        <StudentsWeeklyAttendanceTab
          :students="filteredRows"
          @refresh="refresh"
        />
      </div>
    </div>

    <StudentsAddStudentModal
      :is-open="isAddModalOpen"
      :stage-id="stageId"
      :available-grades="availableGrades"
      :year-id="yearStore.selectedYear?.id"
      @close="isAddModalOpen = false"
      @saved="handleStudentSaved"
    />

    <StudentsEditStudentModal
      :is-open="isEditModalOpen"
      :student="studentToEdit"
      :available-grades="availableGrades"
      :year-id="yearStore.selectedYear?.id"
      @close="isEditModalOpen = false"
      @saved="handleStudentUpdated"
    />

    <StudentsDeleteModal
      :is-open="isDeleteModalOpen"
      :student="studentToEdit"
      @close="isDeleteModalOpen = false"
      @deleted="handleDeleted"
    />
    <StudentsViewStudentModal
      :is-open="isViewModalOpen"
      :student="studentToView"
      @close="isViewModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const route = useRoute();
const stageId = route.params.stage as string;
const yearStore = useYearStore();

// --- Modal States ---
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const studentToEdit = ref<any>(null);
// عرض بيانات الطالب states
const isViewModalOpen = ref(false);
const studentToView = ref<any>(null);
// --- Filters State ---
const searchQuery = ref("");
const selectedGrade = ref("الكل");
const selectedSection = ref("الكل");
const viewMode = ref<"students" | "attendance">("students");
// Function to reset section when switching grades
const selectGrade = (grade: string) => {
  selectedGrade.value = grade;
  selectedSection.value = "الكل"; // Reset section
  viewMode.value = "students"; // ✨ إعادة العرض لجدول الطلاب تلقائياً
};

// --- Data Fetching ---
const queryParams = computed(() => ({
  yearId: yearStore.selectedYear?.id,
}));

const {
  data: students,
  pending,
  refresh,
} = useFetch<any[]>(`/api/students/stage/${stageId}`, {
  key: `students-list-${stageId}`,
  query: queryParams,
  watch: [queryParams],
  default: () => [],
});

// --- Dynamic Sections Logic ---
// This scans the students in the selected grade and generates buttons for their sections
const currentGradeSections = computed(() => {
  if (selectedGrade.value === "الكل") return [];

  const list = students.value || [];
  const studentsInGrade = list.filter(
    (s) => s.gradeLevel === selectedGrade.value,
  );

  // Extract unique sections and sort them alphabetically
  const uniqueSections = [
    ...new Set(studentsInGrade.map((s) => s.section || "أ")),
  ];
  return uniqueSections.sort((a, b) => a.localeCompare(b, "ar"));
});

// --- Modal Handlers ---
const openDeleteModal = (student: any) => {
  studentToEdit.value = student;
  isDeleteModalOpen.value = true;
};

const handleDeleted = () => {
  isDeleteModalOpen.value = false;
  refresh();
};

const handleEdit = (student: any) => {
  studentToEdit.value = student;
  isEditModalOpen.value = true;
};

const handleStudentUpdated = async () => {
  isEditModalOpen.value = false;
  await refresh();
};

const handleStudentSaved = async () => {
  isAddModalOpen.value = false;
  await refresh();
};

const handleView = (student: any) => {
  studentToView.value = student;
  isViewModalOpen.value = true;
};

// --- Smart Filtering & Sorting ---
const filteredRows = computed(() => {
  let list = students.value || [];

  // 1. Filter by Grade
  if (selectedGrade.value !== "الكل") {
    list = list.filter((s) => s.gradeLevel === selectedGrade.value);
  }

  // 2. Filter by Section
  if (selectedSection.value !== "الكل") {
    list = list.filter((s) => s.section === selectedSection.value);
  }

  // 3. Filter by Search Query
  if (searchQuery.value) {
    list = list.filter((s) => s.fullName.includes(searchQuery.value));
  }

  // 4. Sort: Section first (أ -> ب), then Name alphabetically
  list.sort((a, b) => {
    if (a.section !== b.section) {
      return (a.section || "").localeCompare(b.section || "", "ar");
    }
    return (a.fullName || "").localeCompare(b.fullName || "", "ar");
  });

  return list;
});

// --- Stage Settings ---
const availableGrades = computed(() => {
  const grades: Record<string, string[]> = {
    primary: ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"],
    middle: ["الأول", "الثاني", "الثالث"],
    high: ["الرابع", "الخامس", "السادس"],
  };
  return grades[stageId] || [];
});

const stageName = computed(() => {
  const names: Record<string, string> = {
    primary: "الابتدائية",
    middle: "المتوسطة",
    high: "الإعدادية",
  };
  return names[stageId] || "المرحلة";
});
</script>

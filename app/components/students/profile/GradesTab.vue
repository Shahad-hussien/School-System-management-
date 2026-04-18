<template>
  <div class="p-6" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8"
    >
      <div>
        <h3
          class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2"
        >
          <UIcon name="i-heroicons-academic-cap" class="text-emerald-500" />
          سجل الدرجات
        </h3>
        <p class="text-sm text-gray-500 font-medium">
          إدخال وتعديل درجات الطالب للمواد المخصصة لصفه وفرعه.
        </p>
      </div>

      <div
        class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3"
      >
        <UIcon
          name="i-heroicons-information-circle"
          class="w-6 h-6 text-emerald-500 shrink-0"
        />
        <span class="text-sm font-bold text-emerald-700 dark:text-emerald-300">
          اضغط على أي خلية فارغة (-) لإضافة درجة، أو اضغط على الرقم
          لتعديله/حذفه.
        </span>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-5xl text-emerald-400"
      />
    </div>

    <div
      v-else
      class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-x-auto shadow-sm bg-white dark:bg-gray-900"
    >
      <UTable :columns="columns" :data="gradebook || []" class="min-w-[700px]">
        <template #subjectName-cell="{ row }">
          <span class="font-bold text-gray-800 dark:text-gray-200">{{
            row.original.subjectName
          }}</span>
        </template>

        <template #firstTermMonth1-cell="{ row }">
          <button
            @click="
              openGradeModal(
                row.original,
                'firstTermMonth1',
                'الشهر الأول (الفصل الأول)',
              )
            "
            :class="cellClass(row.original.firstTermMonth1)"
          >
            {{ row.original.firstTermMonth1 ?? "-" }}
          </button>
        </template>

        <template #firstTermMonth2-cell="{ row }">
          <button
            @click="
              openGradeModal(
                row.original,
                'firstTermMonth2',
                'الشهر الثاني (الفصل الأول)',
              )
            "
            :class="cellClass(row.original.firstTermMonth2)"
          >
            {{ row.original.firstTermMonth2 ?? "-" }}
          </button>
        </template>

        <template #secondTermMonth1-cell="{ row }">
          <button
            @click="
              openGradeModal(
                row.original,
                'secondTermMonth1',
                'الشهر الأول (الفصل الثاني)',
              )
            "
            :class="[
              cellClass(row.original.secondTermMonth1),
              'bg-slate-50 dark:bg-slate-800/30',
            ]"
          >
            {{ row.original.secondTermMonth1 ?? "-" }}
          </button>
        </template>

        <template #secondTermMonth2-cell="{ row }">
          <button
            @click="
              openGradeModal(
                row.original,
                'secondTermMonth2',
                'الشهر الثاني (الفصل الثاني)',
              )
            "
            :class="[
              cellClass(row.original.secondTermMonth2),
              'bg-slate-50 dark:bg-slate-800/30',
            ]"
          >
            {{ row.original.secondTermMonth2 ?? "-" }}
          </button>
        </template>
      </UTable>
    </div>

    <UDivider class="my-10" label="وثائق الشهادات والنتائج النهائية" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard
        class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-900"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <h4
              class="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white"
            >
              <UIcon name="i-heroicons-document-text" class="text-blue-500" />
              شهادة نصف السنة
            </h4>
            <UBadge color="neutral" variant="soft">لم تُرفع بعد</UBadge>
          </div>
        </template>

        <div
          class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
        >
          <UIcon
            name="i-heroicons-cloud-arrow-up"
            class="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors mb-3"
          />
          <span class="text-sm font-bold text-gray-600 dark:text-gray-300"
            >اضغط هنا لرفع صورة الشهادة</span
          >
          <span class="text-xs text-gray-400 mt-1"
            >PNG, JPG (الحد الأقصى 5MB)</span
          >
        </div>
      </UCard>

      <UCard
        class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-900"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <h4
              class="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white"
            >
              <UIcon name="i-heroicons-academic-cap" class="text-emerald-500" />
              شهادة أخير السنة
            </h4>
            <USelectMenu
              v-model="finalState"
              :options="['غير محدد', 'ناجح', 'مكمل', 'راسب']"
              class="w-28"
              size="sm"
            />
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div
            class="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300"
                >صورة الدور الأول</span
              >
            </div>
            <UButton
              size="xs"
              color="success"
              variant="soft"
              icon="i-heroicons-arrow-up-tray"
              >رفع</UButton
            >
          </div>

          <div
            class="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300"
                >صورة الدور الثاني</span
              >
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-heroicons-arrow-up-tray"
              >رفع</UButton
            >
          </div>

          <div
            class="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300"
                >صورة الدور الثالث</span
              >
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-heroicons-arrow-up-tray"
              >رفع</UButton
            >
          </div>
        </div>
      </UCard>
    </div>

    <ClientOnly>
      <BaseModal
        :model-value="isModalOpen"
        @update:model-value="isModalOpen = false"
        :title="`إدخال درجة: ${selectedSubject?.subjectName}`"
      >
        <div class="p-5" dir="rtl">
          <div class="mb-4 text-center">
            <span
              class="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold mb-4"
            >
              {{ selectedExamName }}
            </span>
          </div>

          <div class="flex justify-center mb-6">
            <input
              v-model="gradeInput"
              type="number"
              min="0"
              max="100"
              class="w-32 h-20 text-center text-4xl font-black rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-0 focus:border-emerald-500 outline-none transition-all"
              placeholder="--"
            />
          </div>

          <div
            class="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800"
          >
            <UButton
              v-if="originalGradeValue !== null"
              label="مسح الدرجة"
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="saveGrade(null)"
            />
            <div v-else></div>

            <div class="flex gap-2">
              <UButton
                label="إلغاء"
                color="neutral"
                variant="soft"
                @click="isModalOpen = false"
              />
              <UButton
                label="حفظ الدرجة"
                color="success"
                @click="saveGrade(Number(gradeInput))"
              />
            </div>
          </div>
        </div>
      </BaseModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const { showSuccess, showError } = useAppToast();

const props = defineProps<{
  currentEnrollment: { id: string };
}>();

const {
  data: gradebook,
  pending,
  refresh,
} = await useFetch<any[]>(
  `/api/students/profile/grades/${props.currentEnrollment.id}`,
);

// ✨ تم إزالة نصف السنة والنهائي من الأعمدة ✨
const columns = [
  { accessorKey: "subjectName", header: "المادة الدراسية" },
  { accessorKey: "firstTermMonth1", header: "ش1 (فصل 1)" },
  { accessorKey: "firstTermMonth2", header: "ش2 (فصل 1)" },
  { accessorKey: "secondTermMonth1", header: "ش1 (فصل 2)" },
  { accessorKey: "secondTermMonth2", header: "ش2 (فصل 2)" },
];

const cellClass = (val: number | null) => {
  const base =
    "w-full h-full min-h-[40px] px-2 py-1 rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center font-bold text-lg";
  if (val === null)
    return `${base} text-gray-300 dark:text-gray-600 hover:text-emerald-500`;
  if (val < 50) return `${base} text-red-500`;
  return `${base} text-emerald-600 dark:text-emerald-400`;
};

const isModalOpen = ref(false);
const selectedSubject = ref<any>(null);
const selectedField = ref<string>("");
const selectedExamName = ref<string>("");
const gradeInput = ref<number | "">("");
const originalGradeValue = ref<number | null>(null);

// حالة وهمية لشهادة أخير السنة
const finalState = ref("غير محدد");

const openGradeModal = (row: any, field: string, examName: string) => {
  selectedSubject.value = row;
  selectedField.value = field;
  selectedExamName.value = examName;
  originalGradeValue.value = row[field];
  gradeInput.value = row[field] !== null ? row[field] : "";
  isModalOpen.value = true;
};

const saveGrade = async (value: number | null) => {
  // 1. التحقق من صحة الإدخال (إذا لم يكن null أي مسح)
  if (value !== null && (value < 0 || value > 100)) {
    showError("قيمة غير صالحة", "الدرجة يجب أن تكون رقماً بين 0 و 100");
    return;
  }

  try {
    // 2. إرسال البيانات للـ API السحري الخاص بنا
    await $fetch("/api/students/profile/grades/save", {
      method: "POST",
      body: {
        enrollmentId: props.currentEnrollment.id,
        subjectId: selectedSubject.value.subjectId,
        field: selectedField.value, // مثل: 'firstTermMonth1'
        value: value,
      },
    });

    // 3. تحديث الواجهة فوراً (Reactivity) لكي تظهر الدرجة أمام المستخدم بلحظتها
    selectedSubject.value[selectedField.value] = value;

    // إغلاق المودال وإظهار رسالة النجاح
    isModalOpen.value = false;

    if (value === null) {
      showSuccess("تم المسح", "تم حذف الدرجة من السجل بنجاح");
    } else {
      showSuccess("تم الحفظ", `تم حفظ درجة ${value} بنجاح`);
    }
  } catch (error) {
    showError("خطأ", "تعذر الاتصال بقاعدة البيانات لحفظ الدرجة");
  }
};
</script>

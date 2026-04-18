<template>
  <div class="p-6" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8"
    >
      <div>
        <h3
          class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2"
        >
          <UIcon name="i-heroicons-calendar-days" class="text-emerald-500" />
          سجل غيابات الطالب
        </h3>
        <p class="text-sm text-gray-500 font-medium">
          إدارة وتوثيق أيام الغياب (العام الحالي)
        </p>
      </div>

      <div class="flex gap-4">
        <div
          class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl min-w-[120px] text-center"
        >
          <span
            class="block text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1"
            >بعذر</span
          >
          <span
            class="text-2xl font-black text-emerald-700 dark:text-emerald-300"
            >{{ excusedCount }}</span
          >
        </div>
        <div
          class="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl min-w-[120px] text-center"
        >
          <span
            class="block text-xs text-slate-500 dark:text-slate-400 font-bold mb-1"
            >بدون عذر</span
          >
          <span
            class="text-2xl font-black text-slate-700 dark:text-slate-200"
            >{{ unexcusedCount }}</span
          >
        </div>
      </div>
    </div>

    <UCard
      class="mb-8 ring-1 ring-emerald-100 dark:ring-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-900/5 shadow-none rounded-2xl"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2"
            >تاريخ الغياب</label
          >
          <input
            v-model="form.date"
            type="date"
            class="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2">نوع الغياب</label>
          <select
            v-model="form.type"
            class="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="UNEXCUSED">بدون عذر</option>
            <option value="EXCUSED">بعذر</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2"
            >السبب (اختياري)</label
          >
          <input
            v-model="form.reason"
            placeholder="مثال: ظرف عائلي"
            class="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        <UButton
          label="تسجيل الغياب"
          color="primary"
          class="rounded-xl h-10 px-6"
          icon="i-heroicons-check-circle"
          :loading="isSubmitting"
          @click="submitAbsence"
        />
      </div>
    </UCard>

    <div
      class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900"
    >
      <UTable :columns="columns" :data="localAbsences">
        <template #date-cell="{ row }">
          <span
            class="font-medium text-gray-700 dark:text-gray-300"
            dir="ltr"
            >{{ new Date(row.original.date).toLocaleDateString("ar-IQ") }}</span
          >
        </template>
        <template #type-cell="{ row }">
          <UBadge
            :color="row.original.type === 'EXCUSED' ? 'success' : 'info'"
            variant="subtle"
            class="rounded-full px-3"
          >
            {{ row.original.type === "EXCUSED" ? "بعذر" : "بدون عذر" }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-pencil-square"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="startEdit(row.original)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="xs"
              color="error"
              variant="ghost"
              @click="openDeleteModal(row.original.id)"
            />
          </div>
        </template>
      </UTable>

      <div v-if="localAbsences.length === 0" class="text-center py-12">
        <UIcon
          name="i-heroicons-check-badge"
          class="w-12 h-12 text-emerald-200 mb-2"
        />
        <p class="text-gray-400 text-sm font-medium">لا توجد غيابات مسجلة.</p>
      </div>
    </div>

    <ClientOnly>
      <BaseModal
        :model-value="isEditModalOpen"
        @update:model-value="isEditModalOpen = false"
        title="تعديل سجل الغياب"
      >
        <div class="p-5 space-y-5" dir="rtl">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-600 dark:text-gray-300"
              >تاريخ الغياب</label
            >
            <input
              v-model="editForm.date"
              type="date"
              class="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-600 dark:text-gray-300"
              >نوع الغياب</label
            >
            <select
              v-model="editForm.type"
              class="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="UNEXCUSED">بدون عذر</option>
              <option value="EXCUSED">بعذر</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-600 dark:text-gray-300"
              >السبب</label
            >
            <input
              v-model="editForm.reason"
              placeholder="أدخل السبب إن وجد..."
              class="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div
            class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2"
          >
            <UButton
              label="إلغاء"
              color="neutral"
              variant="soft"
              @click="isEditModalOpen = false"
            />
            <UButton
              label="حفظ التعديلات"
              color="primary"
              :loading="isUpdating"
              @click="updateAbsence"
            />
          </div>
        </div>
      </BaseModal>
    </ClientOnly>

    <ClientOnly>
      <BaseModal
        :model-value="isDeleteModalOpen"
        @update:model-value="isDeleteModalOpen = false"
        title="تنبيه: حذف سجل غياب"
      >
        <div class="p-4 space-y-4">
          <div
            class="flex items-start gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-6 h-6 shrink-0 mt-0.5"
            />
            <div>
              <p class="text-sm font-bold mb-1">
                هل أنت متأكد من حذف هذا اليوم من سجل الغياب؟
              </p>
              <p class="text-xs text-red-500">
                لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
          </div>
          <div
            class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800"
          >
            <UButton
              label="تراجع"
              color="neutral"
              variant="soft"
              @click="isDeleteModalOpen = false"
            />
            <UButton
              label="نعم، احذف"
              color="error"
              :loading="isDeleting"
              @click="confirmDelete"
            />
          </div>
        </div>
      </BaseModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";

const { showSuccess, showError, showInfo } = useAppToast();

interface Absence {
  id: string;
  date: string | Date;
  type: "EXCUSED" | "UNEXCUSED";
  reason?: string;
}

const props = defineProps<{
  currentEnrollment: { id: string; absences: Absence[] };
}>();

const localAbsences = ref<Absence[]>([
  ...(props.currentEnrollment?.absences || []),
]);

watch(
  () => props.currentEnrollment?.absences,
  (newAbsences) => {
    localAbsences.value = [...(newAbsences || [])];
  },
  { deep: true },
);

// حالات التحميل والمودال
const isSubmitting = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const editingId = ref<string | null>(null);
const absenceIdToDelete = ref<string | null>(null);

// فورم الإضافة
const form = reactive({
  date: new Date().toISOString().substr(0, 10),
  type: "UNEXCUSED" as "EXCUSED" | "UNEXCUSED",
  reason: "",
});

// فورم التعديل (مستقل تماماً)
const editForm = reactive({
  date: "",
  type: "UNEXCUSED" as "EXCUSED" | "UNEXCUSED",
  reason: "",
});

const columns = [
  { accessorKey: "date", header: "التاريخ" },
  { accessorKey: "type", header: "النوع" },
  { accessorKey: "reason", header: "السبب" },
  { accessorKey: "actions", header: "إجراءات" },
];

const isDateDuplicate = (newDate: string, excludeId?: string | null) => {
  return localAbsences.value.some((a) => {
    const existingDate = new Date(a.date).toISOString().substr(0, 10);
    return existingDate === newDate && a.id !== excludeId;
  });
};

const submitAbsence = async () => {
  if (!props.currentEnrollment?.id) return;
  if (isDateDuplicate(form.date)) {
    showInfo("تاريخ مكرر", "هذا التاريخ مسجل بالفعل في غيابات الطالب.");
    return;
  }

  isSubmitting.value = true;
  try {
    const newAbsence = await $fetch<Absence>(
      "/api/students/profile/attendance",
      {
        method: "POST",
        body: { enrollmentId: props.currentEnrollment.id, ...form },
      },
    );

    localAbsences.value = [newAbsence, ...localAbsences.value];
    showSuccess("تم التسجيل", "تم إضافة الغياب للسجل.");

    form.reason = "";
    form.date = new Date().toISOString().substr(0, 10);
  } catch (error) {
    showError("خطأ", "فشل تسجيل الغياب.");
  } finally {
    isSubmitting.value = false;
  }
};

const openDeleteModal = (id: string) => {
  absenceIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!absenceIdToDelete.value) return;
  isDeleting.value = true;
  try {
    await $fetch(
      `/api/students/profile/attendance/${absenceIdToDelete.value}`,
      { method: "DELETE" },
    );

    localAbsences.value = localAbsences.value.filter(
      (a) => a.id !== absenceIdToDelete.value,
    );

    showSuccess("تم الحذف", "تم مسح السجل بنجاح.");
    isDeleteModalOpen.value = false;
  } catch (e) {
    showError("فشل", "تعذر الحذف.");
  } finally {
    isDeleting.value = false;
  }
};

// ✏️ دالة فتح مودال التعديل وتعبئة البيانات
const startEdit = (absence: Absence) => {
  editingId.value = absence.id;
  editForm.date = new Date(absence.date).toISOString().substr(0, 10);
  editForm.type = absence.type;
  editForm.reason = absence.reason || "";
  isEditModalOpen.value = true;
};

// ✏️ دالة حفظ التعديلات من المودال
const updateAbsence = async () => {
  if (isDateDuplicate(editForm.date, editingId.value)) {
    showInfo("تاريخ مكرر", "لا يمكن تغيير التاريخ لتاريخ مسجل مسبقاً.");
    return;
  }

  isUpdating.value = true;
  try {
    const updated = await $fetch<Absence>(
      `/api/students/profile/attendance/${editingId.value}`,
      {
        method: "PATCH",
        body: editForm,
      },
    );

    localAbsences.value = localAbsences.value.map((a) =>
      a.id === editingId.value ? updated : a,
    );

    showSuccess("تم التحديث", "تم تعديل بيانات الغياب.");
    isEditModalOpen.value = false;
  } catch (e) {
    showError("فشل", "لم يتم التعديل.");
  } finally {
    isUpdating.value = false;
  }
};

const excusedCount = computed(
  () => localAbsences.value.filter((a) => a.type === "EXCUSED").length,
);
const unexcusedCount = computed(
  () => localAbsences.value.filter((a) => a.type === "UNEXCUSED").length,
);
</script>

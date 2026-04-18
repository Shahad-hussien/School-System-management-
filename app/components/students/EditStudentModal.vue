<template>
  <ClientOnly>
    <BaseModal
      :model-value="isOpen"
      @update:model-value="emit('close')"
      title="تعديل بيانات الطالب"
      size="xl"
    >
      <form @submit.prevent="handleUpdate" class="space-y-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormGroup label="اسم الطالب الرباعي" required>
            <UInput
              v-model="form.fullName"
              placeholder="الاسم الكامل كما في الهوية"
              icon="i-heroicons-user"
            />
          </UFormGroup>

          <UFormGroup label="رقم هاتف ولي الأمر" required>
            <UInput
              v-model="form.parentPhone"
              placeholder="07XXXXXXXXX"
              icon="i-heroicons-phone"
              maxlength="11"
            />
          </UFormGroup>

          <UFormGroup label="الصف الدراسي" required>
            <select
              v-model="form.gradeLevel"
              :class="selectClasses"
              class="custom-select-bg"
            >
              <option value="" disabled class="bg-white dark:bg-gray-900">
                اختر الصف...
              </option>
              <option
                v-for="grade in availableGrades"
                :key="grade"
                :value="grade"
                class="bg-white dark:bg-gray-900"
              >
                {{ grade }}
              </option>
            </select>
          </UFormGroup>

          <UFormGroup label="الشعبة" required>
            <UInput
              v-model="form.section"
              placeholder="مثال: أ، ب، ج"
              icon="i-heroicons-user-group"
            />
          </UFormGroup>

          <UFormGroup label="تاريخ النقل للمدرسة" required>
            <UInput
              v-model="form.transferInDate"
              type="date"
              icon="i-heroicons-calendar"
            />
          </UFormGroup>

          <UFormGroup label="تاريخ النقل من المدرسة (إن وُجد)">
            <UInput
              v-model="form.transferOutDate"
              type="date"
              icon="i-heroicons-calendar"
            />
          </UFormGroup>

          <UFormGroup label="الحالة" required>
            <select
              v-model="form.status"
              :class="selectClasses"
              class="custom-select-bg"
            >
              <option value="ACTIVE" class="bg-white dark:bg-gray-900">
                مستمر (Active)
              </option>
              <option value="INACTIVE" class="bg-white dark:bg-gray-900">
                غير مستمر (Inactive)
              </option>
            </select>
          </UFormGroup>
        </div>

        <div
          class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800"
        >
          <UButton
            label="إلغاء"
            color="neutral"
            variant="soft"
            @click="emit('close')"
          />
          <UButton
            type="submit"
            label="حفظ التعديلات"
            color="primary"
            class="px-8"
            :loading="isSaving"
            icon="i-heroicons-check-circle"
          />
        </div>
      </form>
    </BaseModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  student: any;
  availableGrades: string[];
  yearId: string | undefined;
}>();

const emit = defineEmits(["close", "saved"]);
const toast = useToast();
const isSaving = ref(false);

const selectClasses =
  "w-full h-9 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors duration-200 cursor-pointer appearance-none text-gray-900 dark:text-white";

const form = reactive({
  fullName: "",
  parentPhone: "",
  gradeLevel: "",
  section: "أ",
  status: "ACTIVE",
  transferInDate: "", // الحقل الجديد
  transferOutDate: "", // الحقل الجديد
});

watch(
  () => props.student,
  (newStudent) => {
    if (newStudent) {
      // نأخذ نسخة من الطالب لسهولة الوصول
      const s = newStudent as any;

      form.fullName = s.fullName || "";
      form.parentPhone = s.parentPhone || "";
      form.gradeLevel = s.gradeLevel || "";
      form.section = s.section || "أ";
      form.status = s.status || "ACTIVE";

      // نستخدم الـ Casting لضمان أن النتيجة string دائماً
      form.transferInDate = (
        s.transferInDate
          ? new Date(s.transferInDate).toISOString().split("T")[0]
          : ""
      ) as string;

      form.transferOutDate = (
        s.transferOutDate
          ? new Date(s.transferOutDate).toISOString().split("T")[0]
          : ""
      ) as string;
    }
  },
  { immediate: true },
);

const handleUpdate = async () => {
  if (!props.student?.id) return;

  // التحقق من الحقول الإجبارية (بما فيها تاريخ النقل للمدرسة)
  if (
    !form.fullName ||
    !form.gradeLevel ||
    !form.parentPhone ||
    !form.section ||
    !form.transferInDate
  ) {
    toast.add({
      title: "خطأ في الإدخال",
      description: "يرجى تعبئة جميع الحقول المطلوبة.",
      color: "error",
    });
    return;
  }

  const phoneRegex = /^[0-9]{11}$/;
  if (!phoneRegex.test(form.parentPhone)) {
    toast.add({
      title: "رقم هاتف غير صالح",
      description: "يجب أن يتكون رقم الهاتف من 11 رقماً بالضبط.",
      color: "error",
    });
    return;
  }

  isSaving.value = true;
  try {
    await $fetch(`/api/students/${props.student.id}`, {
      method: "PUT",
      body: {
        fullName: form.fullName,
        parentPhone: form.parentPhone,
        gradeLevel: form.gradeLevel,
        section: form.section,
        status: form.status,
        yearId: props.yearId,
        transferInDate: form.transferInDate, // إرسال التاريخ
        transferOutDate: form.transferOutDate || null, // إرسال التاريخ أو null
      },
    });

    toast.add({
      title: "تم التعديل",
      description: "تم تحديث بيانات الطالب بنجاح",
      color: "success",
    });

    emit("saved");
  } catch (error: any) {
    toast.add({
      title: "خطأ",
      description: error.statusMessage || "فشل تحديث البيانات",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.custom-select-bg {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: left 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-left: 2.5rem;
}
</style>

<template>
  <ClientOnly>
    <BaseModal
      :model-value="isOpen"
      @update:model-value="emit('close')"
      title="تسجيل طالب جديد"
      size="xl"
    >
      <form @submit.prevent="handleSave" class="space-y-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UFormGroup label="اسم الطالب الرباعي" required>
            <UInput
              v-model="form.fullName"
              placeholder="اسم الطالب/ة"
              icon="i-heroicons-user"
            />
          </UFormGroup>

          <UFormGroup label="اسم الأم " required>
            <UInput
              v-model="form.motherName"
              placeholder="اسم الأم"
              icon="i-heroicons-user-circle"
            />
          </UFormGroup>

          <UFormGroup label="تاريخ الميلاد" required>
            <label class="text-sm">تاريخ الميلاد:</label>
            <UInput
              v-model="form.birthDate"
              placeholder="تاريخ الميلاد"
              type="date"
              class="mt-2"
            />
          </UFormGroup>

          <UFormGroup label="رقم هاتف ولي الأمر" required>
            <label class="text-sm">رقم هاتف ولي الامر:</label>
            <UInput
              v-model="form.parentPhone"
              placeholder="07XXXXXXXXX"
              icon="i-heroicons-phone"
              maxlength="11"
              class="mt-2"
            />
          </UFormGroup>

          <UFormGroup label="الجنس" required>
            <select
              v-model="form.gender"
              :class="selectClasses"
              class="custom-select-bg"
            >
              <option value="MALE" class="bg-white dark:bg-gray-900">
                ذكر
              </option>
              <option value="FEMALE" class="bg-white dark:bg-gray-900">
                أنثى
              </option>
            </select>
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

          <UFormGroup v-if="stageId === 'high'" label="الفرع الدراسي" required>
            <select
              v-model="form.branch"
              :class="selectClasses"
              class="custom-select-bg"
            >
              <option value="GENERAL" class="bg-white dark:bg-gray-900">
                عام
              </option>
              <option value="SCIENTIFIC" class="bg-white dark:bg-gray-900">
                علمي
              </option>
              <option value="LITERARY" class="bg-white dark:bg-gray-900">
                أدبي
              </option>
            </select>
          </UFormGroup>

          <UFormGroup label="حالة الإعاقة (إن وجدت)">
            <label class="text-sm">حالة صحية:</label>
            <UInput
              v-model="form.disabilityType"
              placeholder="اتركه فارغاً إذا لا يوجد"
              icon="i-heroicons-shield-exclamation"
              class="mt-2"
            />
          </UFormGroup>
          <UFormGroup label="تاريخ النقل للمدرسة" required>
            <label class="text-sm">تاريخ النقل:</label>
            <UInput
              v-model="form.transferInDate"
              type="date"
              icon="i-heroicons-calendar"
            />
          </UFormGroup>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
        >
          <UFormGroup label="صورة الطالب الشخصية">
            <label class="text-sm"> صورة الطالب/ة:</label>
            <UInput
              type="file"
              accept="image/*"
              icon="i-heroicons-photo"
              class="mt-2"
            />
          </UFormGroup>

          <UFormGroup label="صورة وثيقة الطالب (الهوية)">
            <label class="text-sm">وثيقة الطالب/ة :</label>
            <UInput
              type="file"
              accept="image/*"
              icon="i-heroicons-document-text"
              class="mt-2"
            />
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
            label="إكمال عملية التسجيل"
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
import { ref, reactive } from "vue";

const props = defineProps<{
  isOpen: boolean;
  stageId: string;
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
  motherName: "",
  birthDate: "",
  gender: "MALE" as const,
  gradeLevel: "",
  section: "أ", // القيمة الافتراضية
  parentPhone: "",
  disabilityType: "",
  branch: "GENERAL" as const,
  imageUrl: "",
  documentUrl: "",
  transferInDate: "",
});

const handleSave = async () => {
  // 1. التحقق من السنة الدراسية
  if (!props.yearId) {
    toast.add({
      title: "تنبيه",
      description: "يرجى اختيار السنة الدراسية!",
      color: "warning",
    });
    return;
  }

  // 2. التحقق من الحقول الإجبارية
  if (
    !form.fullName ||
    !form.motherName ||
    !form.gradeLevel ||
    !form.parentPhone ||
    !form.section ||
    !form.birthDate ||
    !form.transferInDate
  ) {
    toast.add({
      title: "خطأ في الإدخال",
      description: "يرجى تعبئة جميع الحقول المطلوبة الأساسية.",
      color: "error",
    });
    return;
  }

  // 3. التحقق من رقم الهاتف (11 رقم فقط)
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
    await $fetch("/api/students", {
      method: "POST",
      body: {
        ...form,
        yearId: props.yearId,
        stage: props.stageId.toUpperCase(),
      },
    });

    toast.add({
      title: "تم التسجيل",
      description: `تمت إضافة الطالب ${form.fullName} بنجاح`,
      color: "success",
    });

    resetForm();
    emit("saved");
  } catch (error: any) {
    toast.add({
      title: "خطأ",
      description: error.statusMessage || "فشلت العملية",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    fullName: "",
    motherName: "",
    birthDate: "",
    gender: "MALE",
    gradeLevel: "",
    section: "أ", // إعادة التصفير للقيمة الافتراضية
    parentPhone: "",
    disabilityType: "",
    branch: "GENERAL",
    imageUrl: "",
    documentUrl: "",
  });
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

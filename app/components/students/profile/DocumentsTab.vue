<template>
  <div class="p-6" dir="rtl">
    <div
      class="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8"
    >
      <div>
        <h3
          class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2"
        >
          <UIcon name="i-heroicons-folder-open" class="text-blue-500" />
          أرشيف الوثائق والمستندات
        </h3>
        <p class="text-sm text-gray-500 font-medium">
          إدارة الهويات، البطاقات، والوثائق الرسمية الخاصة بالطالب.
        </p>
      </div>
    </div>

    <UCard
      class="mb-8 ring-1 ring-blue-100 dark:ring-blue-900/30 bg-blue-50/20 dark:bg-blue-900/5 shadow-none rounded-2xl"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2"
            >عنوان الوثيقة</label
          >
          <input
            v-model="form.title"
            placeholder="مثال: هوية الأحوال المدنية"
            class="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2"
            >نوع الوثيقة</label
          >
          <select
            v-model="form.type"
            class="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
          >
            <option value="ID">هوية / جنسية</option>
            <option value="MEDICAL">تقرير طبي</option>
            <option value="CERTIFICATE">شهادة سابقة</option>
            <option value="OTHER">أخرى</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-gray-500 mr-2"
            >الملف المرفق</label
          >
          <div class="relative">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*,.pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              class="w-full h-10 px-3 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              <UIcon name="i-heroicons-paper-clip" class="w-4 h-4" />
              <span class="truncate max-w-[150px]">{{
                selectedFileName || "اختر ملفاً (صورة أو PDF)"
              }}</span>
            </div>
          </div>
        </div>

        <UButton
          label="رفع وحفظ"
          color="info"
          icon="i-heroicons-cloud-arrow-up"
          class="rounded-xl h-10 font-bold justify-center"
          :loading="isUploading"
          :disabled="!form.title.trim() || !selectedFile"
          @click="uploadDocument"
        />
      </div>
    </UCard>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-4xl text-blue-400"
      />
    </div>

    <div
      v-else-if="documents?.length === 0"
      class="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl"
    >
      <UIcon
        name="i-heroicons-document-magnifying-glass"
        class="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600"
      />
      <p class="text-gray-500 font-medium">
        لا توجد وثائق مرفوعة لهذا الطالب حتى الآن.
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
      >
        <div
          class="h-32 bg-gray-50 dark:bg-gray-800 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <img
            v-if="doc.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i)"
            :src="doc.fileUrl"
            class="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <UIcon
            v-else
            name="i-heroicons-document-text"
            class="w-12 h-12 text-gray-300 dark:text-gray-600"
          />

          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <a
              :href="doc.fileUrl"
              target="_blank"
              class="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
              title="عرض الملف"
            >
              <UIcon name="i-heroicons-eye" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <div class="p-4">
          <div class="flex justify-between items-start mb-1">
            <h4
              class="font-bold text-gray-800 dark:text-white text-sm truncate"
              :title="doc.title"
            >
              {{ doc.title }}
            </h4>
            <UBadge
              :color="getBadgeColor(doc.type)"
              variant="subtle"
              size="xs"
              >{{ getTypeName(doc.type) }}</UBadge
            >
          </div>
          <p class="text-xs text-gray-400" dir="ltr">
            {{ new Date(doc.createdAt).toLocaleDateString("ar-IQ") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const { showSuccess, showError } = useAppToast();

const props = defineProps<{
  currentEnrollment: { id: string; studentId: string };
}>();

// جلب الوثائق
const {
  data: documents,
  pending,
  refresh,
} = await useFetch<any[]>(
  `/api/students/${props.currentEnrollment.studentId}/documents`,
);

// حالة الرفع والفورم
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<any>(null); // استخدام any هنا ينهي صراع الأنواع المعقد مع File
const selectedFileName = ref<string>("");

const form = reactive({
  title: "",
  type: "ID",
});

// التعامل مع اختيار الملف (حل نهائي ✅)
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    selectedFileName.value = target.files[0].name;
  }
};

// رفع الوثيقة
const uploadDocument = async () => {
  if (!selectedFile.value || !form.title) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append("file", selectedFile.value);
  formData.append("title", form.title);
  formData.append("type", form.type);

  try {
    await $fetch(
      `/api/students/${props.currentEnrollment.studentId}/documents`,
      {
        method: "POST",
        body: formData,
      },
    );

    showSuccess("تم الرفع", "تم حفظ الوثيقة بنجاح.");
    form.title = "";
    selectedFile.value = null;
    selectedFileName.value = "";
    if (fileInput.value) fileInput.value.value = "";
    await refresh();
  } catch (error) {
    showError("فشل الرفع", "حدث خطأ أثناء محاولة رفع الملف.");
  } finally {
    isUploading.value = false;
  }
};

// دوال مساعدة للتصميم (الألوان المتوافقة مع Nuxt UI ✅)
const getTypeName = (type: string) => {
  const types: Record<string, string> = {
    ID: "هوية",
    MEDICAL: "طبي",
    CERTIFICATE: "شهادة",
    OTHER: "أخرى",
  };
  return types[type] || "وثيقة";
};

const getBadgeColor = (
  type: string,
): "primary" | "error" | "success" | "neutral" => {
  const colors: Record<string, "primary" | "error" | "success" | "neutral"> = {
    ID: "primary",
    MEDICAL: "error",
    CERTIFICATE: "success",
    OTHER: "neutral",
  };
  return colors[type] || "neutral";
};
</script>

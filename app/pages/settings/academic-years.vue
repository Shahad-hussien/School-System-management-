<script setup lang="ts">
const appToast = useAppToast();

// واجهة البيانات
interface AcademicYear {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
}

// page state
const isModalOpen = ref(false); // للإضافة والتعديل
const isDeleteModalOpen = ref(false); // لتأكيد الحذف
const isEditing = ref(false); // هل المودال المفتوح للتعديل؟
const editingId = ref<string | null>(null); // السنة الجاري تعديلها ID
const idToDelete = ref<string | null>(null); // السنة المُراد حذفها ID
const loading = ref(false); // حالة التحميل للأزرار

// Reactive state for forms
const state = reactive({
  name: "",
  startDate: "",
  endDate: "",
});

// Data Fetching
const {
  data: years,
  refresh,
  status,
} = await useFetch<AcademicYear[]>("/api/academic-years");

// Tabel Configs
const columns = [
  { accessorKey: "name", header: "السنة الدراسية" },
  { accessorKey: "startDate", header: "تاريخ البداية" },
  { accessorKey: "endDate", header: "تاريخ النهاية" },
  { accessorKey: "actions", header: "الإجراءات" },
];

// Helper functions

// تحويل التاريخ الى صيغة مفهومة للمستخدم
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// إغلاق المدوال وتصفير البيانات
const closeModal = () => {
  isModalOpen.value = false;
  setTimeout(() => {
    isEditing.value = false;
    editingId.value = null;
    Object.assign(state, { name: "", startDate: "", endDate: "" });
  }, 300);
};

//CRUD

//إعداد المودال للإضافة
const openAddModal = () => {
  closeModal(); // لضمان نظافة المودال
  isModalOpen.value = true;
};

// تحضير المودال لتعديل بيانات السطر المُختار
const editYear = (year: AcademicYear) => {
  isEditing.value = true;
  editingId.value = year.id;
  state.name = year.name;
  state.startDate = formatDate(year.startDate) || "";
  state.endDate = formatDate(year.endDate) || "";
  isModalOpen.value = true;
};

// معالجة الارسال (اضافة او تعديل)
const onSubmit = async () => {
  if (!state.name || !state.startDate || !state.endDate) {
    appToast.showInfo("بيانات غير مكتملة", "يُرجى ملئ جميع الحقول!");
    return;
  }
  loading.value = true;

  try {
    if (isEditing.value && editingId.value) {
      // تحديث PUT
      await $fetch(`/api/academic-years/${editingId.value}`, {
        method: "PUT",
        body: state,
      });
      appToast.showSuccess("تم التعديل.", "تم تحديث البيانات بنجاح");
    } else {
      // POST
      await $fetch("/api/academic-years", { method: "POST", body: state });
      appToast.showSuccess("تمت الإضافة", "تمت اضافة السنة بنجاح");
    }
    closeModal();
    await refresh();
  } catch (e: any) {
    appToast.showError("خطأ", "فشل حفظ البيانات");
  } finally {
    loading.value = false;
  }
};

// تحضير الحذف
const prepareToDelete = (id: string) => {
  idToDelete.value = id;
  isDeleteModalOpen.value = true;
};

// تنفيذ الحذف النهائي
const confirmAndExclude = async () => {
  if (!idToDelete.value) return;
  loading.value = true;
  try {
    await $fetch(`/api/academic-years/${idToDelete.value}`, {
      method: "DELETE",
    });
    appToast.showSuccess("تم الحذف", "تمت إزالة السنة بنجاح");
    await refresh();
  } catch (e: any) {
    appToast.showError("خطأ", "فشل في الحذف");
  } finally {
    loading.value = false;
    isDeleteModalOpen.value = false;
    idToDelete.value = null;
  }
};

// Wathers
// للتأكد من تصفير البيانات في حال الخروج من خلال Esc
watch(isModalOpen, (val) => {
  if (!val) closeModal();
});
</script>

<template>
  <div>
    <UContainer class="py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-split1-400">
          إدارة السنوات الدراسية
        </h1>
        <p class="text-split1-500 mt-2">قم بإضافة وتنظيم السنوات الدراسية</p>
      </div>

      <UCard class="ring-2 ring-split1-400 shadow-lg overflow-hidden">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-split1-400">السنوات الدراسية الحالية</h3>
            <UButton
              label="سنة دراسية جديدة"
              icon="i-heroicons-plus-circle"
              class="bg-split1-600 hover:bg-split1-500 text-white"
              @click="openAddModal"
            />
          </div>
        </template>

        <UTable
          :data="years || []"
          :columns="columns"
          :loading="status === 'pending'"
        >
          <template #startDate-cell="{ row }">
            <span class="text-gray-600 dark:text-gray-400">
              {{ formatDate(row.original.startDate) }}
            </span>
          </template>

          <template #endDate-cell="{ row }">
            <span class="text-gray-600 dark:text-gray-400">
              {{ formatDate(row.original.endDate) }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-pencil-square"
                @click="editYear(row.original)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-heroicons-trash"
                @click="prepareToDelete(row.original.id)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </UContainer>

    <BaseModal v-model="isDeleteModalOpen" title="تأكيد حذف نهائي">
      <div class="space-y-4">
        <div class="flex flex-col items-center text-center py-4">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-12 h-12 text-red-600"
            />
          </div>

          <p class="text-gray-700 dark:text-gray-300 font-medium">
            هل أنتِ متأكدة تماماً من حذف هذه السنة الدراسية؟
          </p>
          <p class="text-sm text-gray-500 mt-2 leading-relaxed">
            سيؤدي هذا الإجراء إلى حذف كافة البيانات المرتبطة بها (الصفوف،
            الطلاب، السجلات) نهائياً.
            <span class="font-bold text-red-600"
              >لا يمكن التراجع عن هذا الفعل!</span
            >
          </p>
        </div>

        <div class="flex justify-center gap-3 mt-6">
          <UButton
            label="إلغاء، أبقِ البيانات"
            color="neutral"
            variant="ghost"
            @click="isDeleteModalOpen = false"
          />
          <UButton
            label="نعم، احذف نهائياً"
            color="error"
            class="px-6"
            :loading="loading"
            @click="confirmAndExclude"
          />
        </div>
      </div>
    </BaseModal>
    <BaseModal
      v-model="isModalOpen"
      :title="isEditing ? 'تعديل سنة دراسية' : 'إضافة سنة دراسية جديدة'"
    >
      <form @submit.prevent="onSubmit" class="space-y-4">
        <UFormGroup label="مسمى السنة">
          <UInput v-model="state.name" placeholder="مثال: 2026-2027" />
        </UFormGroup>

        <div class="grid grid-cols-1 gap-4 mt-6">
          <UFormGroup label="تاريخ بداية العام" required>
            <UInput v-model="state.startDate" type="date" />
          </UFormGroup>
          <UFormGroup label="تاريخ نهاية العام" required>
            <UInput v-model="state.endDate" type="date" />
          </UFormGroup>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4">
          <UButton
            label="تراجع"
            color="neutral"
            variant="soft"
            @click="closeModal"
          />
          <UButton
            type="submit"
            label="حفظ"
            class="bg-split1-600 hover:bg-split1-500 text-white px-6"
            :loading="loading"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>

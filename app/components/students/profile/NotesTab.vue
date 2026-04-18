<template>
  <div class="p-6" dir="rtl">
    <h3
      class="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2"
    >
      <UIcon name="i-heroicons-clipboard-document-list" class="text-white" />
      لوحة المتابعة والملاحظات
    </h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div
        class="bg-primary-50/30 dark:bg-primary-900/10 border border-white dark:border-white rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm"
      >
        <div class="w-full">
          <h4
            class="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4"
          >
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-white" />
            ملاحظة إدارية
          </h4>
          <UFormGroup class="w-full">
            <UTextarea
              v-model="adminNoteContent"
              placeholder="اكتب ملاحظة للإدارة هنا..."
              :rows="6"
              variant="soft"
              class="w-full"
              :ui="{ root: 'w-full' }"
            />
          </UFormGroup>
        </div>
        <div class="flex justify-end mt-4">
          <UButton
            label="حفظ الملاحظة"
            color="primary"
            icon="i-heroicons-check-circle"
            :loading="isSubmittingAdmin"
            :disabled="!adminNoteContent.trim()"
            class="rounded-xl px-6"
            @click="saveNote('admin')"
          />
        </div>
      </div>

      <div
        class="bg-primary-50/30 dark:bg-primary-900/10 border border-white dark:border-white rounded-2xl p-5 flex flex-col justify-between shadow-sm"
      >
        <div>
          <h4
            class="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4"
          >
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-white" />
            ملاحظة مدرس
          </h4>
          <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
              <UInput
                v-model="teacherNoteForm.name"
                placeholder="اسم المدرس"
                icon="i-heroicons-user"
                variant="soft"
              />
              <UInput
                v-model="teacherNoteForm.branch"
                placeholder="المادة"
                icon="i-heroicons-book-open"
                variant="soft"
              />
            </div>
            <UTextarea
              v-model="teacherNoteForm.content"
              placeholder="اكتب ملاحظتك بشأن الطالب..."
              :rows="4"
              variant="soft"
              class="w-full"
              :ui="{ root: 'w-full' }"
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <UButton
            label="حفظ الملاحظة"
            color="primary"
            icon="i-heroicons-check-circle"
            :loading="isSubmittingTeacher"
            :disabled="
              !teacherNoteForm.name.trim() ||
              !teacherNoteForm.branch.trim() ||
              !teacherNoteForm.content.trim()
            "
            class="rounded-xl px-6"
            @click="saveNote('teacher')"
          />
        </div>
      </div>
    </div>

    <UDivider class="mb-8" label="سجل الملاحظات السابق" />

    <div class="space-y-4">
      <div
        v-if="localNotes.length === 0"
        class="text-center py-10 text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl"
      >
        <UIcon
          name="i-heroicons-inbox"
          class="w-10 h-10 mx-auto mb-2 opacity-50"
        />
        <p>لا توجد ملاحظات مسجلة لهذا الطالب حتى الآن.</p>
      </div>

      <div
        v-for="note in localNotes"
        :key="note.id"
        class="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex gap-4 items-start transition-all hover:border-emerald-200 dark:hover:border-emerald-900/50"
      >
        <div
          :class="[
            'p-2.5 rounded-xl flex shrink-0 mt-1',
            note.authorname === 'إنذار غياب'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : note.authorname === 'الإدارة'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          ]"
        >
          <UIcon
            :name="
            
              note.authorname === 'الإدارة' || note.authorname === 'إنذار غياب'
                ? 'i-heroicons-shield-check'
                : 'i-heroicons-pencil-square'
            "
            class="w-6 h-6"
          />
        </div>

        <div class="flex grow flex-col">
          <div
            class="flex justify-between items-start md:items-center mb-2 flex-col md:flex-row gap-2"
          >
            <span class="font-bold text-gray-900 dark:text-white text-base">
              {{ note.authorname }}
            </span>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <template v-if="!note.content.includes('إنذار')">
                  <UButton
                    icon="i-heroicons-pencil-square"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="openEditModal(note)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    color="error"
                    variant="ghost"
                    @click="openDeleteModal(note.id)"
                  />
                </template>

                <div
                  v-else
                  class="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/50 text-amber-600 dark:text-amber-400"
                  title="سجل نظام محمي"
                >
                  <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
                  <span class="text-[10px] font-bold">سجل محمي</span>
                </div>
              </div>

              <div
                class="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-1 rounded-lg text-xs font-semibold"
                dir="ltr"
              >
                <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                <span>{{
                  new Date(note.createdAt).toLocaleTimeString("ar-IQ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}</span>
                <span class="opacity-30">|</span>
                <span>{{
                  new Date(note.createdAt).toLocaleDateString("ar-IQ")
                }}</span>
              </div>
            </div>
          </div>

          <p
            class="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed"
          >
            {{ note.content }}
          </p>
        </div>
      </div>
    </div>

    <ClientOnly>
      <BaseModal
        :model-value="isEditModalOpen"
        @update:model-value="isEditModalOpen = false"
        title="تعديل الملاحظة"
      >
        <div class="p-5 space-y-5" dir="rtl">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-600 dark:text-gray-300"
              >اسم الكاتب / المدرس</label
            >
            <input
              v-model="editForm.authorname"
              class="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-600 dark:text-gray-300"
              >نص الملاحظة</label
            >
            <textarea
              v-model="editForm.content"
              rows="4"
              class="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            ></textarea>
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
              @click="updateNote"
            />
          </div>
        </div>
      </BaseModal>
    </ClientOnly>

    <ClientOnly>
      <BaseModal
        :model-value="isDeleteModalOpen"
        @update:model-value="isDeleteModalOpen = false"
        title="تنبيه: حذف الملاحظة"
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
                هل أنت متأكد من حذف هذه الملاحظة؟
              </p>
              <p class="text-xs text-red-500">
                لا يمكن التراجع عن هذا الإجراء وسيتم مسح الملاحظة نهائياً.
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
import { ref, reactive, watch } from "vue";

const { showSuccess, showError } = useAppToast();

interface Note {
  id: string;
  authorname: string;
  content: string;
  createdAt: string | Date;
}

const props = defineProps({
  currentEnrollment: { type: Object, required: true },
});

// ✨ استخدام المصفوفة المحلية للتفاعل الفوري ✨
const localNotes = ref<Note[]>([...(props.currentEnrollment?.notes || [])]);

watch(
  () => props.currentEnrollment?.notes,
  (newNotes) => {
    localNotes.value = [...(newNotes || [])];
  },
  { deep: true },
);

// حالات التحميل
const isSubmittingAdmin = ref(false);
const isSubmittingTeacher = ref(false);
const isDeleting = ref(false);
const isUpdating = ref(false);

// حالات المودال
const isDeleteModalOpen = ref(false);
const isEditModalOpen = ref(false);
const noteIdToDelete = ref<string | null>(null);
const editingNoteId = ref<string | null>(null);

// نماذج الإدخال
const adminNoteContent = ref("");
const teacherNoteForm = reactive({ name: "", branch: "", content: "" });
const editForm = reactive({ authorname: "", content: "" });

// --- ➕ إضافة ملاحظة ---
const saveNote = async (type: "admin" | "teacher") => {
  if (!props.currentEnrollment?.id) return;

  const author =
    type === "admin"
      ? "الإدارة"
      : `${teacherNoteForm.name} (${teacherNoteForm.branch})`;
  const content =
    type === "admin" ? adminNoteContent.value : teacherNoteForm.content;

  if (
    !content ||
    (type === "teacher" && (!teacherNoteForm.name || !teacherNoteForm.branch))
  )
    return;

  if (type === "admin") isSubmittingAdmin.value = true;
  else isSubmittingTeacher.value = true;

  try {
    const newNote = await $fetch<Note>("/api/students/profile/notes", {
      method: "POST",
      body: {
        enrollmentId: props.currentEnrollment.id,
        authorname: author,
        content: content,
      },
    });

    // إضافة للمصفوفة المحلية لظهور فوري
    localNotes.value = [newNote, ...localNotes.value];
    showSuccess("تم الحفظ", "تم إضافة الملاحظة بنجاح.");

    if (type === "admin") adminNoteContent.value = "";
    else {
      teacherNoteForm.name = "";
      teacherNoteForm.branch = "";
      teacherNoteForm.content = "";
    }
  } catch (error) {
    showError("خطأ", "فشل حفظ الملاحظة.");
  } finally {
    isSubmittingAdmin.value = false;
    isSubmittingTeacher.value = false;
  }
};

// --- 🗑️ حذف ملاحظة ---
const openDeleteModal = (id: string) => {
  noteIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!noteIdToDelete.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/students/profile/notes/${noteIdToDelete.value}`, {
      method: "DELETE",
    });
    // تحديث المصفوفة المحلية
    localNotes.value = localNotes.value.filter(
      (n) => n.id !== noteIdToDelete.value,
    );
    showSuccess("تم الحذف", "تم حذف الملاحظة بنجاح.");
    isDeleteModalOpen.value = false;
  } catch (e) {
    showError("فشل الحذف", "حدث خطأ أثناء محاولة حذف الملاحظة.");
  } finally {
    isDeleting.value = false;
  }
};

// --- ✏️ تعديل ملاحظة ---
const openEditModal = (note: Note) => {
  editingNoteId.value = note.id;
  editForm.authorname = note.authorname;
  editForm.content = note.content;
  isEditModalOpen.value = true;
};

const updateNote = async () => {
  if (
    !editingNoteId.value ||
    !editForm.content.trim() ||
    !editForm.authorname.trim()
  )
    return;

  isUpdating.value = true;
  try {
    const updated = await $fetch<Note>(
      `/api/students/profile/notes/${editingNoteId.value}`,
      {
        method: "PATCH",
        body: editForm,
      },
    );

    // تحديث الملاحظة في المصفوفة المحلية
    localNotes.value = localNotes.value.map((n) =>
      n.id === editingNoteId.value ? updated : n,
    );

    showSuccess("تم التحديث", "تم تعديل الملاحظة بنجاح.");
    isEditModalOpen.value = false;
  } catch (e) {
    showError("فشل التعديل", "لم يتم حفظ التعديلات.");
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <ClientOnly>
    <BaseModal
      :model-value="isOpen"
      @update:model-value="emit('close')"
      title="تحذير شديد: حذف سجل الطالب"
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
              هل أنت متأكد من حذف الطالب ({{ student?.fullName }})؟
            </p>
            <p class="text-xs text-red-500 dark:text-red-400">
              سيتم مسح بيانات الطالب نهائياً.
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
            @click="emit('close')"
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
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  student: { id: string; fullName: string } | null;
}>();

const emit = defineEmits(["close", "deleted"]);
const isDeleting = ref(false);
const toast = useToast();

const confirmDelete = async () => {
  if (!props.student) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/students/${props.student.id}`, { method: "DELETE" });
    toast.add({ title: "تم الحذف", color: "success" });
    emit("deleted");
  } catch (error) {
    toast.add({ title: "خطأ", color: "error" });
  } finally {
    isDeleting.value = false;
  }
};
</script>

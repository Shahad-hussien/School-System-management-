<template>
  <UCard class="overflow-hidden" :ui="{ body: 'p-0' }">
    <UTable :data="rows" :columns="columns" :loading="pending" class="w-full">
      <template #fullName-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="row.original.imageUrl"
            :alt="row.original.fullName"
            size="sm"
          />
          <span class="font-medium text-gray-900 dark:text-white">{{
            row.original.fullName
          }}</span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :color="row.original.status === 'ACTIVE' ? 'info' : 'primary'"
          variant="soft"
          size="xs"
        >
          {{ row.original.status === "ACTIVE" ? "مستمر" : "حالة أخرى" }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UTooltip text="عرض الملف الكامل">
            <UButton
              icon="i-heroicons-eye"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="$emit('view', row.original)"
            />
          </UTooltip>
          <UTooltip text="تعديل">
            <UButton
              icon="i-heroicons-pencil-square"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="$emit('edit', row.original)"
            />
          </UTooltip>
          <UTooltip text="حذف الطالب">
            <UButton
              icon="i-heroicons-trash"
              size="xs"
              color="error"
              variant="ghost"
              @click.stop.prevent="$emit('delete', row.original)"
            />
          </UTooltip>
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-10">
          <UIcon
            name="i-heroicons-user-group"
            class="w-12 h-12 text-gray-300 mb-4"
          />
          <p class="text-gray-500">لا يوجد طلاب مسجلون في هذه المرحلة حالياً</p>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
// استقبال البيانات من الصفحة الرئيسية
defineProps<{
  rows: any[];
  pending: boolean;
}>();

// إرسال الأحداث للصفحة الرئيسية عند الضغط على الأزرار
defineEmits(["view", "edit", "delete"]);

// نقلنا الأعمدة هنا لأنها تخص الجدول فقط
const columns = [
  { accessorKey: "fullName", header: "اسم الطالب" },
  { accessorKey: "gradeLevel", header: "الصف" },
  { accessorKey: "section", header: "الشعبة" },
  { accessorKey: "parentPhone", header: "رقم ولي الأمر" },
  { accessorKey: "status", header: "الحالة" },
  { id: "actions", header: "إجراءات" },
];
</script>

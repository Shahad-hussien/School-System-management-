<script setup lang="ts">
import { useYearStore } from "~/stores/yearStore";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
}

const yearStore = useYearStore();

// جلب البيانات - سنبقيها كما هي لأنها تعمل
const { data: years, pending } = await useAsyncData(
  "academic-years-list",
  () => $fetch<AcademicYear[]>("/api/academic-years"),
  { default: () => [], lazy: false },
);

// الوسيط بين الـ HTML Select ومخزن Pinia
const selectedYearId = computed({
  get: () => yearStore.selectedYear?.id || "",
  set: (newId) => {
    const fullYear = years.value?.find((y) => y.id === newId);
    if (fullYear) {
      yearStore.setYear(fullYear);
    }
  },
});

// تعيين السنة الأولى تلقائياً إذا لم يسبق الاختيار
watch(
  years,
  (newYears) => {
    if (!yearStore.selectedYear && newYears && newYears.length > 0) {
      const firstYear = newYears[0];
      if (firstYear) yearStore.setYear(firstYear);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20"
  >
    <span class="text-xs font-medium text-gray-300 whitespace-nowrap"
      >السنة النشطة:</span
    >

    <div class="relative">
      <select
        v-if="!pending && years && years.length > 0"
        v-model="selectedYearId"
        class="bg-transparent text-split1-400 font-bold text-sm border-none focus:ring-0 cursor-pointer appearance-none pl-6"
        dir="rtl"
      >
        <option
          v-for="year in years"
          :key="year.id"
          :value="year.id"
          class="bg-primary-800 text-white"
        >
          {{ year.name }}
        </option>
      </select>

      <span v-else-if="pending" class="text-xs text-gray-400 animate-pulse">
        جاري التحميل...
      </span>

      <span v-else class="text-xs text-red-400"> أضف سنة دراسية </span>

      <UIcon
        v-if="!pending && years.length > 0"
        name="i-heroicons-chevron-down-20-solid"
        class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-split1-400 pointer-events-none"
      />
    </div>
  </div>
</template>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative"
    dir="rtl"
  >
    <div v-if="activeCell" class="fixed inset-0 z-40" @click="closeMenu"></div>

    <div
      class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50"
    >
      <h3
        class="font-bold text-gray-800 dark:text-white flex items-center gap-2"
      >
        <UIcon
          name="i-heroicons-calendar-days"
          class="text-emerald-500 w-5 h-5"
        />
        سجل الحضور والغياب الأسبوعي
      </h3>

      <div
        class="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1"
      >
        <UButton
          icon="i-heroicons-chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="changeWeek(1)"
          title="الأسبوع القادم"
        />
        <div
          class="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-35 text-center"
          dir="ltr"
        >
          {{ weekDays[0]?.date ? formatDate(weekDays[0].date) : "" }} -
          {{ weekDays[4]?.date ? formatDate(weekDays[4].date) : "" }}
        </div>
        <UButton
          icon="i-heroicons-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="changeWeek(-1)"
          title="الأسبوع السابق"
        />
      </div>
    </div>

    <div class="overflow-visible min-h-75">
      <table class="w-full text-sm text-right">
        <thead
          class="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700"
        >
          <tr>
            <th class="p-4 whitespace-nowrap min-w-50">اسم الطالب</th>
            <th
              v-for="day in weekDays"
              :key="day.name"
              class="p-4 text-center min-w-30"
            >
              <span class="block">{{ day.name }}</span>
              <span class="text-xs font-normal text-gray-400" dir="ltr">{{
                formatDate(day.date)
              }}</span>
            </th>
            <th
              class="p-4 text-center border-r border-gray-200 dark:border-gray-700"
            >
              مجموع الأسبوع
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="students.length === 0">
            <td colspan="7" class="p-8 text-center text-gray-500">
              لا يوجد طلاب في هذه الشعبة لعرض سجلاتهم.
            </td>
          </tr>

          <tr
            v-for="student in students"
            :key="student.id"
            class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <td
              class="p-4 font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3"
            >
              <UAvatar
                :src="student.imageUrl || undefined"
                :alt="student.fullName"
                size="sm"
                class="bg-emerald-100 text-emerald-600"
              />
              <span class="truncate max-w-37.5" :title="student.fullName">{{
                student.fullName
              }}</span>
            </td>

            <td
              v-for="day in weekDays"
              :key="day.date.toISOString()"
              class="p-2 text-center border-l border-gray-50 dark:border-gray-800/50 relative transition-all"
              :class="isActiveCell(student.id, day.date) ? 'z-50' : 'z-0'"
            >
              <button
                type="button"
                @click="openMenu(student.id, day.date)"
                class="w-full h-12 min-w-15 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-emerald-200 dark:hover:ring-emerald-900 focus:outline-none focus:ring-emerald-500"
                :class="getCellClass(getAbsence(student, day.date))"
              >
                <template v-if="getAbsence(student, day.date)">
                  <span
                    v-if="getAbsence(student, day.date)?.type === 'UNEXCUSED'"
                    class="font-bold text-red-700 dark:text-red-300"
                    >غ</span
                  >
                  <span
                    v-else
                    class="font-bold text-emerald-700 dark:text-emerald-300"
                    :title="getAbsence(student, day.date)?.reason"
                    >ر</span
                  >
                </template>
                <template v-else>
                  <span
                    class="text-gray-300 dark:text-gray-600 hover:text-emerald-400 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <UIcon name="i-heroicons-check" class="w-5 h-5" />
                  </span>
                </template>
              </button>

              <div
                v-if="isActiveCell(student.id, day.date)"
                class="absolute top-14 left-1/2 -translate-x-1/2 w-52 bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2"
                @click.stop
              >
                <p class="text-xs text-gray-500 text-center mb-1 font-bold">
                  {{ student.fullName }}
                </p>
                <p
                  class="text-xs text-emerald-600 dark:text-emerald-400 text-center mb-2"
                >
                  {{ day.name }} - {{ formatDate(day.date) }}
                </p>

                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-check-circle"
                  label="مسح الغياب"
                  class="justify-start text-gray-600"
                  @click="handleStatusChange(student, day.date, 'PRESENT')"
                  v-if="getAbsence(student, day.date)"
                />

                <UButton
                  size="sm"
                  color="error"
                  variant="soft"
                  icon="i-heroicons-x-circle"
                  label="غياب بدون عذر"
                  class="justify-start"
                  @click="handleStatusChange(student, day.date, 'UNEXCUSED')"
                />

                <div
                  class="border-t border-gray-100 dark:border-gray-800 pt-2 mt-1 flex flex-col gap-2"
                >
                  <input
                    v-model="quickReason"
                    placeholder="اكتب العذر هنا..."
                    class="text-xs p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    @click.stop
                  />
                  <UButton
                    size="sm"
                    color="success"
                    variant="soft"
                    icon="i-heroicons-document-text"
                    label="غياب بعذر"
                    class="justify-start"
                    @click="handleStatusChange(student, day.date, 'EXCUSED')"
                  />
                </div>
              </div>
            </td>

            <td
              class="p-4 text-center border-r border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300"
            >
              {{ getWeeklyTotal(student) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  students: any[];
}>();

const emit = defineEmits(["refresh"]);
const { showSuccess, showError } = useAppToast();
const quickReason = ref("");

// --- ✨ Custom Menu State ✨ ---
const activeCell = ref<{ studentId: string; date: string } | null>(null);

const openMenu = (studentId: string, date: Date) => {
  activeCell.value = {
    studentId,
    date: date.toISOString().substr(0, 10),
  };
};

const closeMenu = () => {
  activeCell.value = null;
  quickReason.value = ""; // clear reason when closing
};

const isActiveCell = (studentId: string, date: Date) => {
  if (!activeCell.value) return false;
  return (
    activeCell.value.studentId === studentId &&
    activeCell.value.date === date.toISOString().substr(0, 10)
  );
};
// ------------------------------

// --- 🗓️ حساب أيام الأسبوع ---
const currentWeekOffset = ref(0);

const weekDays = computed(() => {
  const days = [];
  const today = new Date();
  const currentDay = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDay + currentWeekOffset.value * 7);

  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  for (let i = 0; i < 5; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push({ name: dayNames[i], date: d });
  }
  return days;
});

const changeWeek = (offset: number) => {
  currentWeekOffset.value += offset;
  closeMenu(); // Close any open menu when changing weeks
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
};

// --- 🔍 البحث في المصفوفة ---
const getAbsence = (student: any, targetDate: Date) => {
  // نبحث عن الغيابات سواء كانت مدمجة مباشرة أو داخل مصفوفة enrollments
  const absences = student.absences || student.enrollments?.[0]?.absences;

  if (!absences || !Array.isArray(absences)) return null;

  const targetString = targetDate.toISOString().substr(0, 10);
  return absences.find((a: any) => {
    const absenceDate = new Date(a.date).toISOString().substr(0, 10);
    return absenceDate === targetString;
  });
};

const getWeeklyTotal = (student: any) => {
  let count = 0;
  weekDays.value.forEach((day) => {
    const absence = getAbsence(student, day.date);
    // ✨ نزيد العداد فقط إذا كان هناك غياب، ونوعه "بدون عذر" ✨
    if (absence && absence.type === "UNEXCUSED") {
      count++;
    }
  });
  return count;
};

// --- 🎨 تصميم الخلايا ---
const getCellClass = (absence: any) => {
  if (!absence) return "bg-gray-50/50 dark:bg-gray-800/30 text-gray-300";
  if (absence.type === "UNEXCUSED")
    return "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800";
  return "bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-800";
};

// --- ⚡ الإجراء السريع ---
const handleStatusChange = async (
  student: any,
  date: Date,
  newStatus: string,
) => {
  // 1. البحث عن الـ enrollmentId بذكاء
  const enrollmentId = student.enrollmentId || student.enrollments?.[0]?.id;

  // 2. إذا لم نجده، نظهر خطأ بدلاً من التجاهل الصامت!
  if (!enrollmentId) {
    showError(
      "خطأ في البيانات",
      "لم يتم العثور على مُعرف التسجيل (Enrollment ID) لهذا الطالب. يرجى التأكد من أن الـ API يُرسله.",
    );
    return;
  }

  const existingAbsence = getAbsence(student, date);
  const dateString = date.toISOString().substr(0, 10);
  const reasonToSubmit = quickReason.value;

  // إغلاق القائمة فوراً
  closeMenu();

  try {
    if (newStatus === "PRESENT" && existingAbsence) {
      await $fetch(`/api/students/profile/attendance/${existingAbsence.id}`, {
        method: "DELETE",
      });
      showSuccess("تم مسح الغياب", "تم تسجيل الطالب كحاضر وإلغاء الغياب.");
    } else if (existingAbsence && newStatus !== "PRESENT") {
      await $fetch(`/api/students/profile/attendance/${existingAbsence.id}`, {
        method: "PATCH",
        body: { type: newStatus, reason: reasonToSubmit },
      });
      showSuccess("تم التعديل", "تم تحديث حالة الغياب بنجاح.");
    } else if (!existingAbsence && newStatus !== "PRESENT") {
      await $fetch("/api/students/profile/attendance", {
        method: "POST",
        body: {
          enrollmentId,
          date: dateString,
          type: newStatus,
          reason: reasonToSubmit,
        },
      });
      // إشعار نجاح للإضافة الجديدة (لم يكن موجوداً في الكود السابق)
      showSuccess("تم التسجيل", "تم تسجيل غياب الطالب بنجاح.");
    }

    emit("refresh"); // تحديث الجدول لظهور الألوان والبيانات الجديدة
  } catch (error) {
    showError("خطأ", "حدث مشكلة أثناء محاولة حفظ سجل الحضور.");
  }
};
</script>

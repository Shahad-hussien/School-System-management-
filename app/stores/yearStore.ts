interface AcademicYear {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
}

export const useYearStore = defineStore("academicYear", () => {
  // 1. إنشاء "كوكيز" لحفظ السنة.
  // المتصفح سيحفظ هذه القيمة تلقائياً ولن تضيع عند تحديث الصفحة!
  const selectedYear = useCookie<AcademicYear | null>(
    "selected_academic_year",
    {
      default: () => null,
      watch: true, // هذا يضمن تحديث الـ Cookie فوراً عند تغير القيمة
    },
  );

  // 2. دالة لتحديث السنة المختارة
  function setYear(year: AcademicYear) {
    selectedYear.value = year;
  }

  return { selectedYear, setYear };
});

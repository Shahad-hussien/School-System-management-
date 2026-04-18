// composables/useSubjectManager.ts
export const useSubjectManager = (defaultStage: string = "PRIMARY") => {
  // حالة النموذج (يأخذ المرحلة الافتراضية التي نمررها له)
  const state = reactive({
    name: "",
    stage: defaultStage,
    gradeLevel: "",
    branch: "GENERAL",
    isActive: true,
  });

  // الصفوف المتاحة بناءً على المرحلة الحالية
  const availableGrades = computed(() => {
    if (state.stage === "PRIMARY")
      return ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
    if (state.stage === "MIDDLE") return ["الأول", "الثاني", "الثالث"];
    if (state.stage === "HIGH") return ["الرابع", "الخامس", "السادس"];
    return [];
  });

  // الفروع المتاحة (للمتوسط والابتدائي دائماً عام)
  const availableBranches = computed(() => {
    if (state.stage === "HIGH") return ["SCIENTIFIC", "LITERARY"];
    return ["GENERAL"];
  });

  // دالة لتصفير النموذج بعد الإغلاق
  const resetForm = () => {
    state.name = "";
    state.stage = defaultStage;
    state.gradeLevel = "";
    state.branch = "GENERAL";
    state.isActive = true;
  };

  return {
    state,
    availableGrades,
    availableBranches,
    resetForm,
  };
};

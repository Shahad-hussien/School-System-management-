// server/api/academic-years/index.get.ts

export default defineEventHandler(async (event) => {
  try {
    // جلب جميع السنوات الدراسية وترتيبها من الأحدث للأقدم باستخدام المحرك العالمي
    // لاحظي: لا توجد استيرادات، لا تعريف للـ Pool، ولا إغلاق يدوي!
    const years = await prisma.academicYear.findMany({
      orderBy: {
        startDate: "desc",
      },
    });

    return years;
  } catch (error: any) {
    console.error("❌ Error fetching academic years:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "فشل في جلب قائمة السنوات الدراسية",
    });
  }
  // الـ Singleton في server/utils يتكفل بكل شيء بخصوص الاتصال
});

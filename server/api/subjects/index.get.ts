// server/api/subjects/index.get.ts

export default defineEventHandler(async (event) => {
  try {
    // جلب جميع المواد وترتيبها باستخدام الكائن العالمي prisma
    // تم ترتيبها حسب المرحلة ثم الصف لضمان ظهورها بشكل منطقي في الجداول
    const subjects = await prisma.subject.findMany({
      orderBy: [{ stage: "asc" }, { gradeLevel: "asc" }],
    });

    return subjects;
  } catch (error: any) {
    console.error("❌ Error fetching subjects:", error.message);

    throw createError({
      statusCode: 500,
      statusMessage:
        "حدث خطأ أثناء جلب قائمة المواد الدراسية من قاعدة البيانات",
    });
  }
  // ملاحظة: لا حاجة لـ finally أو إغلاق الاتصالات هنا بفضل نظام الـ Singleton
});

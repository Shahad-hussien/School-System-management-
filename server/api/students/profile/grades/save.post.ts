// server/api/students/profile/grades/save.post.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { enrollmentId, subjectId, field, value } = body;

  // 1. التحقق من وصول البيانات الأساسية
  if (!enrollmentId || !subjectId || !field) {
    throw createError({
      statusCode: 400,
      statusMessage: "بيانات مفقودة: يجب تحديد الطالب، المادة، والشهر.",
    });
  }

  try {
    // 2. البحث عما إذا كان الطالب يمتلك سجل درجات سابق لهذه المادة
    const existingGrade = await prisma.grade.findFirst({
      where: {
        enrollmentId: String(enrollmentId),
        subjectId: String(subjectId),
      },
    });

    // 3. اتخاذ القرار (تحديث أم إنشاء)
    if (existingGrade) {
      // الطالب يملك سجلاً، إذن نقوم بتحديث الحقل المطلوب فقط
      const updatedGrade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: { [field]: value }, // هنا نستخدم الـ Dynamic Key لكي يتحدث الحقل الذي ضغطتِ عليه فقط
      });
      return updatedGrade;
    } else {
      // الطالب لا يملك سجلاً لهذه المادة، ننشئ واحداً جديداً
      const newGrade = await prisma.grade.create({
        data: {
          enrollmentId: String(enrollmentId),
          subjectId: String(subjectId),
          [field]: value,
        },
      });
      return newGrade;
    }
  } catch (error: any) {
    console.error("❌ Error saving grade:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "حدث خطأ في السيرفر أثناء حفظ الدرجة.",
    });
  }
});

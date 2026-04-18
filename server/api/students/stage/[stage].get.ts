// server/api/students/stage/[stage].get.ts

export default defineEventHandler(async (event) => {
  // 1. استخراج المرحلة من الرابط والسنة من الاستعلام (Query)
  const stage = getRouterParam(event, "stage")?.toUpperCase();
  const { yearId } = getQuery(event);

  // إذا لم تتوفر البيانات الأساسية، نرجع قائمة فارغة فوراً
  if (!stage || !yearId) {
    return [];
  }

  try {
    // 2. جلب التسجيلات مع بيانات الطالب المرتبطة
    const enrollments = await prisma.enrollment.findMany({
      where: {
        stage: stage as any,
        yearId: yearId as string,
      },
      include: {
        student: true,
        absences: true, // ✨ 1. جلب مصفوفة الغيابات المرتبطة بهذا التسجيل ✨
      },
      orderBy: {
        student: {
          fullName: "asc",
        },
      },
    });

    // 3. تحويل البيانات (Mapping)
    return enrollments.map((enrollment: any) => ({
      id: enrollment.student.id,

      // ✨ 2. الأبطال المفقودون الذين يبحث عنهم الجدول ✨
      enrollmentId: enrollment.id,
      absences: enrollment.absences || [],

      fullName: enrollment.student.fullName,
      gradeLevel: enrollment.gradeLevel,
      section: enrollment.section,
      parentPhone: enrollment.student.parentPhone,
      status: enrollment.status,
      imageUrl: enrollment.student.imageUrl,
      createdAt: enrollment.student.createdAt,
      transferInDate: enrollment.student.transferInDate,
      transferOutDate: enrollment.student.transferOutDate,
    }));
  } catch (error: any) {
    console.error("❌ Fetch Students Error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "حدث خطأ أثناء جلب قائمة الطلاب من قاعدة البيانات",
    });
  }
});

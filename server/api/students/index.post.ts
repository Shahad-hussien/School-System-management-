// server/api/students/index.post.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    // إنشاء الطالب وإنشاء سجل التسجيل (Enrollment) معاً في خطوة واحدة
    const newStudent = await prisma.student.create({
      data: {
        // 1. البيانات الشخصية للطالب (تذهب لجدول Student)
        fullName: body.fullName,
        motherName: body.motherName,
        birthDate: new Date(body.birthDate),
        transferInDate: new Date(body.transferInDate),
        gender: body.gender,
        parentPhone: body.parentPhone,
        disabilityType: body.disabilityType || null,
        imageUrl: body.imageUrl || null,

        // 2. بيانات التسجيل (تذهب لجدول Enrollment وتربط الطالب بالسنة والمرحلة)
        enrollments: {
          create: {
            yearId: body.yearId,
            stage: body.stage,
            gradeLevel: body.gradeLevel,
            branch: body.branch || "GENERAL",
            section: body.section || "أ", // نضع شعبة افتراضية "أ" إذا كانت فارغة
            status: "ACTIVE",
          },
        },
      },
    });

    return newStudent;
  } catch (error: any) {
    console.error("❌ Error creating student:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "فشل في تسجيل الطالب: " + error.message,
    });
  }
});

// server/api/students/profile/grades/[enrollmentId].get.ts
import { Subject, Grade } from "@prisma/client"; // ✨ أضفنا هذا السطر السحري ✨

export default defineEventHandler(async (event) => {
  const enrollmentId = getRouterParam(event, "enrollmentId");

  if (!enrollmentId) {
    throw createError({ statusCode: 400, statusMessage: "معرف التسجيل مطلوب" });
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: String(enrollmentId) },
      select: { stage: true, gradeLevel: true, branch: true },
    });

    if (!enrollment) {
      throw createError({
        statusCode: 404,
        statusMessage: "لم يتم العثور على سجل التسجيل",
      });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        stage: enrollment.stage,
        gradeLevel: enrollment.gradeLevel,
        branch: enrollment.branch,
        isActive: true,
      },
      distinct: ["name"], // ✨ هذا هو السطر السحري الذي سيقتل التكرار نهائياً! ✨
      orderBy: { id: "asc" },
    });

    const existingGrades = await prisma.grade.findMany({
      where: { enrollmentId: String(enrollmentId) },
    });

    // ✨ أخبرنا TypeScript بنوع البيانات هنا (Subject و Grade) ✨
    const gradebook = subjects.map((subject: Subject) => {
      const subjectGrade = existingGrades.find(
        (g: Grade) => g.subjectId === subject.id,
      );

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        gradeId: subjectGrade?.id || null,

        firstTermMonth1: subjectGrade?.firstTermMonth1 ?? null,
        firstTermMonth2: subjectGrade?.firstTermMonth2 ?? null,
        firstTermMonth3: subjectGrade?.firstTermMonth3 ?? null,

        midYear: subjectGrade?.midYear ?? null,
        midYearState: subjectGrade?.midYearState ?? null,

        secondTermMonth1: subjectGrade?.secondTermMonth1 ?? null,
        secondTermMonth2: subjectGrade?.secondTermMonth2 ?? null,

        finalExam: subjectGrade?.finalExam ?? null,
        finalState: subjectGrade?.finalState ?? null,
      };
    });

    return gradebook;
  } catch (error: any) {
    console.error("❌ Error fetching gradebook:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "حدث خطأ أثناء جلب سجل الدرجات",
    });
  }
});

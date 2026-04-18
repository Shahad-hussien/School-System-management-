export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  try {
    // 1. جلب بيانات الغياب قبل حذفه لمعرفة الطالب ونوع الغياب
    const absence = await prisma.absence.findUnique({
      where: { id: String(id) },
    });

    if (!absence) {
      throw createError({
        statusCode: 404,
        statusMessage: "سجل الغياب غير موجود",
      });
    }

    // 2. حذف الغياب الفعلي من قاعدة البيانات
    await prisma.absence.delete({
      where: { id: String(id) },
    });

    // 3. 🧠 التراجع التلقائي الذكي عن الإنذارات
    if (absence.type === "UNEXCUSED") {
      const enrollmentId = absence.enrollmentId;

      // حساب العدد المتبقي للغيابات بدون عذر بعد الحذف
      const unexcusedCount = await prisma.absence.count({
        where: { enrollmentId, type: "UNEXCUSED" },
      });

      // قائمة العتبات القانونية للنظام العراقي
      const warningThresholds = [
        { limit: 7, text: "إنذار أول" },
        { limit: 14, text: "إنذار ثاني" },
        { limit: 21, text: "إنذار ثالث" },
        { limit: 26, text: "إنذار نهائي" },
      ];

      // فحص كل العتبات: إذا أصبح العدد أقل من العتبة، نحذف الإنذار المرتبط بها
      for (const item of warningThresholds) {
        if (unexcusedCount < item.limit) {
          await prisma.note.deleteMany({
            where: {
              enrollmentId: enrollmentId,
              authorname: "إنذار غياب", // موحد مع بقية الملفات
              content: { contains: item.text },
            },
          });
        }
      }
    }

    return { success: true, message: "تم حذف السجل وتحديث الحالة الإدارية" };
  } catch (error: any) {
    console.error("❌ Delete Attendance Error:", error.message);
    throw createError({ statusCode: 500, statusMessage: "فشل حذف السجل" });
  }
});

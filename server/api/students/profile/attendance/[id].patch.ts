export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    // 1. جلب السجل القديم
    const oldAbsence = await prisma.absence.findUnique({
      where: { id: String(id) },
    });

    if (!oldAbsence) {
      throw createError({
        statusCode: 404,
        statusMessage: "سجل الغياب غير موجود",
      });
    }

    // 2. تحديث السجل
    const updated = await prisma.absence.update({
      where: { id: String(id) },
      data: {
        type: body.type,
        reason: body.reason || "",
        date: body.date ? new Date(body.date) : oldAbsence.date,
      },
    });

    // 3. 🧠 نظام الإنذارات الذكي (يعمل فقط عند تغيير نوع الغياب)
    if (body.type && oldAbsence.type !== body.type) {
      const enrollmentId = oldAbsence.enrollmentId;

      // حساب العدد الجديد للغيابات بدون عذر
      const unexcusedCount = await prisma.absence.count({
        where: { enrollmentId, type: "UNEXCUSED" },
      });

      // جلب الملاحظات الموجودة مسبقاً للتحقق
      const existingNotes = await prisma.note.findMany({
        where: { enrollmentId, authorname: "الإدارة" },
        select: { content: true },
      });

      const hasWarning = (keyword: string) =>
        existingNotes.some((n: { content: string }) =>
          n.content.includes(keyword),
        );

      // --- أ) حالة الزيادة: تحول الغياب إلى "بدون عذر" ---
      if (body.type === "UNEXCUSED") {
        let warningToCreate = "";
        if (unexcusedCount >= 26 && !hasWarning("إنذار نهائي"))
          warningToCreate =
            "إنذار نهائي: تجاوز الطالب 26 يوماً بدون عذر (مُعرّض للفصل بالغياب). 🚨";
        else if (unexcusedCount >= 21 && !hasWarning("إنذار ثالث"))
          warningToCreate =
            "إنذار ثالث: بلغ غياب الطالب 21 يوماً (بدون عذر). ⚠️";
        else if (unexcusedCount >= 14 && !hasWarning("إنذار ثاني"))
          warningToCreate =
            "إنذار ثاني: بلغ غياب الطالب 14 يوماً (بدون عذر). ⚠️";
        else if (unexcusedCount >= 7 && !hasWarning("إنذار أول"))
          warningToCreate = "إنذار أول: بلغ غياب الطالب 7 أيام (بدون عذر). ⚠️";

        if (warningToCreate) {
          await prisma.note.create({
            data: {
              enrollmentId,
              authorname: "إنذار غياب",
              content: warningToCreate,
            },
          });
        }
      }

      // --- ب) حالة النقص: تحول الغياب من "بدون عذر" إلى شيء آخر (حاضر أو بعذر) ---
      else if (oldAbsence.type === "UNEXCUSED" && body.type !== "UNEXCUSED") {
        // إذا نزل العدد عن العتبة، نحذف الإنذار الذي لم يعد له مستند قانوني
        const checks = [
          { limit: 7, text: "إنذار أول" },
          { limit: 14, text: "إنذار ثاني" },
          { limit: 21, text: "إنذار ثالث" },
          { limit: 26, text: "إنذار نهائي" },
        ];

        for (const check of checks) {
          if (unexcusedCount < check.limit) {
            await prisma.note.deleteMany({
              where: {
                enrollmentId,
                authorname: "الإدارة",
                content: { contains: check.text },
              },
            });
          }
        }
      }
    }

    return updated;
  } catch (error: any) {
    console.error("❌ Patch Attendance Error:", error.message);
    throw createError({ statusCode: 500, statusMessage: "فشل تحديث السجل" });
  }
});

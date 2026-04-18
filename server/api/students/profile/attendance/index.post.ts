// server/api/students/profile/attendance/index.post.ts

export default defineEventHandler(async (event) => {
  // 1. قراءة البيانات القادمة من الواجهة
  const body = await readBody(event);
  const { enrollmentId, date, type, reason } = body;

  // 2. التحقق من الحقول الأساسية (Validation)
  if (!enrollmentId || !date || !type) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "جميع الحقول الأساسية (الطالب، التاريخ، نوع الغياب) مطلوبة.",
    });
  }

  try {
    // 3. إنشاء سجل الغياب في قاعدة البيانات
    const newAbsence = await prisma.absence.create({
      data: {
        enrollmentId: String(enrollmentId),
        date: new Date(date),
        type: type,
        reason: reason || "",
      },
    });

    // 4. 🧠 نظام الإنذارات التلقائي (يعمل فقط للغياب بدون عذر)
    if (type === "UNEXCUSED") {
      const unexcusedCount = await prisma.absence.count({
        where: { enrollmentId: String(enrollmentId), type: "UNEXCUSED" },
      });

      let warningMessage = "";

      // تحديد نوع الإنذار بناءً على العدد الدقيق (نظام عراقي)
      if (unexcusedCount === 7)
        warningMessage = " إنذار أول: بلغ غياب الطالب 7 أيام (بدون عذر). ⚠️";
      else if (unexcusedCount === 14)
        warningMessage = " إنذار ثاني: بلغ غياب الطالب 14 يوماً (بدون عذر). ⚠️";
      else if (unexcusedCount === 21)
        warningMessage = " إنذار ثالث: بلغ غياب الطالب 21 يوماً (بدون عذر). ⚠️";
      else if (unexcusedCount === 26)
        warningMessage =
          " إنذار نهائي: تجاوز الطالب 26 يوماً بدون عذر (مُعرّض للفصل بالغياب). 🚨";

      // إذا استوجب إنذاراً، قم بإنشاء ملاحظة تلقائية في ملف الطالب
      if (warningMessage) {
        await prisma.note.create({
          data: {
            enrollmentId: String(enrollmentId),
            authorname: "إنذار غياب",
            content: warningMessage,
          },
        });
      }
    }

    // 5. إرجاع السجل الجديد للواجهة لتحديث الجدول فوراً
    return newAbsence;
  } catch (error: any) {
    console.error("❌ خطأ في تسجيل الغياب:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "حدث خطأ داخلي أثناء محاولة حفظ سجل الغياب.",
    });
  }
});

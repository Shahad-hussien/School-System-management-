// server/api/academic-years/[id].put.ts

export default defineEventHandler(async (event) => {
  // 1. استخراج الـ id والبيانات القادمة من الواجهة
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    // 2. التحديث مباشرة باستخدام الكائن العالمي prisma
    // لاحظي: لا توجد استيرادات (Imports) ولا توجد تعريفات لـ pool أو adapter
    const updatedYear = await prisma.academicYear.update({
      where: { id: id },
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });

    return updatedYear;
  } catch (error: any) {
    // 3. معالجة الأخطاء بشكل احترافي
    console.error("❌ Error during update:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage:
        "فشل في تحديث بيانات السنة الدراسية: " + (error.message || ""),
    });
  }
  // لا نحتاج لـ finally ولا لـ disconnect لأن الـ Pool يدير نفسه تلقائياً!
});

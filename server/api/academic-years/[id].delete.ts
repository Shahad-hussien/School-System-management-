export default defineEventHandler(async (event) => {
  // 1. استخراج الـ id من الرابط
  const id = getRouterParam(event, "id");

  try {
    // 2. الحذف مباشرة باستخدام الكائن العالمي prisma
    // لا نحتاج لتعريف pool أو adapter أو prisma هنا، فهي جاهزة تلقائياً!
    await prisma.academicYear.delete({
      where: { id: id },
    });

    return { success: true, message: "تم حذف السنة الدراسية بنجاح" };
  } catch (error: any) {
    // في حال فشل الحذف (مثلاً الـ id غير موجود أو مرتبطة ببيانات أخرى)
    throw createError({
      statusCode: 400,
      statusMessage:
        "تعذر حذف السنة الدراسية، قد تكون مرتبطة ببيانات طلاب أو مراحل أخرى.",
    });
  }
  // ملاحظة احترافية: حذفنا بلوك الـ finally بالكامل لأننا لا نغلق الـ Pool أبداً في الـ Singleton
});

// server/api/students/[id].delete.ts

export default defineEventHandler(async (event) => {
  // 1. استخراج الـ ID الخاص بالطالب من الرابط
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "معرف الطالب مطلوب لإتمام عملية الحذف",
    });
  }

  try {
    // 2. الحذف مباشرة باستخدام الكائن العالمي prisma
    // لا نحتاج لتعريف pool أو adapter أو prisma، فهي متاحة تلقائياً
    const deletedStudent = await prisma.student.delete({
      where: { id: id },
    });

    return {
      success: true,
      message: "تم حذف الطالب بنجاح",
      student: deletedStudent,
    };
  } catch (error: any) {
    console.error("❌ Delete Student Error:", error.message);

    // ملاحظة: قد يفشل الحذف إذا كان الطالب مسجلاً في سنة دراسية (Constraints)
    throw createError({
      statusCode: 500,
      statusMessage:
        "فشل حذف الطالب. قد يكون مرتبطاً بسجلات أكاديمية أو دفعات مالية.",
    });
  }
});

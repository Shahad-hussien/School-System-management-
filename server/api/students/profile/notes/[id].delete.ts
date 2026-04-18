// server/api/students/profile/notes/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  try {
    await prisma.note.delete({
      where: { id: String(id) },
    });
    return { message: "تم حذف الملاحظة بنجاح" };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: "فشل حذف الملاحظة" });
  }
});

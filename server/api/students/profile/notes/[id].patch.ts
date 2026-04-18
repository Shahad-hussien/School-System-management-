// server/api/students/profile/notes/[id].patch.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    const updatedNote = await prisma.note.update({
      where: { id: String(id) },
      data: {
        authorname: body.authorname, // السماح بتعديل اسم الكاتب
        content: body.content, // السماح بتعديل المحتوى
      },
    });
    return updatedNote;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: "فشل تحديث الملاحظة" });
  }
});

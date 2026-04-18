// server/api/students/profile/notes/index.post.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { enrollmentId, authorname, content } = body;

  if (!enrollmentId || !authorname || !content) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Missing required fields (enrollmentId, authorname, content)",
    });
  }

  try {
    const newNote = await prisma.note.create({
      data: {
        enrollmentId: String(enrollmentId),
        authorname: String(authorname),
        content: String(content),
      },
    });

    return newNote;
  } catch (error: any) {
    console.error("❌ Error creating note:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to save the note in the database",
    });
  }
});

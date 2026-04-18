// server/api/academic-years/index.post.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    // نستخدم كلمة prisma مباشرة (Nuxt سيجلبها من الـ utils تلقائياً)
    const newYear = await prisma.academicYear.create({
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });

    return newYear;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "خطأ في قاعدة البيانات: " + error.message,
    });
  }
});

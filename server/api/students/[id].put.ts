// server/api/students/[id].put.ts

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Student ID is required",
    });
  }

  try {
    // 1. Update the Student's personal info
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        fullName: body.fullName,
        parentPhone: body.parentPhone,
      },
    });

    // 2. Update their Enrollment info (grade, section, status) for the current year
    if (body.yearId) {
      await prisma.enrollment.updateMany({
        where: {
          studentId: id,
          yearId: body.yearId,
        },
        data: {
          gradeLevel: body.gradeLevel,
          section: body.section,
          status: body.status,
        },
      });
    }

    return updatedStudent;
  } catch (error: any) {
    console.error("❌ Error updating student:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update student data",
    });
  }
});

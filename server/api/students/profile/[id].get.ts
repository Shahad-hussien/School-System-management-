// server/api/students/profile/[id].get.ts

export default defineEventHandler(async (event) => {
  // 1. Get the student ID from the URL (e.g., /api/students/profile/cm0x...)
  const studentId = getRouterParam(event, "id");

  // 2. Get the yearId from the query parameters (optional but recommended)
  // This helps us fetch the data for the currently selected academic year.
  const { yearId } = getQuery(event);

  if (!studentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Student ID is required",
    });
  }

  try {
    // 3. The Prisma Magic: Fetching nested relations
    const studentProfile = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        // Fetch uploaded documents (ID cards, result images)
        documents: true,

        // Fetch the enrollment data
        enrollments: {
          // If a yearId is provided in the URL, only fetch the enrollment for that year.
          // Otherwise, fetch all enrollments.
          where: yearId ? { yearId: String(yearId) } : undefined,

          include: {
            academicYear: true, // Get the year name (e.g., "2025-2026")

            // Fetch grades and INCLUDE the subject details so we know the subject name
            grades: {
              include: {
                subject: true,
              },
            },

            // Fetch absences and order them from newest to oldest
            absences: {
              orderBy: { date: "desc" },
            },

            // Fetch notes and order them from newest to oldest
            notes: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!studentProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Student not found in the database",
      });
    }

    return studentProfile;
  } catch (error: any) {
    console.error("❌ Error fetching student profile:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch student profile data",
    });
  }
});

export default defineEventHandler(async (event) => {
  const studentId = getRouterParam(event, "id");

  return await prisma.document.findMany({
    where: { studentId: String(studentId) },
    orderBy: { createdAt: "desc" }, // لجعل أحدث الوثائق تظهر أولاً
  });
});

// server/api/students/[id]/documents/index.post.ts
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const studentId = getRouterParam(event, "id");
  if (!studentId)
    throw createError({ statusCode: 400, statusMessage: "معرف الطالب مطلوب" });

  // قراءة البيانات المرسلة (التي تحتوي على الملف)
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "لم يتم العثور على ملفات مرفوعة",
    });
  }

  try {
    // استخراج الحقول والملف من الـ FormData
    let title = "وثيقة بدون عنوان";
    let type = "GENERAL";
    let fileData: Buffer | undefined;
    let originalFilename = "";

    for (const item of formData) {
      if (item.name === "title") title = item.data.toString("utf-8");
      if (item.name === "type") type = item.data.toString("utf-8");
      if (item.name === "file" && item.filename) {
        fileData = item.data;
        originalFilename = item.filename;
      }
    }

    if (!fileData)
      throw createError({ statusCode: 400, statusMessage: "الملف مفقود" });

    // 1. تجهيز اسم ملف فريد ومسار الحفظ
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;

    // المجلد الذي سنحفظ فيه داخل مشروعك (public/uploads/documents)
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "documents",
    );

    // التأكد من أن المجلد موجود (وإلا سيقوم بإنشائه)
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFilename);

    // 2. حفظ الملف فعلياً في السيرفر (داخل مجلد public)
    await writeFile(filePath, fileData);

    // الرابط الذي سيتم حفظه في قاعدة البيانات (ويمكن للمتصفح قراءته)
    const fileUrl = `/uploads/documents/${uniqueFilename}`;

    // 3. حفظ بيانات الوثيقة في قاعدة البيانات باستخدام Prisma
    const document = await prisma.document.create({
      data: {
        studentId: String(studentId),
        title: title,
        type: type,
        fileUrl: fileUrl,
      },
    });

    return document;
  } catch (error: any) {
    console.error("❌ Error uploading document:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "حدث خطأ أثناء رفع وحفظ الوثيقة",
    });
  }
});

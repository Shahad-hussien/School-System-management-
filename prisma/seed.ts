import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client"; // 👈 أضفنا Prisma هنا لجلب الأنواع
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ المتغير DATABASE_URL غير موجود في ملف .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 جاري الاتصال بقاعدة البيانات وزراعة المنهج العراقي...");

  // ✨ التعديل الجوهري هنا: تحديد نوع المصفوفة بدقة
  const subjects: Prisma.SubjectCreateManyInput[] = [];

  const primaryAll = [
    "الأول",
    "الثاني",
    "الثالث",
    "الرابع",
    "الخامس",
    "السادس",
  ];
  const primary456 = ["الرابع", "الخامس", "السادس"];

  const primaryCore = [
    "التربية الإسلامية",
    "القراءة",
    "اللغة الإنكليزية",
    "العلوم",
    "الرياضيات",
  ];

  primaryCore.forEach((name) => {
    primaryAll.forEach((gradeLevel) =>
      subjects.push({
        name,
        stage: "PRIMARY", // الآن سيفهم TS أنها تنتمي للـ Enum
        gradeLevel,
        branch: "GENERAL",
        isActive: true,
      }),
    );
  });

  subjects.push({
    name: "الأخلاقية",
    stage: "PRIMARY",
    gradeLevel: "الأول",
    branch: "GENERAL",
    isActive: true,
  });

  ["القواعد", "الاجتماعيات"].forEach((name) => {
    primary456.forEach((gradeLevel) =>
      subjects.push({
        name,
        stage: "PRIMARY",
        gradeLevel,
        branch: "GENERAL",
        isActive: true,
      }),
    );
  });

  // ... باقي الكود الخاص بالمراحل المتوسطة والإعدادية يكمل بنفس الطريقة ...
  // (بقية الـ pushes ستعمل تلقائياً لأن المصفوفة أصبحت معرفة النوع)

  // === المرحلة المتوسطة ===
  const middleAll = ["الأول", "الثاني", "الثالث"];
  const middleCore = [
    "التربية الإسلامية",
    "اللغة العربية",
    "اللغة الإنكليزية",
    "الاجتماعيات",
    "الفيزياء",
    "الكيمياء",
    "الرياضيات",
    "الأحياء",
  ];
  middleCore.forEach((name) => {
    middleAll.forEach((gradeLevel) =>
      subjects.push({
        name,
        stage: "MIDDLE",
        gradeLevel,
        branch: "GENERAL",
        isActive: true,
      }),
    );
  });

  // === المرحلة الإعدادية ===
  // ... (أكملي باقي الـ pushes كما هي في كودك الأصلي) ...
  // === المرحلة الإعدادية ===
  const highGrades = ["الرابع", "الخامس", "السادس"];

  // مواد مشتركة (توجد في العلمي والأدبي)
  const highCommonCore = [
    "التربية الإسلامية",
    "اللغة العربية",
    "اللغة الإنكليزية",
    "الرياضيات",
  ];

  highCommonCore.forEach((name) => {
    highGrades.forEach((gradeLevel) => {
      // إضافة للفرع العلمي
      subjects.push({
        name,
        stage: "HIGH",
        gradeLevel,
        branch: "SCIENTIFIC",
        isActive: true,
      });
      // إضافة للفرع الأدبي
      subjects.push({
        name,
        stage: "HIGH",
        gradeLevel,
        branch: "LITERARY",
        isActive: true,
      });
    });
  });

  // مواد خاصة بالفرع العلمي فقط
  const scientificOnly = ["الفيزياء", "الكيمياء", "الأحياء"];
  scientificOnly.forEach((name) => {
    highGrades.forEach((gradeLevel) => {
      subjects.push({
        name,
        stage: "HIGH",
        gradeLevel,
        branch: "SCIENTIFIC",
        isActive: true,
      });
    });
  });

  // مواد خاصة بالفرع الأدبي فقط
  const literaryOnly = ["التاريخ", "الجغرافيا", "الاقتصاد"];
  literaryOnly.forEach((name) => {
    highGrades.forEach((gradeLevel) => {
      subjects.push({
        name,
        stage: "HIGH",
        gradeLevel,
        branch: "LITERARY",
        isActive: true,
      });
    });
  });
  // === تنفيذ الزراعة ===
  console.log(`⏳ جاري إرسال ${subjects.length} مادة إلى قاعدة البيانات...`);

  const result = await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true,
  });

  console.log(`✅ تم بنجاح! زراعة ${result.count} مادة دراسية في النظام.`);
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ أثناء الزراعة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

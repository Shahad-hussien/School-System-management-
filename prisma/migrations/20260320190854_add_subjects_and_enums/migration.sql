/*
  Warnings:

  - Added the required column `branch` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stage` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EducationalStage" AS ENUM ('PRIMARY', 'MIDDLE', 'HIGH');

-- CreateEnum
CREATE TYPE "StudyBranch" AS ENUM ('GENERAL', 'SCIENTIFIC', 'LITERARY');

-- CreateEnum
CREATE TYPE "ExamResultState" AS ENUM ('PASSED', 'FAILED', 'MAKE_UP');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "branch" "StudyBranch" NOT NULL,
ADD COLUMN     "failureYear" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stage" "EducationalStage" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "EducationalStage" NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "branch" "StudyBranch" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "firstTermMonth1" DOUBLE PRECISION,
    "firstTermMonth2" DOUBLE PRECISION,
    "firstTermMonth3" DOUBLE PRECISION,
    "midYear" DOUBLE PRECISION,
    "midYearState" "ExamResultState",
    "secondTermMonth1" DOUBLE PRECISION,
    "secondTermMonth2" DOUBLE PRECISION,
    "finalExam" DOUBLE PRECISION,
    "finalState" "ExamResultState",

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "authorname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

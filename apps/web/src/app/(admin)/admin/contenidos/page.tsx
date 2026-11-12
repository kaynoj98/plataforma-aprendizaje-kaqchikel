import { CourseDirectory } from "@/components/academics/course-directory";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  return <CourseDirectory section="contenidos" page={(await searchParams).page} />;
}

import { describe, expect, it } from "vitest";

import {
  adminListCoursesQuerySchema,
  courseIdParamsSchema,
  courseSlugParamsSchema,
  createCourseSchema,
  publicListCoursesQuerySchema,
  updateCourseSchema,
} from "../src/modules/courses/course.schemas.js";

describe("Esquemas de cursos", () => {
  it("acepta creación válida de curso", () => {
    const result = createCourseSchema.safeParse({
      title: "Kaqchikel inicial",
      description:
        "Curso introductorio para el aprendizaje del idioma kaqchikel.",
      objectives: "Reconocer vocabulario básico y expresiones comunes.",
      difficulty: "BEGINNER",
      position: 1,
      isPublicPreview: true,
    });

    expect(result.success).toBe(true);
  });

  it("rechaza título muy corto", () => {
    const result = createCourseSchema.safeParse({
      title: "Ka",
      description:
        "Curso introductorio para el aprendizaje del idioma kaqchikel.",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza actualización vacía", () => {
    const result = updateCourseSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("aplica valores por defecto en listado admin", () => {
    const result = adminListCoursesQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("aplica valores por defecto en listado público", () => {
    const result = publicListCoursesQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.sortBy).toBe("position");
      expect(result.data.sortOrder).toBe("asc");
    }
  });

  it("acepta UUID válido de curso", () => {
    const result = courseIdParamsSchema.safeParse({
      courseId: "7de05f79-21eb-4a2c-bd75-899a63fbb843",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza UUID inválido de curso", () => {
    const result = courseIdParamsSchema.safeParse({
      courseId: "abc",
    });

    expect(result.success).toBe(false);
  });

  it("acepta slug válido", () => {
    const result = courseSlugParamsSchema.safeParse({
      slug: "kaqchikel-inicial",
    });

    expect(result.success).toBe(true);
  });
});

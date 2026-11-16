import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import { type Definition, totals, reveals } from "./activity.schemas.js";

import { env } from "../../config/env.js";
import {
  storageService,
  practiceImageKey,
} from "../../services/storage.service.js";
import {
  MAX_BYTES_BY_MEDIA_TYPE,
  MEDIA_TYPE_BY_MIME,
} from "../media/media.constants.js";

type Tx = Prisma.TransactionClient;
type Choice = { questionId: string; optionId: string };
const published = { status: "PUBLISHED", deletedAt: null } as const;
const publicLesson = {
  ...published,
  unit: { ...published, level: { ...published, course: published } },
};
const available = { isVisible: true, lesson: publicLesson };
const content = {
  questions: {
    orderBy: { position: "asc" },
    include: { options: { orderBy: { position: "asc" } } },
  },
} as const;
type Version = Prisma.ActivityVersionGetPayload<{ include: typeof content }>;
const latest = { orderBy: { number: "desc" }, take: 1 } as const;
function missing(): never {
  throw new AppError(
    404,
    "ACTIVITY_NOT_FOUND",
    "La práctica no está disponible.",
  );
}
function conflict(): never {
  throw new AppError(
    409,
    "ACTIVITY_CHANGED",
    "La práctica cambió. Recarga para continuar.",
  );
}

export async function listActivities(lessonId: string, admin: boolean) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, ...(admin ? { deletedAt: null } : publicLesson) },
    select: { id: true },
  });
  if (!lesson) missing();
  const rows = await prisma.activity.findMany({
    where: { lessonId, ...(admin ? {} : available) },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: {
      id: true,
      type: true,
      position: true,
      isVisible: true,
      revision: true,
      versions: {
        ...latest,
        select: {
          title: true,
          instructions: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });
  return rows.map(({ versions, ...row }) => ({
    ...row,
    title: versions[0]!.title,
    instructions: versions[0]!.instructions,
    total: versions[0]!._count.questions,
  }));
}

async function writeVersion(
  tx: Tx,
  activityId: string,
  number: number,
  draft: Definition,
) {
  const ids = [
    ...new Set(
      draft.questions.flatMap((q) => (q.vocabularyId ? [q.vocabularyId] : [])),
    ),
  ];
  const words = await tx.vocabularyItem.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, termKaqchikel: true, translationSpanish: true },
  });
  if (words.length !== ids.length)
    throw new AppError(
      400,
      "VOCABULARY_UNAVAILABLE",
      "Revisa los términos de vocabulario seleccionados.",
    );
  const terms = new Map(words.map((w) => [w.id, w.termKaqchikel]));
  const imageIds = [
    ...new Set(
      draft.questions.flatMap((q) => (q.imageMediaId ? [q.imageMediaId] : [])),
    ),
  ].sort();
  if (imageIds.length) {
    // El borrado lógico adquiere el mismo bloqueo antes de consultar las referencias.
    await tx.$queryRaw`SELECT id FROM media_files WHERE id IN (${Prisma.join(imageIds.map((id) => Prisma.sql`${id}::uuid`))}) ORDER BY id FOR UPDATE`;
    const images = await tx.mediaFile.findMany({
      where: {
        id: { in: imageIds },
        mediaType: "IMAGE",
        status: "AVAILABLE",
        deletedAt: null,
        mimeType: {
          in: Object.keys(MEDIA_TYPE_BY_MIME).filter(
            (mime) => MEDIA_TYPE_BY_MIME[mime] === "IMAGE",
          ),
        },
        sizeBytes: { gt: 0, lte: MAX_BYTES_BY_MEDIA_TYPE.IMAGE },
      },
      select: { objectKey: true },
    });
    if (images.length !== imageIds.length)
      throw new AppError(
        400,
        "INVALID_IMAGE",
        "Selecciona una imagen disponible de hasta 10 MiB.",
      );
    for (const q of draft.questions) {
      const linked = words.find((w) => w.id === q.vocabularyId);
      if (
        linked &&
        [linked.termKaqchikel, linked.translationSpanish].some((label) =>
          reveals(q.imageDescription, label),
        )
      )
        throw new AppError(
          400,
          "REVEALING_DESCRIPTION",
          "La pista contiene el término vinculado.",
        );
    }
    for (const image of images)
      await storageService.preparePracticeImage(image.objectKey);
  }
  return tx.activityVersion.create({
    data: {
      activityId,
      number,
      title: draft.title,
      instructions: draft.instructions,
      questions: {
        create: draft.questions.map((q, position) => ({
          imageMediaId: q.imageMediaId,
          imageDescription: q.imageDescription,
          prompt: q.prompt,
          feedback: q.feedback,
          position,
          vocabularyId: q.vocabularyId,
          termSnapshot: q.vocabularyId ? terms.get(q.vocabularyId) : null,
          correctPosition: q.options.findIndex((o) => o.correct),
          options: {
            create: q.options.map((o, i) => ({ position: i, label: o.label })),
          },
        })),
      },
    },
    select: { id: true },
  });
}
export async function create(
  lessonId: string,
  position: number,
  draft: Definition,
  requestId: string,
) {
  return prisma.$transaction(
    async (tx) => {
      if (
        !(await tx.lesson.findFirst({
          where: { id: lessonId, deletedAt: null },
          select: { id: true },
        }))
      )
        missing();
      const inserted = await tx.activity.createMany({
        data: { id: requestId, lessonId, position, type: draft.type },
        skipDuplicates: true,
      });
      if (!inserted.count)
        throw new AppError(
          409,
          "ACTIVITY_EXISTS",
          "Esta solicitud ya se guardó. Recarga las actividades.",
        );
      await writeVersion(tx, requestId, 1, draft);
      return { id: requestId };
    },
    { timeout: 120000 },
  );
}
export async function edit(
  id: string,
  revision: number,
  position: number,
  isVisible: boolean,
  draft?: Definition,
) {
  return prisma.$transaction(
    async (tx) => {
      const updated = await tx.activity.updateMany({
        where: {
          id,
          revision,
          ...(draft ? { type: draft.type } : {}),
          lesson: { deletedAt: null },
        },
        data: {
          position,
          isVisible: draft ? false : isVisible,
          revision: { increment: 1 },
        },
      });
      if (!updated.count) conflict();
      if (draft) await writeVersion(tx, id, revision + 1, draft);
      return { id, revision: revision + 1 };
    },
    { timeout: 120000 },
  );
}
async function current(tx: Tx, id: string, admin: boolean) {
  const row = await tx.activity.findFirst({
    where: { id, ...(admin ? { lesson: { deletedAt: null } } : available) },
    include: { versions: { ...latest, include: content } },
  });
  if (!row?.versions[0]) missing();
  return { activity: row, version: row.versions[0] };
}
export async function readAdmin(id: string) {
  const { activity, version } = await current(prisma, id, true);
  return {
    revision: activity.revision,
    position: activity.position,
    isVisible: activity.isVisible,
    definition: {
      type: activity.type,
      title: version.title,
      instructions: version.instructions,
      questions: version.questions.map((q) => ({
        prompt: q.prompt,
        feedback: q.feedback,
        vocabularyId: q.vocabularyId,
        term: q.termSnapshot,
        imageMediaId: q.imageMediaId,
        imageDescription: q.imageDescription,
        options: q.options.map((o) => ({
          label: o.label,
          correct: o.position === q.correctPosition,
        })),
      })),
    },
  };
}
function evaluate(v: Version, index: number, choice: Choice) {
  const q = v.questions[index];
  if (!q || q.id !== choice.questionId) conflict();
  const option = q.options.find((o) => o.id === choice.optionId);
  if (!option)
    throw new AppError(
      400,
      "INVALID_OPTION",
      "La opción no pertenece a esta pregunta.",
    );
  return {
    correct: option.position === q.correctPosition,
    feedback: q.feedback,
  };
}
function view(
  v: Version,
  answers: { correct: boolean }[],
  attemptId: string | null,
) {
  const q = v.questions[answers.length];
  return {
    attemptId,
    versionId: v.id,
    title: v.title,
    instructions: v.instructions,
    total: v.questions.length,
    answered: answers.length,
    question: q
      ? {
          id: q.id,
          prompt: q.prompt,
          ...(q.imageMediaId
            ? { imageDescription: q.imageDescription }
            : { term: q.termSnapshot }),
          options: q.options.map(({ id, label }) => ({ id, label })),
        }
      : null,
    result: q
      ? null
      : totals(v.questions.length, answers.filter((a) => a.correct).length),
  };
}

export async function questionImage(
  id: string,
  questionId: string,
  studentId?: string,
) {
  const scope = studentId
    ? { activity: available, attempts: { some: { id, userId: studentId } } }
    : { activity: { id, lesson: { deletedAt: null } } };
  const q = await prisma.activityQuestion.findFirst({
    where: { id: questionId, version: scope },
    select: {
      imageMedia: {
        select: {
          objectKey: true,
          status: true,
          deletedAt: true,
          mediaType: true,
        },
      },
    },
  });
  const media = q?.imageMedia;
  if (
    !media ||
    media.status !== "AVAILABLE" ||
    media.deletedAt ||
    media.mediaType !== "IMAGE"
  )
    missing();
  return {
    url: await storageService.createAccessUrl(
      practiceImageKey(media.objectKey),
    ),
    expiresInMinutes: env.MEDIA_ACCESS_URL_MINUTES,
  };
}

export async function preview(
  id: string,
  versionId: string | undefined,
  choices: Choice[],
) {
  const { version } = await current(prisma, id, true);
  if (versionId && versionId !== version.id) conflict();
  const answers = choices.map((answer, i) => evaluate(version, i, answer));
  return {
    state: view(version, answers, null),
    feedback: answers.at(-1) ?? null,
  };
}
const attemptData = {
  version: { include: content },
  answers: { orderBy: { question: { position: "asc" } } },
} as const;
export async function begin(id: string, userId: string, requestId: string) {
  return prisma.$transaction(async (tx) => {
    // Serializa inicios para la misma práctica, incluidos dobles clics desde pestañas diferentes.
    await tx.$queryRaw`SELECT id FROM activities WHERE id=${id}::uuid FOR UPDATE`;
    const { version } = await current(tx, id, false);
    const replay = await tx.activityAttempt.findUnique({
      where: { userId_requestId: { userId, requestId } },
      include: attemptData,
    });
    if (replay && replay.version.activityId !== id) conflict();
    const attempt =
      replay ??
      (await tx.activityAttempt.findFirst({
        where: { userId, completedAt: null, version: { activityId: id } },
        include: attemptData,
      })) ??
      (await tx.activityAttempt.create({
        data: { userId, requestId, versionId: version.id },
        include: attemptData,
      }));
    return view(attempt.version, attempt.answers, attempt.id);
  });
}
export async function answer(
  attemptId: string,
  userId: string,
  selected: Choice,
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM activity_attempts WHERE id=${attemptId}::uuid AND user_id=${userId}::uuid FOR UPDATE`;
    const attempt = await tx.activityAttempt.findFirst({
      where: { id: attemptId, userId, version: { activity: available } },
      include: attemptData,
    });
    if (!attempt) missing();
    const { version, answers } = attempt;
    const previous = answers.findIndex(
      (a) => a.questionId === selected.questionId,
    );
    if (previous >= 0 && answers[previous]!.optionId !== selected.optionId)
      conflict();
    const feedback = evaluate(
      version,
      previous >= 0 ? previous : answers.length,
      selected,
    );
    if (previous < 0) {
      const saved = await tx.activityAnswer.create({
        data: {
          attemptId,
          versionId: version.id,
          ...selected,
          correct: feedback.correct,
        },
      });
      answers.push(saved);
      if (answers.length === version.questions.length)
        await tx.activityAttempt.update({
          where: { id: attemptId },
          data: { completedAt: new Date() },
        });
    }
    return { state: view(version, answers, attemptId), feedback };
  });
}

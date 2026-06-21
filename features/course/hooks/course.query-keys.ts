export const courseKeys = {
  lists: ["courses"] as const,
  details: ["course"] as const,
  manageable: (courseId: string) => [...courseKeys.details, "manage", courseId] as const,
  content: (courseId: string) => [...courseKeys.manageable(courseId), "content"] as const,
}

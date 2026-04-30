const AVATAR_COLORS = [
  { bg: "#DAE2FF", text: "#001848" },
  { bg: "#82F9BE", text: "#002113" },
  { bg: "#FFE3E3", text: "#C92A2A" },
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  IN_PROGRESS:          { bg: "#CDDDFF", label: "IN PROGRESS" },
  TO_DO:                { bg: "#CDDDFF", label: "TO DO" },
  DONE:                 { bg: "#82F9BE", label: "DONE" },
  BLOCKED:              { bg: "#FFE3E3", label: "URGENT" },
  IN_REVIEW:            { bg: "#CDDDFF", label: "REVIEW" },
  READY_FOR_QA:         { bg: "#CDDDFF", label: "READY FOR QA" },
  REOPENED:             { bg: "#FFE3E3", label: "REOPENED" },
  READY_FOR_PRODUCTION: { bg: "#CDDDFF", label: "READY FOR PROD" },
};
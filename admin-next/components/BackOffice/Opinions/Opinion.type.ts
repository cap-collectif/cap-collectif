export type UserOption = { label: string; value: string }

export type OpinionFormValues = {
  title: string
  author: UserOption | null
  position: number | string | null
  body: string
  pinned: boolean
  trashedStatus: string
  trashedReason: string
  answerTitle: string
  answerAuthor: UserOption | null
  answerBody: string
} & Record<string, unknown>

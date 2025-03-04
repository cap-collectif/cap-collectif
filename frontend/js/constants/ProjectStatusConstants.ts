export type ProjectType = {
  id: number
  title: string
}
const FUTURE = 0
const OPENED = 1
const OPENED_PARTICIPATION = 2
const CLOSED = 3
export const PROJECT_STATUSES: ProjectType[] = [
  {
    id: FUTURE,
    title: 'ongoing-and-future',
  },
  {
    id: OPENED,
    title: 'step.status.open',
  },
  {
    id: OPENED_PARTICIPATION,
    title: 'step.status.open.participation',
  },
  {
    id: CLOSED,
    title: 'step.status.closed',
  },
]

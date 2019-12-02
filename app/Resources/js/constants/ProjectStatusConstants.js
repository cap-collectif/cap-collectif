// @flow

export type ProjectType = { id: number, title: string };

const FUTURE = 0;
const OPENED = 1;
const CLOSED = 2;

export const PROJECT_STATUSES: ProjectType[] = [
  { id: FUTURE, title: 'ongoing-and-future' },
  { id: OPENED, title: 'step.status.open' },
  { id: CLOSED, title: 'step.status.closed' },
];

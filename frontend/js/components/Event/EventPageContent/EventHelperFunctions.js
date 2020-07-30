// @flow

export const getEndDateFromStartAt = (startAt: string): Date => {
  const endAtDate = new Date(startAt);
  endAtDate.setDate(endAtDate.getDate() + 1);
  endAtDate.setHours(0, 0, 0, 0);
  return endAtDate;
};

export const isEventLive = (startAt: ?string, endAt: ?string, now: Date = new Date()): boolean => {
  const isStarted = startAt != null ? new Date(startAt).getTime() <= now.getTime() : false;
  // By default, endAt is at the end of the start day if omitted.
  if (startAt != null && endAt == null) {
    endAt = new Date(getEndDateFromStartAt(startAt)).toUTCString();
  }
  const isEnded = endAt != null ? new Date(endAt).getTime() <= now.getTime() : false;
  return isStarted && !isEnded;
};

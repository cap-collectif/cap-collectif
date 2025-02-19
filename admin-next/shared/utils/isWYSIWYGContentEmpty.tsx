export const isWYSIWYGContentEmpty = (content?: string) =>
  content === null || content === undefined || content === '<p><br></p>' || content === '&nbsp;' || content === ''

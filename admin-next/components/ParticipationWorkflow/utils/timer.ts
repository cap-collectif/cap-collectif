export const fakeTimer = (durationInMs: number = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, durationInMs)
  })
}

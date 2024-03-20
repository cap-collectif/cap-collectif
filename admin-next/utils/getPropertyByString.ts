export function getPropertyByString<T>(obj: T, propString: string): T {
  const props = propString.split('.')
  let currentProp = obj

  for (let i = 0; i < props.length; i++) {
    const prop = props[i]

    if (Array.isArray(currentProp) && !isNaN(parseInt(prop))) {
      currentProp = currentProp[parseInt(prop)]
    } else {
      currentProp = currentProp[prop]
    }

    if (currentProp === undefined) {
      return undefined
    }
  }

  return currentProp
}

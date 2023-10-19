const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, 'text/html')
  return doc.documentElement?.textContent || input
}

export default htmlDecode

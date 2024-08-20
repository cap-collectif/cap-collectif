const uuid = (): string => {
  const _p8 = (s?: boolean): string => {
    const p = `${Math.random().toString(16)}000000000`.substr(2, 8)
    return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p
  }
  return _p8() + _p8(true) + _p8(true) + _p8()
}

export const isUuid = (id: string) => {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
  return regexExp.test(id)
}

export const isTmp = (id: string) => {
  return id.startsWith('temp-')
}

export const isUuidOrTmp = (id: string) => {
  return isUuid(id) || isTmp(id)
}

export default uuid

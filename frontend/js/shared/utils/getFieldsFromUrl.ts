type FiltersFromUrlOptions<T extends {} = {}> = {
  whitelist?: string[]
  blacklist?: string[]
  default?: T
}
type UpdateQueryUrlOptions = {
  delete?: boolean
  value?: string | string[]
  append?: boolean
  replaceState?: boolean
}
export const updateQueryUrl = (url: URL, key: string, options: UpdateQueryUrlOptions) => {
  if (window.location.href) {
    // update the url href, e.g when navigating with react-router, to keep the value up to date
    url.href = window.location.href
  }

  if (options.delete) {
    url.searchParams.delete(key)
  } else if (options.append && options.value && typeof options.value === 'string') {
    url.searchParams.append(key, options.value)
  } else if (options.value) {
    if (typeof options.value === 'string') {
      url.searchParams.set(key, options.value)
    } else if (Array.isArray(options.value)) {
      url.searchParams.delete(key)
      ;(options.value as any as string[]).forEach(id => url.searchParams.append(key, id))
    }
  }

  if (options.replaceState ?? true) {
    window.history.replaceState(null, '', url.toString())
  }
}
export const clearQueryUrl = (
  url: URL,
  options?: {
    replaceState: boolean
  },
) => {
  if (window.location.href) {
    // update the url href, e.g when navigating with react-router, to keep the value up to date
    url.href = window.location.href
  }

  url.href = url.href.replace(url.search, '')

  if (options?.replaceState ?? true) {
    window.history.replaceState(null, '', url.toString())
  }
}
export const getFieldsFromUrl = <T extends {}>(url: URL, options?: FiltersFromUrlOptions<T>): T => {
  if (window.location.href) {
    // update the url href, e.g when navigating with react-router, to keep the value up to date
    url.href = window.location.href
  }

  const fields = {}

  for (const entry of url.searchParams.entries()) {
    const [name, value] = entry
    const formattedValue = url.searchParams.getAll(name)

    if (!options?.whitelist || (options?.whitelist && options.whitelist.includes(name) && value)) {
      fields[name] = formattedValue.length === 1 ? formattedValue[0] : formattedValue
    }

    if (options?.blacklist && options.blacklist.includes(name) && value) {
      if (name in fields) {
        delete fields[name]
      }
    }
  }

  return { ...(options?.default && { ...options.default }), ...fields } as any as T
}
export const URL_FILTER_WHITELIST = [
  'state',
  'theme',
  'district',
  'category',
  'analysts',
  'supervisor',
  'decisionMaker',
]

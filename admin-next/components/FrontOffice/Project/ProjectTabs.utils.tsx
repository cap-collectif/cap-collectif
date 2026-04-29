export const isTabVisible = tab => {
  if (!tab.enabled) return false
  if (tab.news !== undefined) return tab.news.length > 0
  if (tab.events !== undefined) return tab.events.length > 0
  return true
}

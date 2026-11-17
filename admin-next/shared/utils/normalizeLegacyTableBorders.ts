export const normalizeLegacyTableBorders = (value?: string): string | undefined => {
  if (!value) return value

  const template = document.createElement('template')
  template.innerHTML = value
  let changed = false
  template.content.querySelectorAll('table[border]').forEach(table => {
    if (Number(table.getAttribute('border')) > 0) {
      table.classList.add('table')
      table.removeAttribute('border')
      changed = true
    }
  })

  return changed ? template.innerHTML : value
}

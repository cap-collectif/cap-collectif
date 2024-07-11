const focusOnClose = (proposalId: string | null) => {
  if (!proposalId) return
  const btnToFocus: null | HTMLElement = document.querySelector(
    `#proposal-vote-btn-${proposalId.replace(/([<>*()?=])/g, '\\$1')}`,
  )
  if (btnToFocus) btnToFocus.focus()
}

export default focusOnClose

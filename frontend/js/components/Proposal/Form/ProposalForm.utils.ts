const scrollToFormError = (errors: any) => {
  const sortedFields = [
    'title',
    'summary',
    'author',
    'publishedAt',
    'theme',
    'category',
    'addressText',
    'district',
    'body',
    'responses',
    'webPageUrl',
    'twitterUrl',
    'facebookUrl',
    'instagramUrl',
    'linkedInUrl',
    'youtubeUrl',
  ]
  const error = sortedFields.find(elem => {
    if (errors[elem]) {
      return elem
    }
  })
  if (error) {
    let selector = ''
    if (error !== 'responses') {
      selector = `proposal_${error}_container`
      const element = document.getElementsByClassName(selector)[0]
      if (element) element.scrollIntoView(true)
    }
    if (error === 'responses') {
      const index = errors.responses.findIndex((elem: HTMLElement) => elem !== undefined)
      if (index !== -1) {
        selector = `label-proposal-form-responses${index}`
        const element = document.getElementById(selector)
        if (element) element.scrollIntoView(true)
        else {
          // Lists have a different id format
          const listSelector = `label-select-proposal-form-responses${index}`
          const el = document.getElementById(listSelector)
          if (el) el.scrollIntoView(true)
        }
      }
    }
  }
}

export default scrollToFormError

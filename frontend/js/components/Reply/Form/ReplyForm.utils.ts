const OFFSET = 70

const scrollToFormError = (errors: any, reply: any) => {
  if (reply) {
    if (errors.responses) {
      const index = errors.responses.findIndex(elem => elem !== undefined)
      if (index !== -1) {
        const selector = `-UpdateReplyForm-${reply.id}-responses${index}`
        const element = document.querySelector(`label[id$=${selector}]`)
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - OFFSET
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }
    }
  } else if (errors.responses) {
    const index = errors.responses.findIndex(elem => elem !== undefined)
    if (index !== -1) {
      const selector = `-CreateReplyForm-responses${index}`
      const element = document.querySelector(`label[id$=${selector}]`)
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - OFFSET
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }
}
export default scrollToFormError

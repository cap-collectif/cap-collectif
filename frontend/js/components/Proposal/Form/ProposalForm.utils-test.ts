import scrollToFormError from './ProposalForm.utils'

describe('scrollToFormError', () => {
  it('scrolls to the address before a later response error', () => {
    const scrollTo = jest.fn()
    document.body.innerHTML = `
      <div class="proposal_addressText_container"></div>
      <label id="label-proposal-form-responses0"></label>
    `
    document.getElementsByClassName('proposal_addressText_container')[0].scrollIntoView = scrollTo

    scrollToFormError({ address: 'proposal.constraints.address', responses: [{ value: 'required' }] })

    expect(scrollTo).toHaveBeenCalledWith(true)
  })

  it.each(['webPageUrl', 'twitterUrl', 'facebookUrl', 'instagramUrl', 'linkedInUrl', 'youtubeUrl'])(
    'scrolls to the %s field error',
    field => {
      const scrollTo = jest.fn()
      document.body.innerHTML = `<div class="proposal_${field}_container"></div>`
      document.getElementsByClassName(`proposal_${field}_container`)[0].scrollIntoView = scrollTo

      scrollToFormError({ [field]: 'invalid URL' })

      expect(scrollTo).toHaveBeenCalledWith(true)
    },
  )
})

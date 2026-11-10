import { Base } from '..'

export default new (class ProposalVote {
  get cy() {
    return cy
  }

  moveLastVoteToFirst(tableSelector: string) {
    cy.get(tableSelector).scrollIntoView()
    cy.window().then(win => {
      cy.get(`${tableSelector} [draggable="true"]`).then($items => {
        const source = $items[$items.length - 1]
        const target = $items[0]
        const dataTransfer = new win.DataTransfer()
        const dispatch = (element: HTMLElement, type: string) => {
          const rect = element.getBoundingClientRect()
          element.dispatchEvent(
            new win.DragEvent(type, {
              bubbles: true,
              cancelable: true,
              dataTransfer,
              clientX: rect.x + rect.width / 2,
              clientY: rect.y + 1,
            }),
          )
        }
        dispatch(source, 'dragstart')
        // Native drag start is published on the next animation frame.
        return new Cypress.Promise<void>(resolve => {
          win.requestAnimationFrame(() => {
            dispatch(target, 'dragenter')
            dispatch(target, 'dragover')
            dispatch(target, 'drop')
            dispatch(source, 'dragend')
            resolve()
          })
        })
      })
    })
  }

  visitSelection({
    projectSlug,
    stepSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/selection/${stepSlug}`, operationName })
  }

  visitProposal({
    projectSlug,
    stepSlug,
    proposalSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    proposalSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/selection/${stepSlug}/proposals/${proposalSlug}`, operationName })
  }

  visitCollect({
    projectSlug,
    stepSlug,
    proposalSlug,
    operationName,
  }: {
    projectSlug: string
    stepSlug: string
    proposalSlug: string
    operationName: string
  }) {
    Base.visit({ path: `/project/${projectSlug}/collect/${stepSlug}/proposals/${proposalSlug}`, operationName })
  }
})()

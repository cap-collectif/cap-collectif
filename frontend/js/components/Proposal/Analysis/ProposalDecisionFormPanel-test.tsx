/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import { reducer as formReducer, reduxForm } from 'redux-form'
import { getInitialEstimatedCost, ProposalDecisionFormPanel } from './ProposalDecisionFormPanel'
import { $fragmentRefs, $refType, formMock } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalDecisionFormPanel  /> ', () => {
  const props = {
    ...formMock,
    onValidate: jest.fn(),
    proposalRevisionsEnabled: false,
    initialIsApproved: 'FAVOURABLE',
    costEstimationEnabled: true,
    proposal: {
      id: 'id',
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
      assessment: {
        id: 'assessmentid2',
        officialResponse: 'ueueueueueue',
        estimatedCost: null,
      },
      decision: {
        state: 'DONE',
        estimatedCost: 43,
        refusedReason: {
          label: 'name',
          value: 'id',
        },
        officialResponse: {
          id: 'pid',
          body: 'oe',
          authors: [
            {
              value: 'decidorId',
              label: 'username',
            },
          ],
        },
        isApproved: true,
      },
      form: {
        analysisConfiguration: {
          costEstimationEnabled: true,
          effectiveDate: 'Vers le 12 à peu près en même temps que la fermeture des locaux',
          unfavourableStatuses: [
            {
              value: 'id',
              label: 'name',
            },
          ],
        },
      },
      authorEmail: 'toto@toto.com',
    },
  }
  it('renders correctly', () => {
    const wrapper = shallow(<ProposalDecisionFormPanel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with proposal revisions feature enabled', () => {
    const ownProps = { ...props, proposalRevisionsEnabled: true }
    const wrapper = shallow(<ProposalDecisionFormPanel {...ownProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Renders real radio fields and verifies the visible finalization control after a user choice.
   */
  it('requires an approval choice before allowing a draft to be finalized', () => {
    const store = createStore(combineReducers({ form: formReducer, language: () => ({ currentLanguage: 'en-GB' }) }))
    const DraftForm = reduxForm({ form: 'decision-draft-test' })(ProposalDecisionFormPanel)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const proposal = {
      ...props.proposal,
      decision: { ...props.proposal.decision, isApproved: null, state: 'IN_PROGRESS' },
      form: {
        analysisConfiguration: { ...props.proposal.form.analysisConfiguration, effectiveDate: '2026-10-01T12:00:00Z' },
      },
    }

    try {
      act(() => {
        root.render(
          React.createElement(
            Provider,
            { store },
            React.createElement(
              IntlProvider,
              { locale: 'en', messages: {} },
              <DraftForm
                proposal={proposal}
                costEstimationEnabled
                proposalRevisionsEnabled={false}
                onValidate={jest.fn()}
                initialIsApproved={null}
                initialValues={{ authors: [] }}
              />,
            ),
          ),
        )
      })
      const radios = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
      const validate = Array.from(container.querySelectorAll('button')).find(
        button => button.textContent === 'validate',
      )
      expect(radios).toHaveLength(2)
      expect(radios.every(radio => !radio.checked)).toBe(true)
      expect(validate?.disabled).toBe(true)

      act(() => radios.find(radio => radio.value === 'FAVOURABLE')?.click())

      expect(radios.find(radio => radio.value === 'FAVOURABLE')?.checked).toBe(true)
      expect(validate?.disabled).toBe(false)
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})

/**
 * @jest-status compliant
 * @jest-reason Checks the public cost-selection function with explicit inputs and scalar expectations.
 */
describe('initial decision cost', () => {
  it.each([
    {
      name: 'the decision cost when both costs exist',
      assessment: { estimatedCost: 99996 },
      decision: { estimatedCost: 100000, isApproved: true },
      expected: 100000,
    },
    {
      name: 'the assessment cost when the decision cost is missing',
      assessment: { estimatedCost: 50000 },
      decision: { estimatedCost: null, isApproved: true },
      expected: 50000,
    },
    {
      name: 'the assessment cost when there is no decision',
      assessment: { estimatedCost: 50000 },
      decision: null,
      expected: 50000,
    },
    {
      name: 'zero when neither cost exists',
      assessment: { estimatedCost: null },
      decision: { estimatedCost: null, isApproved: true },
      expected: 0,
    },
    {
      name: 'a zero decision cost over the assessment cost',
      assessment: { estimatedCost: 50000 },
      decision: { estimatedCost: 0, isApproved: true },
      expected: 0,
    },
  ])('uses $name', ({ assessment, decision, expected }) => {
    expect(getInitialEstimatedCost({ assessment, decision })).toBe(expected)
  })
})

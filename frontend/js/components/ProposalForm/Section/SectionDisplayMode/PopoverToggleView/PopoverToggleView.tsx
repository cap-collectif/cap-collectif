import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import { PopoverToggleViewContainer, ListStep } from './PopoverToggleView.style'
import type { PopoverToggleView_proposalForm } from '~relay/PopoverToggleView_proposalForm.graphql'
import type { ProposalViewMode } from '~/redux/modules/proposal'

const getStepsDependOfView = (proposalForm: PopoverToggleView_proposalForm, typeView: ProposalViewMode) => {
  return proposalForm.step?.project?.steps.filter(Boolean).filter(step => step.mainView === typeView)
}

type Props = {
  proposalForm: PopoverToggleView_proposalForm
  typeView: ProposalViewMode
}

const PopoverToggleView = ({ proposalForm, typeView }: Props) => {
  const steps = getStepsDependOfView(proposalForm, typeView)
  return (
    <PopoverToggleViewContainer>
      <div className="header">
        <p className="title">
          <FormattedMessage id="confirmation.disabling.display.mode" />
        </p>
      </div>
      <p className="description">
        <FormattedMessage id="confirmation.disabling.display.mode.help.text" />
      </p>

      {steps && steps.length > 0 && (
        <ListStep>
          {steps.map(step => (
            <li key={step.id}>
              <a href={step?.url}>{step?.title}</a>
            </li>
          ))}
        </ListStep>
      )}
    </PopoverToggleViewContainer>
  )
}

export default createFragmentContainer(PopoverToggleView, {
  proposalForm: graphql`
    fragment PopoverToggleView_proposalForm on ProposalForm {
      step {
        project {
          steps {
            id
            ... on CollectStep {
              title
              url
              mainView
            }
            ... on SelectionStep {
              title
              url
              mainView
            }
          }
        }
      }
    }
  `,
})

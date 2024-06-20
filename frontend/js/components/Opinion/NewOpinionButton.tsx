import React from 'react'
import cn from 'classnames'
import { graphql, createFragmentContainer } from 'react-relay'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'
import LoginOverlay from '../Utils/LoginOverlay'
import OpinionCreateModal from './Create/OpinionCreateModal'
import { openOpinionCreateModal } from '../../redux/modules/opinion'
import type { NewOpinionButton_section } from '~relay/NewOpinionButton_section.graphql'
import type { NewOpinionButton_consultation } from '~relay/NewOpinionButton_consultation.graphql'
import type { Dispatch } from '../../types'
type Props = {
  readonly section: NewOpinionButton_section
  readonly consultation: NewOpinionButton_consultation
  readonly label: string
  readonly className: string
  readonly dispatch: Dispatch
}

const NewOpinionButton = ({ dispatch, label, consultation, section, className }: Props) => {
  const disabled = !consultation.contribuable
  const intl = useIntl()
  return (
    <React.Fragment>
      <LoginOverlay>
        <button
          type="button"
          disabled={disabled}
          id={`btn-add--${section.slug}`}
          aria-label={intl.formatMessage({
            id: 'add-proposal',
          })}
          className={cn('btn btn-primary', className)}
          onClick={() => {
            dispatch(openOpinionCreateModal(section.id))
          }}
        >
          <i className="cap cap-add-1" />
          <span className="hidden-xs">{label}</span>
        </button>
      </LoginOverlay>
      <OpinionCreateModal section={section} consultation={consultation} />
    </React.Fragment>
  )
}

// @ts-ignore
const container = connect()(NewOpinionButton)
export default createFragmentContainer(container, {
  section: graphql`
    fragment NewOpinionButton_section on Section {
      id
      slug
      ...OpinionCreateModal_section
    }
  `,
  consultation: graphql`
    fragment NewOpinionButton_consultation on Consultation @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      ...OpinionCreateModal_consultation @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})

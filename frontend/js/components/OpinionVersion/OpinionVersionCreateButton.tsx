import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import LoginOverlay from '../Utils/LoginOverlay'
import { showOpinionVersionCreateModal } from '../../redux/modules/opinion'
import type { Dispatch } from '../../types'
import type { OpinionVersionCreateButton_opinion } from '~relay/OpinionVersionCreateButton_opinion.graphql'

type Props = {
  className?: string
  style: Record<string, any>
  opinion: OpinionVersionCreateButton_opinion
  dispatch: Dispatch
}

const OpinionVersionCreateButton = ({ opinion, dispatch, style = {}, className }: Props) => {
  if (!style.display) style.display = 'inline-block'
  return (
    <div className={className} style={style}>
      <LoginOverlay>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!opinion.contribuable}
          onClick={() => {
            dispatch(showOpinionVersionCreateModal())
          }}
        >
          <i className="cap cap-add-1" />
          <FormattedMessage id="opinion.add_new_version" />
        </button>
      </LoginOverlay>
    </div>
  )
}

// @ts-ignore
const container = connect()(OpinionVersionCreateButton)
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionVersionCreateButton_opinion on Opinion {
      contribuable
    }
  `,
})

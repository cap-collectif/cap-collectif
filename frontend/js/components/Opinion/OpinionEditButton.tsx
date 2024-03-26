import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import OpinionEditModal from './Edit/OpinionEditModal'
import { openOpinionEditModal } from '../../redux/modules/opinion'
import type { OpinionEditButton_opinion } from '~relay/OpinionEditButton_opinion.graphql'

type Props = {
  dispatch: (...args: Array<any>) => any
  opinion: OpinionEditButton_opinion
}
export const OpinionEditButton = ({ opinion, dispatch }: Props) => {
  const intl = useIntl()
  return (
    <>
      <Button
        id="opinion-edit-btn"
        className="opinion__action--edit pull-right btn--outline btn-dark-gray"
        onClick={() => {
          dispatch(openOpinionEditModal(opinion.id))
        }}
        aria-label={intl.formatMessage({
          id: 'edit-proposal',
        })}
      >
        <i className="cap cap-pencil-1" /> <FormattedMessage id="global.edit" />
      </Button>
      <OpinionEditModal opinion={opinion} />
    </>
  )
}
// @ts-ignore
const container = connect()(OpinionEditButton)
export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionEditButton_opinion on Opinion {
      ...OpinionEditModal_opinion
      id
    }
  `,
})

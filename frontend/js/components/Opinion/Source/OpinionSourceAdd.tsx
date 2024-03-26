import * as React from 'react'
import { connect } from 'react-redux'
import { graphql, createFragmentContainer } from 'react-relay'
import OpinionSourceAddButton from './OpinionSourceAddButton'
import OpinionSourceFormModal from './OpinionSourceFormModal'
import { showSourceCreateModal } from '../../../redux/modules/opinion'
import type { OpinionSourceAdd_sourceable } from '~relay/OpinionSourceAdd_sourceable.graphql'

type Props = {
  dispatch: (...args: Array<any>) => any
  sourceable: OpinionSourceAdd_sourceable
}

class OpinionSourceAdd extends React.Component<Props> {
  render() {
    const { dispatch, sourceable } = this.props
    const disabled = !sourceable.contribuable
    return (
      <div>
        <OpinionSourceAddButton
          disabled={disabled}
          handleClick={() => {
            dispatch(showSourceCreateModal())
          }}
        />
        {!disabled && <OpinionSourceFormModal sourceable={sourceable} source={null} />}
      </div>
    )
  }
}

// @ts-ignore
const container = connect()(OpinionSourceAdd)
export default createFragmentContainer(container, {
  sourceable: graphql`
    fragment OpinionSourceAdd_sourceable on Sourceable @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      ...OpinionSourceFormModal_sourceable @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
})

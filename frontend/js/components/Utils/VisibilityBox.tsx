import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Jumbotron } from 'react-bootstrap'
import classNames from 'classnames'
import { LoginButtonQueryWrapper } from '@shared/login/LoginButton'
import type { State } from '../../types'

type Props = {
  user?: Record<string, any> | null | undefined
  children: any
  enabled?: boolean
}
export const VisibilityBox = ({ user, children, enabled }: Props) => {
  if (!enabled) {
    return children
  }

  if (enabled && !user) {
    return (
      <Jumbotron
        className={{
          'p--centered': true,
        }}
      >
        <p>
          <FormattedMessage id="proposal.private.show_login" />
        </p>
        <p>
          <LoginButtonQueryWrapper />
        </p>
      </Jumbotron>
    )
  }

  const rootClasses = classNames({
    PrivateList: true,
  })
  const boxClasses = classNames({
    PrivateList__box: true,
  })
  return (
    <div className={rootClasses}>
      <p id="privateInfo">
        <i className="glyphicon glyphicon-lock" />{' '}
        <strong>
          <FormattedMessage id="global.private" />
        </strong>
      </p>
      <div className={boxClasses}>{children}</div>
    </div>
  )
}
VisibilityBox.defaultProps = {
  user: null,
  enabled: false,
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
})

export default connect(mapStateToProps)(VisibilityBox)

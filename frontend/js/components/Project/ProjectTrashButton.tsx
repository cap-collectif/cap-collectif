import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import type { State } from '../../types'
import '../../types'
import LoginOverlay from '../Utils/LoginOverlay'

export type Props = {
  link: string
  user: Record<string, any> | null | undefined
}
export class ProjectTrashButton extends React.PureComponent<Props> {
  render() {
    const { link, user } = this.props
    return (
      <div className="container text-center">
        <h2 className="mt-0  project__trash-title">
          <FormattedMessage id="project.show.trashed.short_name" />
        </h2>
        <p className="excerpt">
          <FormattedMessage id="project.show.trashed.text" />
        </p>

        <LoginOverlay>
          <a
            id="trash-link"
            href={user ? link : null}
            style={{
              display: 'block',
              borderColor: 'transparent !important',
            }}
          >
            <p>
              <FormattedMessage id="project.show.trashed.display" />
            </p>
          </a>
        </LoginOverlay>
      </div>
    )
  }
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
})

export default connect(mapStateToProps)(ProjectTrashButton)

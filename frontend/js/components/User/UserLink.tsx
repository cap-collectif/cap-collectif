import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, createFragmentContainer } from 'react-relay'
import { connect } from 'react-redux'
import type { UserLink_user } from '~relay/UserLink_user.graphql'
import type { State } from '~/types'
import { translateContent } from '@shared/utils/contentTranslator'
type ReduxProps = {
  readonly toggled: boolean
}
type Props = ReduxProps & {
  readonly className?: string
  readonly user?: UserLink_user | null | undefined
  readonly legacyUser?: Record<string, any>
  readonly ariaLabel?: string
}
export const UserLink = ({ legacyUser, className = '', toggled, user, ariaLabel = '' }: Props) => {
  const intl = useIntl()

  if (legacyUser) {
    let userUrl =
      legacyUser && legacyUser._links && legacyUser._links.profile && toggled ? legacyUser._links.profile : null
    const username = legacyUser && legacyUser.displayName ? legacyUser.displayName : 'deleted-user'

    const label = ariaLabel
      ? intl.formatMessage(
          {
            id: ariaLabel,
          },
          { author: translateContent(username) },
        )
      : undefined

    if (!userUrl) {
      userUrl = user && user.url ? user.url : null
    } else {
      return (
        <a className={className} href={userUrl} aria-label={label} title={user?.displayName}>
          <span>{translateContent(username)}</span>
        </a>
      )
    }

    return (
      <span className={className} aria-label={label} title={user?.displayName}>
        {translateContent(username)}
      </span>
    )
  }

  if (user) {
    const label = ariaLabel
      ? intl.formatMessage(
          {
            id: ariaLabel,
          },
          { author: translateContent(user.displayName) },
        )
      : undefined
    if (toggled) {
      return (
        <a className={className} href={user.url} aria-label={label} title={user?.displayName}>
          {translateContent(user.displayName)}
        </a>
      )
    }

    return (
      <span aria-label={label} title={user?.displayName}>
        {translateContent(user.displayName)}
      </span>
    )
  }

  return null
}

const mapStateToProps = (state: State) => ({
  toggled: !!state.default.features.profiles,
})

export // @ts-ignore
const container = connect(mapStateToProps)(UserLink)
export default createFragmentContainer(container, {
  user: graphql`
    fragment UserLink_user on User {
      displayName
      url
    }
  `,
})

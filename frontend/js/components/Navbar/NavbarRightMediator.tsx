import * as React from 'react'
import { useIntl } from 'react-intl'
import { MenuItem, useMenuState } from 'reakit/Menu'
import { NavbarRightMediatorQuery } from '~relay/NavbarRightMediatorQuery.graphql'
import * as S from '~ui/TabsBar/styles'
import { graphql, useLazyLoadQuery } from 'react-relay'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export const QUERY = graphql`
  query NavbarRightMediatorQuery {
    viewer {
      projectsMediator {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`
/**
 * For now, this redirects to the first project, because we do not
 * have a view for an eventual project list.
 * In the future, we should redirect to something like "/mediator-projects-list"
 */
export const NavbarRightMediator = () => {
  const intl = useIntl()
  const menu = useMenuState({
    baseId: 'user-profile',
  })
  const isMediatorEnabled = useFeatureFlag('mediator')

  const query = useLazyLoadQuery<NavbarRightMediatorQuery>(QUERY, {})

  const projectID = query?.viewer?.projectsMediator?.edges?.[0]?.node?.id

  if (!projectID) return null
  if (!isMediatorEnabled) return null

  return (
    <MenuItem {...menu} href={`/admin-next/project/${projectID}/mediator-view`} as={S.TabsLink}>
      <i className="cap-setting-gears-1 mr-10" aria-hidden="true" />
      {intl.formatMessage({
        id: 'caption.manage.participants',
      })}
    </MenuItem>
  )
}

export default NavbarRightMediator

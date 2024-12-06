import * as React from 'react'
import { useIntl } from 'react-intl'
import { TabsItemContainer, TabsLink } from '../Ui/TabsBar/styles'
import useIsMobile from '~/utils/hooks/useIsMobile'
import NavbarRightQuery from './NavbarRightQuery'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export const NavbarRight = () => {
  const intl = useIntl()
  const search = useFeatureFlag('search')

  const isMobile = useIsMobile()

  return (
    <>
      {search && !isMobile && (
        <TabsItemContainer
          as="div"
          role="search"
          aria-label={intl.formatMessage({
            id: 'search.title',
          })}
        >
          <TabsLink id="global.menu.search" href="/search">
            <i className="cap cap-magnifier" aria-hidden />{' '}
            <span className="visible-xs-inline ml-5">
              {intl.formatMessage({
                id: 'global.menu.search',
              })}
            </span>
          </TabsLink>
        </TabsItemContainer>
      )}
      <React.Suspense fallback={null}>
        <NavbarRightQuery fullWidth={isMobile} />
      </React.Suspense>
    </>
  )
}

export default NavbarRight

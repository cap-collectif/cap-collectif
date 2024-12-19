import { FC, Suspense } from 'react'
import NavBarQuery from '@shared/navbar/NavBarQuery'
import { Flex, Spinner } from '@cap-collectif/ui'
import NavBarMenu from '@shared/navbar/menu/NavBarMenu'
import NavbarRightQuery from '@shared/navbar/NavbarRightQuery'
import useIsMobile from '@shared/hooks/useIsMobile'
import { useAppContext } from '@components/AppProvider/App.context'
import { NavBarContextProvider } from '@shared/navbar/NavBar.context'
import ChangeLanguageNavBar from '@components/Frontend/ChangeLanguageNavBar'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import ShieldPageWrapper from '@components/Frontend/Shield/ShieldPageWrapper'
import CookieManager from '@components/Frontend/Cookies/CookieManager'
import Footer from '@shared/footer/Footer'
import { useCookies } from 'next-client-cookies'
import { LOCALE_COOKIE } from '@shared/utils/cookies'

const MainLayout: FC<{ SSRData: layoutQuery$data; children: React.ReactNode }> = ({ children, SSRData }) => {
  const shield_mode = useFeatureFlag('shield_mode')
  const session = useAppContext()
  const isMobile = useIsMobile()
  const cookies = useCookies()
  const { locales } = SSRData
  const cookiesLocale = cookies?.get(LOCALE_COOKIE)

  if (shield_mode && !session?.viewerSession)
    return (
      <>
        <ShieldPageWrapper SSRData={SSRData} />
        <CookieManager SSRData={SSRData} mode="BANNER" />
      </>
    )

  const currentLanguage = cookiesLocale ? cookiesLocale : locales.find(l => l.isDefault)?.code

  return (
    <>
      <NavBarContextProvider>
        <ChangeLanguageNavBar locales={locales} />
        <NavBarQuery SSRData={SSRData}>
          <Flex alignItems="center" justifyContent="center">
            <Suspense fallback={<Spinner m="auto" />}>
              {session?.viewerSession ? (
                <NavBarMenu currentLanguage={currentLanguage ?? 'fr-FR'} />
              ) : (
                <NavbarRightQuery fullWidth={isMobile} />
              )}
            </Suspense>
          </Flex>
        </NavBarQuery>
        {children}
        <Footer SSRData={SSRData} />
      </NavBarContextProvider>
      <CookieManager SSRData={SSRData} mode="BANNER" />
    </>
  )
}

export default MainLayout

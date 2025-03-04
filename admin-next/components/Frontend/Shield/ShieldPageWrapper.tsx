import * as React from 'react'
import ShieldPage from '@shared/shield/ShieldPage'
import { Box, Flex, Spinner } from '@cap-collectif/ui'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import PrivacyModalQuery from '@shared/register/PrivacyModal'
import { PrivacyPolicyComponent } from '@shared/register/RegistrationForm'
import { useIntl } from 'react-intl'
import CookieModal from '@components/Frontend/Cookies/CookieModal'
import CookieManager from '@components/Frontend/Cookies/CookieManager'
import { ChartModalQuery } from '@shared/register/ChartModal'

type Props = {
  SSRData: layoutQuery$data
}

export const ShieldPageWrapper: React.FC<Props> = ({ SSRData }) => {
  const intl = useIntl()
  const shieldImg = SSRData?.shieldImage?.media?.url
  const cookies = SSRData?.cookiesList?.value
  const { analytics, ads } = SSRData
  return (
    <>
      <Flex justifyContent="center" bg="neutral-gray.100" minHeight="100vh" p={[0, 0, 10]} id="shield-mode">
        <Flex direction="column" gap={6} alignItems="center" maxWidth="80rem" mt={[6, 6, 0]}>
          {shieldImg ? <img loading="lazy" src={shieldImg} alt="logo" /> : null}
          <Box fontSize="1.15rem" px={[4, 4, 4, 0]} textAlign="center">
            <WYSIWYGRender value={SSRData?.shieldIntroduction?.value} />
          </Box>
          <Box
            bg="white"
            p={5}
            borderRadius="normal"
            border="button"
            borderColor="neutral-gray.300"
            mx={[5, 5, 0]}
            width={['100%', '70%', '25rem']}
          >
            <React.Suspense fallback={<Spinner m="auto" />}>
              <ShieldPage />
              <PrivacyModalQuery />
              <ChartModalQuery />
            </React.Suspense>
          </Box>
          <Flex
            id="shield-links"
            color="neutral-gray.600"
            gap={[0, 2]}
            flexDirection={['column', 'row']}
            alignItems={['center', 'flex-start']}
          >
            <PrivacyPolicyComponent privacyPolicyRequired privacyOnly />

            {cookies ? (
              <>
                <span>•</span>
                <CookieModal SSRData={SSRData} />
              </>
            ) : null}
            {ads.value || analytics.value ? (
              <>
                <span>•</span>
                <CookieManager mode="LINK" SSRData={SSRData} />
              </>
            ) : null}
          </Flex>
          <Box
            mb={4}
            color="neutral-gray.600"
            sx={{ div: { display: 'flex', alignItems: 'center', gap: 1 } }}
            className="capco-powered"
          >
            <WYSIWYGRender
              value={intl.formatMessage({ id: 'email.propulsed.by.capco' }, { logoUrl: '/capco-logo-mail.png' })}
            />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

export default ShieldPageWrapper

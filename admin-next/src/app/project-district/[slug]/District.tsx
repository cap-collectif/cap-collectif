'use client'

import { graphql, useLazyLoadQuery } from 'react-relay'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { Box, CapUIFontSize, Flex, Heading, Spinner } from '@cap-collectif/ui'
import { FC, Suspense, useEffect } from 'react'
import useIsMobile from '@shared/hooks/useIsMobile'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import DistrictPageProjectList from '@components/FrontOffice/District/DistrictPageProjectList'
import DistrictPageMap from '@components/FrontOffice/District/DistrictPageMap'
import { DistrictQuery } from '@relay/DistrictQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import ShareButtons from '@components/FrontOffice/SocialNetworks/ShareButtons'
import getBaseUrl from '@shared/utils/getBaseUrl'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { useIntl } from 'react-intl'

type Props = {
  slug: string
}

const districtQuery = graphql`
  query DistrictQuery($districtSlug: String!) {
    district: nodeSlug(entity: DISTRICT, slug: $districtSlug) {
      ... on GlobalDistrict {
        id
        geojson
        name
        titleOnMap
        description
        cover {
          url(format: "reference")
        }
      }
    }
  }
`

export const DistrictRender: FC<Props> = ({ slug }) => {
  const intl = useIntl()
  const isMobile = useIsMobile()
  const { setBreadCrumbItems } = useNavBarContext()
  const query = useLazyLoadQuery<DistrictQuery>(districtQuery, {
    districtSlug: slug,
  })

  const { siteColors } = useAppContext()
  const { primaryColor, primaryLabel } = siteColors
  const { district } = query

  useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: district?.name, href: '' },
    ])
  }, [intl, setBreadCrumbItems, district])

  if (!district) return null

  const cover = district.cover?.url

  return (
    <>
      <Flex
        width="100%"
        height={pxToRem(230)}
        css={{
          background: cover ? `url(${cover}) center center / cover` : primaryColor,
        }}
        alignItems="end"
        mb={[4, 8]}
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          css={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 15%, rgba(0,0,0,0.45) 100%)',
          }}
        />
        <Box width="100%" maxWidth={pxToRem(1280)} mx="auto" pb={[3, pxToRem(48)]} px={[4, 6]} zIndex={2}>
          <Heading color={primaryLabel}>{isMobile ? district.titleOnMap : district.name}</Heading>
        </Box>
      </Flex>
      <Flex maxWidth={pxToRem(1280)} margin="auto" mb={6} px={[4, 6]} justify="space-between">
        <Flex direction="column" minWidth={['100%', '60%']} maxWidth={['100%', '60%']}>
          <Box maxWidth={['100%', '90%']} mb={[8, 0]} fontSize={CapUIFontSize.BodyLarge}>
            <WYSIWYGRender value={district.description} />
          </Box>
          {!isMobile ? (
            <ShareButtons url={`${getBaseUrl()}/project-district/${slug || ''}` || ''} title={district.name || ''} />
          ) : null}
        </Flex>
        {district.geojson && !isMobile ? <DistrictPageMap geojson={district.geojson} /> : null}
      </Flex>
      <Box maxWidth={pxToRem(1280)} margin="auto" px={[4, 6]}>
        <DistrictPageProjectList id={district.id} />
      </Box>
    </>
  )
}

export const District: FC<Props> = ({ slug }) => (
  <Suspense fallback={<Spinner m="auto" my="10rem" />}>
    <DistrictRender slug={slug} />
  </Suspense>
)

export default District

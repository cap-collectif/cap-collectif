import * as React from 'react'
import { useSelector } from 'react-redux'
import type { PreloadedQuery } from 'react-relay'
import { graphql, usePreloadedQuery, useQueryLoader } from 'react-relay'
import { baseUrl } from '~/config'
import type { DistrictPageQuery as DistrictPageQueryType } from '~relay/DistrictPageQuery.graphql'
import useIsMobile from '~/utils/hooks/useIsMobile'
import type { GlobalState } from '~/types'
import ProjectHeaderShareButtons from '../Project/ProjectHeaderShareButtons'
import DistrictPageMap from './DistrictPageMap'
import DistrictPageProjectList from './DistrictPageProjectList'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { Box, Flex, Heading } from '@cap-collectif/ui'

export type Props = {
  districtId: string
}

const QUERY = graphql`
  query DistrictPageQuery($count: Int!, $cursor: String, $districtId: ID!) {
    ...DistrictPageProjectList_query @arguments(count: $count, cursor: $cursor, districtId: $districtId)
    district: node(id: $districtId) {
      ... on GlobalDistrict {
        id
        geojson
        name
        slug
        titleOnMap
        description
        cover {
          url(format: "reference")
        }
      }
    }
  }
`

export const DistrictPageLayout = ({ queryReference }: { queryReference: PreloadedQuery<DistrictPageQueryType> }) => {
  const isMobile = useIsMobile()
  const query = usePreloadedQuery<DistrictPageQueryType>(QUERY, queryReference)
  const { bgColor, textColor } = useSelector((state: GlobalState) => ({
    bgColor: state.default.parameters['color.btn.primary.bg'],
    textColor: state.default.parameters['color.btn.primary.text'],
  }))
  const { district } = query
  if (!district) return null
  const cover = district.cover?.url
  return (
    <>
      <Flex
        width="100%"
        height="230px"
        css={{
          background: cover ? `url(${cover}) center center / cover` : bgColor,
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
        <Box width="100%" maxWidth="1200px" marginLeft="auto" marginRight="auto" pb={[3, '48px']} px={[3]} zIndex={2}>
          <Heading color={textColor}>{isMobile ? district.titleOnMap : district.name}</Heading>
        </Box>
      </Flex>
      <Flex maxWidth="1200px" margin="auto" mb={6} px={[3]} justify="space-between">
        <Flex direction="column" minWidth={['100%', '60%']} maxWidth={['100%', '60%']}>
          <Box maxWidth={['100%', '90%']} mb={[8, 0]}>
            <WYSIWYGRender value={district.description} />
          </Box>
          {!isMobile ? (
            <ProjectHeaderShareButtons
              url={`${baseUrl}/project-district/${district.slug || ''}` || ''}
              title={district.name || ''}
            />
          ) : null}
        </Flex>
        {district.geojson && !isMobile ? <DistrictPageMap geojson={district.geojson} /> : null}
      </Flex>
      <Box maxWidth="1200px" margin="auto" px={[3]}>
        <DistrictPageProjectList query={query} />
      </Box>
    </>
  )
}
export const DistrictPage = ({ districtId }: Props) => {
  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<DistrictPageQueryType>(QUERY)
  React.useEffect(() => {
    loadQuery({
      count: 20,
      cursor: null,
      districtId,
    })
    return () => {
      disposeQuery()
    }
  }, [disposeQuery, loadQuery, districtId])
  return queryReference ? <DistrictPageLayout queryReference={queryReference} /> : null
}

export default DistrictPage

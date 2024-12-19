import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { geographicalAreaQuery } from '@relay/geographicalAreaQuery.graphql'
import Layout from '@components/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'
import useUrlState from '@hooks/useUrlState'
import dynamic from 'next/dynamic'

const GeographicalAreaForm = dynamic(() => import('@components/GeographicalArea/GeographicalAreaForm'), {
  ssr: false,
})

export const QUERY = graphql`
  query geographicalAreaQuery($id: ID!) {
    node(id: $id) {
      ... on GlobalDistrict {
        id
        geojson
        border {
          color
          opacity
          size
        }
        background {
          color
          opacity
          size
        }
        cover {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
        displayedOnMap
        translations {
          name
          titleOnMap
          locale
          description
        }
      }
    }
  }
`

const GeographicalAreaFormWithData = ({ geographicalAreaId }: { geographicalAreaId: string }) => {
  const { node } = useLazyLoadQuery<geographicalAreaQuery>(QUERY, {
    id: geographicalAreaId,
  })

  if (!node) return null

  const { geojson, displayedOnMap, background, border, translations, id, cover } = node

  const defaultValues = { geojson, displayedOnMap, background, border, id, cover }

  return <GeographicalAreaForm queryValues={defaultValues} translations={translations} />
}

const GeographicalArea = () => {
  const intl = useIntl()
  const [geographicalAreaId] = useUrlState('id', '')

  return (
    <Layout
      navTitle={intl.formatMessage({
        id: geographicalAreaId ? 'edit.geographical.area' : 'add.geographical.area',
      })}
    >
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {geographicalAreaId ? (
          <GeographicalAreaFormWithData geographicalAreaId={geographicalAreaId} />
        ) : (
          <GeographicalAreaForm />
        )}
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default GeographicalArea

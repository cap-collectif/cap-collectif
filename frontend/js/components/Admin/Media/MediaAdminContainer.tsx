import React, { useState } from 'react'
import { graphql } from 'react-relay'
import { useQuery } from 'relay-hooks'
import { useIntl, FormattedMessage } from 'react-intl'
import { debounce } from 'lodash'
import type { Query } from '~/types'
import MediaAdminList, { MEDIA_PAGINATION } from './MediaAdminList'
import Loader from '~/components/Ui/FeedbacksIndicators/Loader'
import { useMediaAdminListContext } from './MediaAdminList.context'
import type { MediaAdminListParameters } from './MediaAdminList.reducer'
import type {
  MediaAdminContainerQueryResponse,
  MediaAdminContainerQueryVariables,
} from '~relay/MediaAdminContainerQuery.graphql'
import MediaUploadModal from './MediaUploadModal'
import ClearableInput from '~ui/Form/Input/ClearableInput'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import { MediaListHead } from './MediaAdminPage.style'

export const MEDIA_DEBOUNCE_MS = 500
export const queryMedias = graphql`
  query MediaAdminContainerQuery($count: Int!, $cursor: String, $term: String) {
    ...MediaAdminList_query @arguments(count: $count, cursor: $cursor, term: $term)
  }
`
export const initialVariables = () => ({
  count: MEDIA_PAGINATION,
  cursor: null,
  term: null,
})
type PropsQuery = Query & {
  props: MediaAdminContainerQueryResponse
}

const createQueryVariables = (parameters: MediaAdminListParameters): MediaAdminContainerQueryVariables => ({
  count: MEDIA_PAGINATION,
  cursor: null,
  term: parameters.filters.term,
})

export const MediaAdminContainer = () => {
  const { parameters, dispatch } = useMediaAdminListContext()
  const [showMediaUploadModal, setShowMediaUploadModal] = useState<boolean>(false)
  const queryVariablesWithParameters = createQueryVariables(parameters)
  const intl = useIntl()
  const { props: data }: PropsQuery = useQuery(queryMedias, queryVariablesWithParameters)
  const onInputChange = debounce((e: React.SyntheticEvent<HTMLInputElement>) => {
    const term = e.target.value

    if (term === '' && parameters.filters.term !== null) {
      dispatch({
        type: 'CLEAR_TERM',
      })
    } else if (term !== '' && parameters.filters.term !== term) {
      dispatch({
        type: 'SEARCH_TERM',
        payload: term,
      })
    }
  }, MEDIA_DEBOUNCE_MS)
  return (
    <>
      <MediaUploadModal show={showMediaUploadModal} closeModal={() => setShowMediaUploadModal(false)} />
      <MediaListHead>
        <div>
          <ClearableInput
            id="search"
            name="search"
            type="text"
            icon={<i className="cap cap-magnifier" />}
            iconRight
            onClear={() => {
              if (parameters.filters.term !== null) {
                dispatch({
                  type: 'CLEAR_TERM',
                })
              }
            }}
            initialValue={parameters.filters.term}
            onChange={e => {
              e.persist()
              onInputChange(e)
            }}
            placeholder={intl.formatMessage({
              id: 'global.menu.search',
            })}
          />
        </div>
        <button type="button" onClick={() => setShowMediaUploadModal(true)}>
          <Icon name={ICON_NAME.addCircle} size={15} color="#52a5ff" />
          <FormattedMessage id="page-media--add" />
        </button>
      </MediaListHead>
      {data ? (
        <MediaAdminList query={data} />
      ) : (
        <div className="pt-25">
          <Loader />
        </div>
      )}
    </>
  )
}
export default MediaAdminContainer

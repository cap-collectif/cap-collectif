import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import LeafletMap from './LeafletMap'
import type { EventMapModal_query$key } from '~relay/EventMapModal_query.graphql'
import Modal from '~ds/Modal/Modal'

type Props = {
  onClose: () => void
  query: EventMapModal_query$key
}

const FRAGMENT = graphql`
  fragment EventMapModal_query on Query
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    theme: { type: "ID" }
    district: { type: "ID" }
    project: { type: "ID" }
    locale: { type: "TranslationLocale" }
    search: { type: "String" }
    userType: { type: "ID" }
    isFuture: { type: "Boolean" }
    author: { type: "ID" }
    isRegistrable: { type: "Boolean" }
    orderBy: { type: "EventOrder" }
  ) {
    ...LeafletMap_query
      @arguments(
        count: $count
        cursor: $cursor
        theme: $theme
        district: $district
        project: $project
        locale: $locale
        search: $search
        userType: $userType
        isFuture: $isFuture
        author: $author
        isRegistrable: $isRegistrable
        orderBy: $orderBy
      )
  }
`

const EventMapModal = ({ onClose, query: queryKey }: Props): JSX.Element => {
  const intl = useIntl()
  const query = useFragment(FRAGMENT, queryKey)

  return (
    <Modal
      id="event-map-modal"
      show
      onClose={onClose}
      ariaLabel={intl.formatMessage({
        id: 'map.view',
      })}
      width="80vw"
    >
      <Modal.Body p={0}>
        <LeafletMap
          key="modal-map"
          query={query}
          loading={!query}
          defaultMapOptions={{
            zoom: 12,
          }}
          toggleFullScreen={onClose}
          isFullScreen
        />
      </Modal.Body>
    </Modal>
  )
}

export default EventMapModal

import { $Values } from 'utility-types'
import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import L from 'leaflet'

export const View = {
  Map: 'map',
  List: 'list',
  Votes: 'votes',
}

export const VoteStepEvent = {
  ClickProposal: 'click-proposal',
  AddVote: 'add-vote',
  RemoveVote: 'remove-vote',
  AnimateCard: 'animate-card',
  HoverCardStart: 'hover-card-start',
  HoverCardEnd: 'hover-card-end',
  NewParticipantToken: 'new-participant-token',
}

export const dispatchEvent = (type: $Values<typeof VoteStepEvent>, data?: Record<string, any>) => {
  const event = new MessageEvent(type, {
    bubbles: true,
    data,
  })
  document.dispatchEvent(event)
}

export const DELAY_BEFORE_PROPOSAL_REMOVAL = 0.5
export const DELAY_BEFORE_MAP_RELOADING = 1000

export const getOrderByArgs = (sort: string | null) => {
  if (!sort) return null
  const sortBy = {
    random: {
      field: 'RANDOM',
      direction: 'ASC',
    },
    last: {
      field: 'PUBLISHED_AT',
      direction: 'DESC',
    },
    old: {
      field: 'PUBLISHED_AT',
      direction: 'ASC',
    },
    comments: {
      field: 'COMMENTS',
      direction: 'ASC',
    },
    expensive: {
      field: 'COST',
      direction: 'DESC',
    },
    cheap: {
      field: 'COST',
      direction: 'ASC',
    },
    votes: {
      field: 'VOTES',
      direction: 'DESC',
    },
    'least-votes': {
      field: 'VOTES',
      direction: 'ASC',
    },
    points: {
      field: 'POINTS',
      direction: 'DESC',
    },
    'least-points': {
      field: 'POINTS',
      direction: 'ASC',
    },
  }
  return [
    {
      field: sortBy[sort].field,
      direction: sortBy[sort].direction,
    },
  ]
}

export const Link = ({
  children,
  href,
  stepId,
  currentVotableStepId,
  from,
}: {
  readonly children: React.ReactElement | React.ReactElement[]
  readonly href: string
  readonly stepId: string
  readonly currentVotableStepId: string
  readonly from: string
}) => (
  <RouterLink
    to={{
      pathname: `/project/${href}`,
      state: {
        stepId,
        currentVotableStepId,
        from,
      },
    }}
    className={from ? 'voteStep-link' : undefined}
  >
    {children}
  </RouterLink>
)

type Bounds = {
  readonly topLeft: {
    readonly lat: number
    readonly lng: number
  }
  readonly bottomRight: {
    readonly lat: number
    readonly lng: number
  }
}

export const boundsToLeaflet = (bounds: Bounds) => [bounds.topLeft, bounds.bottomRight]

export const parseLatLng = (latlng: string) => {
  try {
    const value = JSON.parse(latlng)
    return value
  } catch (e) {
    return null
  }
}

export const parseLatLngBounds = (latlngBounds: string) => {
  try {
    const value = JSON.parse(latlngBounds)

    if (value.topLeft && value.bottomRight) {
      const bounds = L.latLngBounds(boundsToLeaflet(value))
      if (bounds.isValid()) return value
    }

    return null
  } catch (e) {
    return null
  }
}

export const ACTIVE_COLOR = '#3E3361'

const mapViewSizes = ['30.8rem', '40.8rem', '50rem', '69.4rem']
const listViewSizes = ['100%', '100%', '100%', '69.4rem']
export const cardWidthMapView = ['100%', '100%', ...mapViewSizes]
export const cardWidthListView = ['100%', '100%', ...listViewSizes]
export const emptyStateWithMapView = ['unset', 'unset', ...mapViewSizes]
export const emptyStateWithListView = ['unset', 'unset', ...listViewSizes]

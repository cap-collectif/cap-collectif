import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { useIntl } from 'react-intl'
import Truncate from 'react-truncate'
import moment from 'moment'
import Card from '~/components/Ui/Card/Card'
import TagCity from '~/components/Tag/TagCity/TagCity'
import EventPreviewContainer, {
  HeadContent,
  Content,
  TagsList,
  TitleContainer,
} from '../EventPreview/EventPreview.style'
import type { ProjectEventPreview_event } from '~relay/ProjectEventPreview_event.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import Label from '~ui/Labels/Label'
import InlineList from '~ui/List/InlineList'
import IconRounded from '~ui/Icons/IconRounded'
import Tag from '~ui/Labels/Tag'
import { getEndDateFromStartAt, isEventLive } from '~/components/Event/EventPageContent/EventHelperFunctions'
type Props = {
  readonly event: ProjectEventPreview_event
  readonly className?: string
}
export const ProjectEventPreview = ({ event }: Props) => {
  const { title, googleMapsAddress, timeRange, author, guestListEnabled, url }: ProjectEventPreview_event = event
  const intl = useIntl()
  const startAt = timeRange?.startAt
  const endAt = timeRange?.endAt
  const isLive = isEventLive(startAt, endAt)
  const isPast = endAt ? moment(new Date()).isAfter(endAt) : false
  const isStarted = startAt != null ? new Date(startAt).getTime() <= new Date().getTime() : false
  const isEnded =
    endAt != null
      ? new Date(endAt).getTime() <= new Date().getTime()
      : startAt != null
      ? getEndDateFromStartAt(startAt).getTime() <= new Date().getTime()
      : false
  const isEventDone = isStarted && isEnded
  const hasTag = isLive || isEventDone || guestListEnabled
  return (
    <EventPreviewContainer isProject>
      <Card.Body>
        <TitleContainer>
          <Icon name={ICON_NAME.eventPhysical} size={17} color={colors.lightBlue} />
          <Card.Title>
            <a href={url} title={title}>
              <Truncate lines={2}>{title}</Truncate>
            </a>
          </Card.Title>
        </TitleContainer>

        <HeadContent>
          {startAt && <Card.Date date={startAt} />}

          {isPast && (
            <div className="past-container">
              <span className="separator">-</span>
              {intl.formatMessage({
                id: 'passed-singular',
              })}
            </div>
          )}

          {hasTag && (
            <InlineList>
              {guestListEnabled && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    {intl.formatMessage({
                      id: 'registration-required',
                    })}
                  </Label>
                </li>
              )}
            </InlineList>
          )}
        </HeadContent>

        <Content>
          <TagsList vertical>
            {googleMapsAddress && <TagCity address={googleMapsAddress} size="16px" />}

            {author && (
              <Tag size="16px">
                <IconRounded size={18} color={colors.darkGray}>
                  <Icon name={ICON_NAME.user} color="#fff" size={10} />
                </IconRounded>
                {author?.username}
              </Tag>
            )}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  )
}
export default createFragmentContainer(ProjectEventPreview, {
  event: graphql`
    fragment ProjectEventPreview_event on Event {
      id
      title
      url
      author {
        username
      }
      guestListEnabled
      timeRange {
        startAt
        endAt
      }
      googleMapsAddress {
        __typename
        ...TagCity_address
      }
    }
  `,
})

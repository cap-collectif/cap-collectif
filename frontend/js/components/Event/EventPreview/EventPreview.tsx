import * as React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { Tag } from '@cap-collectif/ui'
import Truncate from 'react-truncate'
import Card from '~/components/Ui/Card/Card'
import TagUser from '~/components/Tag/TagUser/TagUser'
import TagCity from '~/components/Tag/TagCity/TagCity'
import TagThemes from '~/components/Tag/TagThemes/TagThemes'
import EventImage from '~/components/Event/EventImage/EventImage'
import EventPreviewContainer, {
  HeadContent,
  Content,
  TagsList,
  TitleContainer,
  DateContainer,
} from './EventPreview.style'
import EventLabelStatus from '~/components/Event/EventLabelStatus'
import type { EventPreview_event } from '~relay/EventPreview_event.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import Label from '~ui/Labels/Label'
import InlineList from '~ui/List/InlineList'
import TagStep from '~/components/Tag/TagStep/TagStep'
import { getEndDateFromStartAt, isEventLive } from '~/components/Event/EventPageContent/EventHelperFunctions'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
type Props = {
  readonly event: EventPreview_event
  readonly isHighlighted?: boolean
  readonly isAuthorHidden?: boolean
  readonly displayReview?: boolean
  readonly registrationRequired?: boolean
}

const getTagLabel = (intl, availableRegistration, tagColor: string | null | undefined) => {
  if (tagColor === 'red') {
    return intl.formatMessage({
      id: 'complete',
    })
  }

  if (tagColor === 'yellow') {
    return intl.formatMessage(
      {
        id: 'x-available-registration',
      },
      {
        x: availableRegistration,
      },
    )
  }

  if (tagColor === 'green') {
    return intl.formatMessage({
      id: 'admin.fields.event_registration.registered',
    })
  }

  return null
}

const getTagColor = (
  guestListEnabled,
  availableRegistration,
  isCompleteAndRegistrationPossibleResolver,
  isMeasurable,
  isViewerParticipatingAtEvent,
) => {
  if (isViewerParticipatingAtEvent) {
    return 'green'
  }

  if (isCompleteAndRegistrationPossibleResolver) {
    return 'red'
  }

  const isRegistrationMeasurable = isMeasurable || guestListEnabled

  if (availableRegistration && isRegistrationMeasurable && availableRegistration < 4 && availableRegistration > 0) {
    return 'yellow'
  }

  return null
}

export const EventPreview = ({
  event,
  isHighlighted = false,
  isAuthorHidden = false,
  displayReview = false,
}: Props) => {
  const {
    title,
    googleMapsAddress,
    author,
    themes,
    steps,
    timeRange,
    url,
    guestListEnabled,
    availableRegistration,
    isCompleteAndRegistrationPossibleResolver,
    isMeasurable,
    isViewerParticipatingAtEvent,
  }: EventPreview_event = event
  const hasIllustrationDisplayed = useFeatureFlag('display_pictures_in_event_list')
  const intl = useIntl()
  const hasStarted = timeRange.startAt != null ? new Date(timeRange.startAt).getTime() <= new Date().getTime() : false
  const hasEnded =
    timeRange.endAt != null
      ? new Date(timeRange.endAt).getTime() <= new Date().getTime()
      : timeRange.startAt != null
      ? getEndDateFromStartAt(timeRange.startAt).getTime() <= new Date().getTime()
      : false
  const isEventDone = hasStarted && hasEnded
  const isLive = isEventLive(timeRange.startAt, timeRange.endAt)
  const hasTag = isLive || guestListEnabled || displayReview
  const tagColor = getTagColor(
    guestListEnabled,
    availableRegistration,
    isCompleteAndRegistrationPossibleResolver,
    isMeasurable,
    isViewerParticipatingAtEvent,
  )
  const tagLabel = getTagLabel(intl, availableRegistration, tagColor)
  const displayEventTag =
    timeRange.isFuture && (isMeasurable || guestListEnabled) && tagColor !== null && tagLabel !== null

  return (
    <EventPreviewContainer isHighlighted={isHighlighted}>
      <EventImage event={event} enabled={hasIllustrationDisplayed} />
      {displayEventTag && (
        <Tag variantColor={tagColor} className="eventTag">
          <Tag.Label>{tagLabel}</Tag.Label>
        </Tag>
      )}
      <Card.Body>
        <HeadContent>
          <DateContainer>
            {timeRange?.startAt && <Card.Date startDate={timeRange.startAt} endDate={timeRange?.endAt} />}

            {isEventDone && (
              <div className="past-container">
                <span className="separator">-</span>
                <FormattedMessage id="passed-singular" />
              </div>
            )}
          </DateContainer>

          {hasTag && (
            <InlineList>
              {guestListEnabled && (
                <li>
                  <Label color={colors.lightBlue} fontSize={10}>
                    <FormattedMessage id="registration-required" />
                  </Label>
                </li>
              )}

              {displayReview && (
                <li>
                  <EventLabelStatus event={event} />
                </li>
              )}
            </InlineList>
          )}
        </HeadContent>

        <Content>
          <TitleContainer>
            <Icon name={ICON_NAME.eventPhysical} size={17} color={colors.lightBlue} />
            <Card.Title>
              <a href={url} title={title}>
                <Truncate lines={2}>{title}</Truncate>
              </a>
            </Card.Title>
          </TitleContainer>

          <TagsList>
            {author && !isAuthorHidden && <TagUser user={author} size="xs"/>}
            {googleMapsAddress && <TagCity address={googleMapsAddress} size="16px" />}
            {themes && themes.length > 0 && <TagThemes themes={themes} size="16px" />}
            {/* For now we only display the first step */}
            {steps.length ? <TagStep step={steps[0]} size="16px" /> : null}
          </TagsList>
        </Content>
      </Card.Body>
    </EventPreviewContainer>
  )
}
export default createFragmentContainer(EventPreview, {
  event: graphql`
    fragment EventPreview_event on Event @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      title
      url
      guestListEnabled
      timeRange {
        startAt
        endAt
        isFuture
      }
      googleMapsAddress {
        __typename
        ...TagCity_address
      }
      themes {
        __typename
        ...TagThemes_themes
      }
      steps {
        __typename
        ...TagStep_step
      }
      author {
        ...TagUser_user
      }
      ...EventImage_event
      ...EventLabelStatus_event
      isViewerParticipatingAtEvent @include(if: $isAuthenticated)
      isRegistrationPossible
      isCompleteAndRegistrationPossibleResolver
      isMeasurable
      maxRegistrations
      availableRegistration
    }
  `,
})

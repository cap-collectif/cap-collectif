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
import type { ProjectEventPreview_event$data } from '~relay/ProjectEventPreview_event.graphql'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import Label from '~ui/Labels/Label'
import InlineList from '~ui/List/InlineList'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'
import Tag from '~ui/Labels/Tag'
import { getEndDateFromStartAt, isEventLive } from '~/components/Event/EventPageContent/EventHelperFunctions'
import { formatAddressFromGoogleAddress, getCityFromGoogleAddress } from '~/utils/googleMapAddress'
import {
  CapUIIcon,
  Card as CapCard,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  CardStatusTag,
  CardTag,
  CardTagLabel,
  CardTagLeftIcon,
  CardTagList,
} from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

type Props = {
  readonly event: ProjectEventPreview_event$data
  readonly className?: string
  readonly vertical?: boolean
}

export const ProjectEventPreview = ({ event, vertical }: Props) => {
  const { title, googleMapsAddress, timeRange, author, guestListEnabled, url, media, themes } = event
  const intl = useIntl()
  const isNewProjectPage = useFeatureFlag('new_project_page')
  const startAt = timeRange?.startAt
  const endAt = timeRange?.endAt

  if (isNewProjectPage) {
    const dateLabel = startAt
      ? endAt
        ? intl.formatMessage(
            { id: 'global.dates.between' },
            { start: moment(startAt).format('D MMMM'), end: moment(endAt).format('D MMMM') },
          )
        : moment(startAt).format('D MMMM YYYY')
      : null

    return (
      <CapCard format={vertical ? 'vertical' : 'horizontal'} variantSize="medium" flex="1">
        <CardCover>
          {media?.url ? (
            <CardCoverImage src={media.url} />
          ) : (
            <CardCoverPlaceholder icon={CapUIIcon.CalendarO} color="primary.base" />
          )}
          {guestListEnabled && (
            <CardStatusTag variantColor="success">
              <CardTagLabel>{intl.formatMessage({ id: 'registration-required' })}</CardTagLabel>
            </CardStatusTag>
          )}
        </CardCover>
        <CardContent primaryInfo={title ?? ''} href={url ?? undefined} secondaryInfo={dateLabel ?? undefined}>
          <CardTagList>
            {googleMapsAddress && (
              <CardTag>
                <CardTagLeftIcon name={CapUIIcon.PinO} />
                <CardTagLabel>
                  {getCityFromGoogleAddress(formatAddressFromGoogleAddress(JSON.parse(googleMapsAddress.json)[0]))}
                </CardTagLabel>
              </CardTag>
            )}
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.FolderO} />
              {themes?.map(theme => (
                <CardTagLabel key={theme.title}>{theme.title}</CardTagLabel>
              ))}
            </CardTag>
          </CardTagList>
        </CardContent>
      </CapCard>
    )
  }

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
          {startAt && <Card.Date startDate={startAt} endDate={endAt} />}

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
      guestListEnabled
      timeRange {
        startAt
        endAt
      }
      # new_project_page fields
      media {
        url(format: "reference")
      }
      themes {
        id
        title
      }
      googleMapsAddress {
        json
        __typename
        ...TagCity_address
      }
      # legacy fields
      author {
        username
      }
    }
  `,
})

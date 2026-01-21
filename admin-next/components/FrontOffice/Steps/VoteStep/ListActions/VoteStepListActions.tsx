import { Box, Button, CapUIIcon, Flex, Tag } from '@cap-collectif/ui'
import { VoteStepListActions_proposalStep$key } from '@relay/VoteStepListActions_proposalStep.graphql'
import useWindowWidth from '@shared/hooks/useWindowWidth'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VoteStepFiltersModal from '../Filters/VoteStepFiltersModal'
import ListActionsQuickFilter, { QuickFilter } from './VoteStepQuickFilter'

interface ListViewButton {
  id: 'grid' | 'list'
  icon: CapUIIcon
  label: string
}

interface Props {
  step: VoteStepListActions_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepListActions_proposalStep on ProposalStep {
    id
    form {
      isMapViewEnabled
      isGridViewEnabled
      isListViewEnabled
      usingCategories
      categories(order: ALPHABETICAL) {
        id
        name
      }
      usingThemes
    }
  }
`

const VoteStepListActions: React.FC<Props> = ({ step: stepKey }) => {
  const intl = useIntl()
  const { width } = useWindowWidth()

  const step = useFragment(FRAGMENT, stepKey)

  const hasMapView = step.form?.isMapViewEnabled
  const hasGridView = step.form?.isGridViewEnabled ?? true
  const hasListView = step.form?.isListViewEnabled ?? true
  const hasBothViews = hasGridView && hasListView

  // Determine default view based on enabled views
  const defaultView = hasGridView ? 'grid' : 'list'

  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger.withDefault(1))
  const [listView, setListView] = useQueryState('list_view', { defaultValue: defaultView })
  const [, setIsMapExpanded] = useQueryState('map_expanded', parseAsInteger)

  const quickFilterButtons: QuickFilter[] = [
    {
      label: intl.formatMessage({ id: 'step.vote.list_actions.quick_filter.famous' }),
      filter: 'votes',
      icon: CapUIIcon.ThumbUpO,
    },
    {
      label: intl.formatMessage({ id: 'step.vote.list_actions.quick_filter.comments' }),
      filter: 'comments',
      icon: CapUIIcon.BubbleO,
    },
    {
      label: intl.formatMessage({ id: 'step.vote.list_actions.quick_filter.news' }),
      filter: 'last',
      icon: CapUIIcon.ClockO,
    },
  ]

  const listViewButtons = (): ListViewButton[] => [
    { id: 'grid', icon: CapUIIcon.Grid, label: intl.formatMessage({ id: 'step.vote.list_actions.view_btn.grid' }) },
    { id: 'list', icon: CapUIIcon.List, label: intl.formatMessage({ id: 'step.vote.list_actions.view_btn.list' }) },
  ]

  return (
    <Flex width="100%" mt="lg" justify="space-between" align="center">
      {width > 1024 && (
        <Flex gap="md">
          {quickFilterButtons.map((filter, index) => (
            <ListActionsQuickFilter key={`quick-filter-${index}`} quickFilterBtn={filter} />
          ))}
        </Flex>
      )}
      {hasBothViews && (
        <Box>
          {listViewButtons().map(viewButton => (
            <Tag
              key={viewButton.id}
              variantColor="info"
              variantSize="medium"
              transparent={listView !== viewButton.id}
              label={viewButton.icon}
              sx={{
                cursor: 'pointer',
                '&:first-child': { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                '&:last-child': { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
              }}
              onClick={() => setListView(viewButton.id)}
            >
              <Tag.LeftIcon name={viewButton.icon} />
              {(width <= 1024 || !isMapShown) && <Tag.Label>{viewButton.label}</Tag.Label>}
            </Tag>
          ))}
        </Box>
      )}
      <VoteStepFiltersModal stepId={step.id} />

      {hasMapView ? (
        <Box flex="none">
          <Button
            variant="tertiary"
            leftIcon={CapUIIcon.Pin}
            onClick={() => {
              setIsMapExpanded(0)
              setIsMapShown(isMapShown === 1 ? 0 : 1)
            }}
          >
            {isMapShown !== 0 ? intl.formatMessage({ id: 'map.hide' }) : intl.formatMessage({ id: 'map.display' })}
          </Button>
        </Box>
      ) : null}
    </Flex>
  )
}

export default VoteStepListActions

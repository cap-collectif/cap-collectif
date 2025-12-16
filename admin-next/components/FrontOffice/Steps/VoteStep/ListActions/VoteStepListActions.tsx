import { Box, Button, CapUIIcon, Flex, Tag } from '@cap-collectif/ui'
import { VoteStepActionsModal_filters_query$key } from '@relay/VoteStepActionsModal_filters_query.graphql'
import { VoteStepListActions_proposalForm$key } from '@relay/VoteStepListActions_proposalForm.graphql'
import useWindowWidth from '@shared/hooks/useWindowWidth'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import VoteStepActionsModal from './VoteStepActionsModal'
import ListActionsQuickFilter, { QuickFilter } from './VoteStepQuickFilter'

interface ListViewButton {
  id: 'grid' | 'list'
  icon: CapUIIcon
  label: string
}

interface Props {
  form: VoteStepListActions_proposalForm$key
  filtersConnection: VoteStepActionsModal_filters_query$key
}

const FRAGMENT = graphql`
  fragment VoteStepListActions_proposalForm on ProposalForm {
    isMapViewEnabled
    usingCategories
    categories {
      id
      name
    }
    usingThemes
  }
`

const VoteStepListActions: React.FC<Props> = ({ form: formKey, filtersConnection }) => {
  const intl = useIntl()
  const { width } = useWindowWidth()

  const form = useFragment(FRAGMENT, formKey)

  const [isMapShown, setIsMapShown] = useQueryState('map_shown', parseAsInteger)
  const [listView, setListView] = useQueryState('list_view', { defaultValue: 'grid' })
  const [, setIsMapExpanded] = useQueryState('map_expanded', parseAsInteger)

  const hasMapView = form?.isMapViewEnabled

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
            {width <= 1024 && <Tag.Label>{viewButton.label}</Tag.Label>}
          </Tag>
        ))}
      </Box>
      <VoteStepActionsModal form={form} filtersConnection={filtersConnection} />

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
            {isMapShown ? intl.formatMessage({ id: 'map.hide' }) : intl.formatMessage({ id: 'map.display' })}
          </Button>
        </Box>
      ) : null}
    </Flex>
  )
}

export default VoteStepListActions

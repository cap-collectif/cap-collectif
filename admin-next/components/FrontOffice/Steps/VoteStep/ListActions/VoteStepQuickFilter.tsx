import { CapUIFontWeight, CapUIIcon, Tag, Tooltip, useTheme } from '@cap-collectif/ui'
import { VoteStepQuickFilter_proposalStep$key } from '@relay/VoteStepQuickFilter_proposalStep.graphql'
import useWindowWidth from '@shared/hooks/useWindowWidth'
import { useQueryState } from 'nuqs'
import { graphql, useFragment } from 'react-relay'

export interface QuickFilter {
  label: string
  filter: string
  icon: CapUIIcon
}

interface Props {
  quickFilterBtn: QuickFilter
  step: VoteStepQuickFilter_proposalStep$key
}

const FRAGMENT = graphql`
  fragment VoteStepQuickFilter_proposalStep on ProposalStep {
    defaultSort
  }
`

const ListActionsQuickFilter: React.FC<Props> = ({ quickFilterBtn, step: stepKey }) => {
  const step = useFragment(FRAGMENT, stepKey)
  const defaultSort = step.defaultSort?.toLowerCase() ?? null
  const [sort, setSort] = useQueryState('sort', { defaultValue: defaultSort })
  const { colors } = useTheme()
  const { width } = useWindowWidth()

  return sort === quickFilterBtn.filter ? (
    <Tag
      variantColor="info"
      variantSize="medium"
      transparent={false}
      color={colors.primary.base}
      fontWeight={CapUIFontWeight.Semibold}
      sx={{ cursor: 'pointer' }}
      onRemove={() => setSort(null)}
    >
      <Tag.LeftIcon name={quickFilterBtn.icon} />
      <Tag.Label>{quickFilterBtn.label}</Tag.Label>
    </Tag>
  ) : (
    <Tooltip label={quickFilterBtn.label}>
      <Tag
        tooltipLabel={quickFilterBtn.label}
        variantColor="info"
        variantSize="medium"
        transparent={true}
        color={colors.primary.base}
        fontWeight={CapUIFontWeight.Semibold}
        sx={{ cursor: 'pointer' }}
        onClick={() => setSort(quickFilterBtn.filter)}
      >
        <Tag.LeftIcon name={quickFilterBtn.icon} />
        {width >= 1200 ? <Tag.Label>{quickFilterBtn.label}</Tag.Label> : null}
      </Tag>
    </Tooltip>
  )
}

export default ListActionsQuickFilter

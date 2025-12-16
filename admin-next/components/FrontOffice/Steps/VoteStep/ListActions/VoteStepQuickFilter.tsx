import { CapUIIcon, Tag } from '@cap-collectif/ui'
import { useQueryState } from 'nuqs'

export interface QuickFilter {
  label: string
  filter: string
  icon: CapUIIcon
}

interface Props {
  quickFilterBtn: QuickFilter
}

const ListActionsQuickFilter: React.FC<Props> = ({ quickFilterBtn }) => {
  const [sort, setSort] = useQueryState('sort')

  return sort === quickFilterBtn.filter ? (
    <Tag
      variantColor="info"
      variantSize="medium"
      transparent={false}
      sx={{ cursor: 'pointer' }}
      onRemove={() => setSort(null)}
    >
      <Tag.LeftIcon name={quickFilterBtn.icon} />
      <Tag.Label>{quickFilterBtn.label}</Tag.Label>
    </Tag>
  ) : (
    <Tag
      variantColor="info"
      variantSize="medium"
      transparent={true}
      sx={{ cursor: 'pointer' }}
      onClick={() => setSort(quickFilterBtn.filter)}
    >
      <Tag.LeftIcon name={quickFilterBtn.icon} />
      <Tag.Label>{quickFilterBtn.label}</Tag.Label>
    </Tag>
  )
}

export default ListActionsQuickFilter

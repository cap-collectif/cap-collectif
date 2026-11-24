import { CapInputSize, Search } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import debounce from '@shared/utils/debounce-promise'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'

type Props = {
  // Only for a search field displayed after a user action (mobile filters page):
  // focusing it on page load would skip the page header and title.
  readonly autoFocus?: boolean
}

const VoteStepPageSearchBar = ({ autoFocus = false }: Props) => {
  const intl = useIntl()
  const { filters, setFilters } = useVoteStepContext()
  const { term } = filters
  const onTermChange = debounce((value: string) => setFilters('term', value || ''), 400)
  return (
    <Search
      variantSize={CapInputSize.Md}
      variantColor="hierarchy"
      id="search-vote-step"
      width="100%"
      onChange={onTermChange}
      value={term}
      autoFocus={autoFocus}
      inputTitle={intl.formatMessage({ id: 'global.search_proposal' })}
      placeholder={intl.formatMessage({
        id: 'vote.step.search',
      })}
    />
  )
}

export default VoteStepPageSearchBar

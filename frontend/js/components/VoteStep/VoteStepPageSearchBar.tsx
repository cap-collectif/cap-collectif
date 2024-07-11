import { Search } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import debounce from '~/utils/debounce-promise'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'

const VoteStepPageSearchBar = () => {
  const intl = useIntl()
  const { filters, setFilters } = useVoteStepContext()
  const { term } = filters
  const onTermChange = debounce((value: string) => setFilters('term', value || ''), 400)
  return (
    <Search
      id="search-vote-step"
      width="100%"
      onChange={onTermChange}
      value={term}
      autoFocus
      inputTitle={intl.formatMessage({ id: 'global.search_proposal' })}
      placeholder={intl.formatMessage({
        id: 'vote.step.search',
      })}
    />
  )
}

export default VoteStepPageSearchBar

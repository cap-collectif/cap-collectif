import { CapInputSize, Search } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import debounce from '@shared/utils/debounce-promise'
import { useQueryState } from 'nuqs'

const VoteStepSearchBar = () => {
  const intl = useIntl()
  const [term, setTerm] = useQueryState('term')

  const onTermChange = debounce((value: string) => setTerm(value || ''), 400)

  return (
    <Search
      variantSize={CapInputSize.Md}
      variantColor="hierarchy"
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

export default VoteStepSearchBar

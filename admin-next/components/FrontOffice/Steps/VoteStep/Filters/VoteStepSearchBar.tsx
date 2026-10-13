import { CapInputSize, Search } from '@cap-collectif/ui'
import debounce from '@shared/utils/debounce-promise'
import { useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'

type Props = {
  proposalsCount: number
}

const VoteStepSearchBar: React.FC<Props> = ({ proposalsCount }) => {
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
      placeholder={intl.formatMessage({ id: 'front.vote-step.search-proposals' }, { n: proposalsCount })}
    />
  )
}

export default VoteStepSearchBar

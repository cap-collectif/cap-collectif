import { CapInputSize, Search } from '@cap-collectif/ui'
import debounce from '@shared/utils/debounce-promise'
import { useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getContributionObjectTypeTranslationKey } from '@shared/constants/proposalStepObjectType'

type Props = {
  proposalsCount: number
  objectType?: string | null
}

const VoteStepSearchBar: React.FC<Props> = ({ proposalsCount, objectType }) => {
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
      inputTitle={intl.formatMessage({
        id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search`,
      })}
      placeholder={intl.formatMessage(
        { id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search-placeholder` },
        { n: proposalsCount },
      )}
    />
  )
}

export default VoteStepSearchBar

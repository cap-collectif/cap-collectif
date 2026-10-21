import { Box, CapInputSize, Search } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
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
  const isMobile = useIsMobile()
  const [term, setTerm] = useQueryState('term')
  const [inputValue, setInputValue] = React.useState(term || '')

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const onTermChange = (value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setInputValue(value)
    if (!value) {
      setTerm(null)
      return
    }
    timeoutRef.current = setTimeout(() => setTerm(value), 400)
  }

  React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), [])
  React.useEffect(() => setInputValue(term || ''), [term])

  const handleMobileClear = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || !(event.target instanceof Element) || !event.target.closest('button')) return
    event.preventDefault()
    event.stopPropagation()
    onTermChange('')
  }

  return (
    <Box onPointerDownCapture={handleMobileClear} minWidth="200px" flex="1 0 200px">
      <Search
        variantSize={CapInputSize.Md}
        variantColor="hierarchy"
        id="search-vote-step"
        width="100%"
        onChange={onTermChange}
        value={inputValue}
        autoFocus
        inputTitle={intl.formatMessage({
          id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search`,
        })}
        placeholder={intl.formatMessage(
          { id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search-placeholder` },
          { n: proposalsCount },
        )}
      />
    </Box>
  )
}

export default VoteStepSearchBar

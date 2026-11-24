import { Box, CapInputSize, Search } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
import { useQueryState } from 'nuqs'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { getContributionObjectTypeTranslationKey } from '@shared/constants/proposalStepObjectType'

type Props = {
  proposalsCount: number
  objectType?: string | null
  // Only for a search field displayed after a user action (mobile filters modal):
  // focusing it on page load would skip the page header and title.
  autoFocus?: boolean
}

const VoteStepSearchBar: React.FC<Props> = ({ proposalsCount, objectType, autoFocus = false }) => {
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

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputId = React.useId()
  const placeholder = intl.formatMessage(
    { id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search-placeholder` },
    { n: proposalsCount },
  )

  React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), [])
  React.useEffect(() => setInputValue(term || ''), [term])
  // The autoFocus attribute is not enough inside a modal: the modal focuses its close button when it opens.
  // Focus the field once the modal has done it (autoFocus becomes true when the modal opens).
  React.useEffect(() => {
    if (!autoFocus) return
    const timer = setTimeout(() => containerRef.current?.querySelector('input')?.focus(), 100)
    return () => clearTimeout(timer)
  }, [autoFocus])

  const handleMobileClear = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || !(event.target instanceof Element) || !event.target.closest('button')) return
    event.preventDefault()
    event.stopPropagation()
    onTermChange('')
  }

  return (
    <Box ref={containerRef} onPointerDownCapture={handleMobileClear} minWidth="200px" flex="1 0 200px">
      {/* Real label repeating the visible placeholder text (the title alone is not a reliable name) */}
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <Search
        inputId={inputId}
        variantSize={CapInputSize.Md}
        variantColor="hierarchy"
        id="search-vote-step"
        width="100%"
        onChange={onTermChange}
        value={inputValue}
        inputTitle={intl.formatMessage({
          id: `front.contribution.${getContributionObjectTypeTranslationKey(objectType)}.search`,
        })}
        placeholder={placeholder}
      />
    </Box>
  )
}

export default VoteStepSearchBar

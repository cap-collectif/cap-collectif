import type * as React from 'react'
import type { IntlShape } from 'react-intl'
import type { Select as CapSelect } from '@cap-collectif/ui'

// Typed from the CapUI Select: admin-next itself resolves an older react-select version
type CapSelectProps = React.ComponentProps<typeof CapSelect>
export type SelectAriaLiveMessages = NonNullable<CapSelectProps['ariaLiveMessages']>
export type SelectScreenReaderStatus = NonNullable<CapSelectProps['screenReaderStatus']>

/**
 * react-select announces its state in an aria-live region with hard-coded English messages
 * ("5 results available. Use Up and Down to choose options…"): screen readers then read them
 * with an English voice in a French page. These messages replace them in the user's locale.
 */
export const getSelectAriaLiveMessages = (intl: IntlShape): SelectAriaLiveMessages => ({
  guidance: ({ context, isSearchable, isInitialFocus }) => {
    if (context === 'menu') return intl.formatMessage({ id: 'global.select.menu-guidance' })
    if (context === 'input' && isInitialFocus && isSearchable) return intl.formatMessage({ id: 'aria-select-guide' })
    // The 'value' context is skipped: CapUI handles keyboard navigation between multi values itself
    return ''
  },
  onChange: ({ action, label, labels, isDisabled }) => {
    switch (action) {
      case 'select-option':
        return isDisabled ? '' : intl.formatMessage({ id: 'aria-select-on-label-change' }, { label })
      case 'initial-input-focus':
        return labels.length
          ? intl.formatMessage({ id: 'aria-select-on-label-change' }, { label: labels.join(', ') })
          : ''
      case 'deselect-option':
      case 'pop-value':
      case 'remove-value':
        return intl.formatMessage({ id: 'global.select.option-deselected' }, { label })
      case 'clear':
        return intl.formatMessage({ id: 'aria-select-empty-field' })
      default:
        return ''
    }
  },
  onFocus: ({ context, focused, options, label, selectValue, isSelected, isAppleDevice }) => {
    // Elsewhere, screen readers announce the focused option themselves through aria-activedescendant,
    // which react-select does not set on Apple devices (VoiceOver ignores it)
    if (context === 'menu' && !isAppleDevice) return ''
    const list: readonly unknown[] = context === 'menu' ? options : selectValue
    if (!list.length) return ''
    const position = intl.formatMessage(
      { id: 'carrousel.position' },
      { position: list.indexOf(focused) + 1, total: list.length },
    )
    const name =
      context === 'menu' && isSelected ? intl.formatMessage({ id: 'aria-select-on-label-change' }, { label }) : label
    return `${name}, ${position}`
  },
  // The user typed the search term: the number of results is enough. The period makes screen readers
  // pause before the menu guidance, read right after in the same live region
  onFilter: ({ resultsMessage }) => `${resultsMessage}.`,
})

export const getSelectScreenReaderStatus =
  (intl: IntlShape): SelectScreenReaderStatus =>
  ({ count }) =>
    intl.formatMessage({ id: 'global.select.results-available' }, { count })

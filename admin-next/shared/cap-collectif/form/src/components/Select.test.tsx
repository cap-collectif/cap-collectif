import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { createIntl } from 'react-intl'
import { FormLabel } from '@cap-collectif/ui'
import MockProviders from 'tests/testUtils'
import FormControl from './FormControl'
import FieldInput from './fieldInput/FieldInput'
import { getSelectAriaLiveMessages, getSelectScreenReaderStatus } from '../utils/selectAriaLiveMessages'

const intl = createIntl({
  locale: 'fr',
  messages: {
    'global.select.menu-guidance': 'Consignes du menu',
    'global.select.option-deselected': '{label} désélectionné',
    'global.select.results-available':
      '{count, plural, =0 {Aucun résultat disponible} one {# résultat disponible} other {# résultats disponibles}}',
    'aria-select-guide': 'Consignes du champ',
    'aria-select-on-label-change': '{label} sélectionné',
    'aria-select-empty-field': 'Champ vidé',
    'carrousel.position': '{position} sur {total}',
  },
})
const messages = getSelectAriaLiveMessages(intl)
const options = [{ label: 'Vélo' }, { label: 'Santé' }, { label: 'Énergies' }]

const guidanceProps = {
  'aria-label': undefined,
  isMulti: false,
  isSearchable: true,
  isDisabled: false,
  tabSelectsValue: true,
  isInitialFocus: false,
}

const focusProps = {
  focused: options[1],
  label: 'Santé',
  options,
  selectValue: [],
  isDisabled: false,
  isSelected: false,
  isAppleDevice: true,
}

test('translates the menu guidance and the input guidance on initial focus', () => {
  expect(messages.guidance?.({ ...guidanceProps, context: 'menu' })).toBe('Consignes du menu')
  expect(messages.guidance?.({ ...guidanceProps, context: 'input', isInitialFocus: true })).toBe('Consignes du champ')
  expect(messages.guidance?.({ ...guidanceProps, context: 'input' })).toBe('')
  expect(messages.guidance?.({ ...guidanceProps, context: 'value' })).toBe('')
})

test.each([
  [0, 'Aucun résultat disponible'],
  [1, '1 résultat disponible'],
  [5, '5 résultats disponibles'],
])('translates the number of results (%s)', (count, expected) => {
  expect(getSelectScreenReaderStatus(intl)({ count })).toBe(expected)
  expect(messages.onFilter?.({ inputValue: 'vé', resultsMessage: expected })).toBe(`${expected}.`)
})

test('announces the focused option position only on Apple devices', () => {
  expect(messages.onFocus?.({ ...focusProps, context: 'menu' })).toBe('Santé, 2 sur 3')
  expect(messages.onFocus?.({ ...focusProps, context: 'menu', isSelected: true })).toBe('Santé sélectionné, 2 sur 3')
  expect(messages.onFocus?.({ ...focusProps, context: 'menu', isAppleDevice: false })).toBe('')
})

test('translates value changes', () => {
  const changeProps = { label: 'Santé', labels: ['Santé'], isDisabled: false, option: options[1], value: options[1] }
  expect(messages.onChange?.({ ...changeProps, action: 'select-option' } as any)).toBe('Santé sélectionné')
  expect(messages.onChange?.({ ...changeProps, action: 'initial-input-focus' } as any)).toBe('Santé sélectionné')
  expect(messages.onChange?.({ ...changeProps, action: 'remove-value' } as any)).toBe('Santé désélectionné')
  expect(messages.onChange?.({ ...changeProps, action: 'clear' } as any)).toBe('Champ vidé')
})

const CategoryField = () => {
  const { control } = useForm({ defaultValues: { category: '' } })
  return (
    <FormControl name="category" control={control}>
      <FormLabel id="category-label" htmlFor="category" label="Category" />
      <FieldInput
        type="select"
        control={control}
        name="category"
        id="category"
        aria-labelledby="category-label"
        menuPortalTarget={null}
        options={[
          { label: 'Vélo', value: 'bike' },
          { label: 'Santé', value: 'health' },
        ]}
      />
    </FormControl>
  )
}

test('replaces react-select English announcements when the menu opens', () => {
  render(
    <MockProviders>
      <CategoryField />
    </MockProviders>,
  )
  const input = screen.getByRole('combobox', { name: 'Category' })
  fireEvent.focus(input)
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  const liveRegion = document.querySelector('[role="log"]')
  // MockProviders has no messages: translation keys are rendered as is
  expect(liveRegion?.textContent).toContain('global.select.results-available')
  expect(liveRegion?.textContent).toContain('global.select.menu-guidance')
  expect(liveRegion?.textContent).not.toMatch(/results available|Use Up and Down/)
})

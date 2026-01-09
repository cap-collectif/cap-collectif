import {
  Accordion,
  CapUIFontSize,
  CapUIFontWeight,
  CapUILineHeight,
  Flex,
  Radio,
  RadioGroup,
  Text,
} from '@cap-collectif/ui'
import { ChangeEvent } from 'react'
import { useIntl } from 'react-intl'
import { FilterState, Filters } from './useVoteStepFilters'

type Props = {
  filters: Filters
  currentFilters: FilterState
  onFilterChange: (key: keyof FilterState, value: string | null) => void
  defaultAccordions?: string[]
}

const VoteStepFiltersAccordions: React.FC<Props> = ({
  filters,
  currentFilters,
  onFilterChange,
  defaultAccordions = [],
}) => {
  const intl = useIntl()

  return (
    <Accordion defaultAccordion={defaultAccordions} allowMultiple color="white">
      <Accordion.Item id="filter_by">
        <Accordion.Button p={0}>
          <Text fontWeight={CapUIFontWeight.Normal} fontSize={CapUIFontSize.BodyRegular} lineHeight={CapUILineHeight.M}>
            {intl.formatMessage({ id: 'sort-by' })}
          </Text>
        </Accordion.Button>
        <Accordion.Panel display="flex" direction="column" ml="0">
          <RadioGroup pt={2}>
            {filters.sort.options.map(option => (
              <Flex alignItems="center" key={option.id}>
                <Radio
                  id={`sort-${option.id}`}
                  name="sort"
                  value={option.id}
                  checked={currentFilters.sort === option.id}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('sort', e.target.value)}
                >
                  {option.title}
                </Radio>
              </Flex>
            ))}
          </RadioGroup>
        </Accordion.Panel>
      </Accordion.Item>

      {filters.category.isEnabled ? (
        <Accordion.Item id="categories">
          <Accordion.Button p={0} pb={1}>
            <Text
              fontWeight={CapUIFontWeight.Normal}
              fontSize={CapUIFontSize.BodyRegular}
              lineHeight={CapUILineHeight.M}
            >
              {intl.formatMessage({ id: 'global.categories' })}
            </Text>
          </Accordion.Button>
          <Accordion.Panel display="flex" direction="column" ml="0">
            <RadioGroup pt={2}>
              {filters.category.options.map(category => (
                <Radio
                  id={`category-${category.id}`}
                  key={`category-${category.id}`}
                  name="category"
                  value={category.id}
                  checked={currentFilters.category === category.id}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('category', e.target.value)}
                >
                  {category.name}
                </Radio>
              ))}
            </RadioGroup>
          </Accordion.Panel>
        </Accordion.Item>
      ) : null}

      {filters.theme.options.length > 0 ? (
        <Accordion.Item id="themes">
          <Accordion.Button p={0} pb={1}>
            <Text
              fontWeight={CapUIFontWeight.Normal}
              fontSize={CapUIFontSize.BodyRegular}
              lineHeight={CapUILineHeight.M}
            >
              {intl.formatMessage({ id: 'global.themes' })}
            </Text>
          </Accordion.Button>
          <Accordion.Panel display="flex" direction="column" ml="0">
            <RadioGroup pt={2}>
              {[
                ...filters.theme.options.map(theme => (
                  <Radio
                    id={`theme-${theme.id}`}
                    key={theme.id}
                    name="theme"
                    value={theme.id}
                    checked={currentFilters.theme === theme.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('theme', e.target.value)}
                  >
                    {theme.title ?? theme.name}
                  </Radio>
                )),
                <Radio
                  key="theme-none"
                  id="theme-none"
                  name="theme"
                  value="NONE"
                  checked={currentFilters.theme === 'NONE'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('theme', e.target.value)}
                >
                  {intl.formatMessage({ id: 'admin.fields.proposal.no_theme' })}
                </Radio>,
              ]}
            </RadioGroup>
          </Accordion.Panel>
        </Accordion.Item>
      ) : null}

      {filters.status.isEnabled && filters.status.options.length > 0 && (
        <Accordion.Item id="statuses">
          <Accordion.Button p={0} pb={1}>
            <Text
              fontWeight={CapUIFontWeight.Normal}
              fontSize={CapUIFontSize.BodyRegular}
              lineHeight={CapUILineHeight.M}
            >
              {intl.formatMessage({ id: 'status.plural' })}
            </Text>
          </Accordion.Button>

          <Accordion.Panel display="flex" direction="column" ml="0">
            <RadioGroup pt={2}>
              {filters.status.options.map(statusItem => (
                <Radio
                  key={statusItem.id}
                  id={`status-${statusItem.id}`}
                  name="status"
                  value={statusItem.id}
                  checked={currentFilters.status === statusItem.id}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('status', e.target.value)}
                >
                  {statusItem.name}
                </Radio>
              ))}
            </RadioGroup>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      <Accordion.Item id="contributors">
        <Accordion.Button p={0} pb={1}>
          <Text fontWeight={CapUIFontWeight.Normal} fontSize={CapUIFontSize.BodyRegular} lineHeight={CapUILineHeight.M}>
            {intl.formatMessage({ id: 'global.contributors' })}
          </Text>
        </Accordion.Button>
        <Accordion.Panel display="flex" direction="column" ml="0">
          <RadioGroup pt={2}>
            {filters.userType.options.map(userType => (
              <Radio
                key={userType.id}
                id={`contributor-${userType.id}`}
                name="contributors"
                value={userType.id}
                checked={currentFilters.userType === userType.id}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('userType', e.target.value)}
              >
                {userType.name}
              </Radio>
            ))}
          </RadioGroup>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default VoteStepFiltersAccordions

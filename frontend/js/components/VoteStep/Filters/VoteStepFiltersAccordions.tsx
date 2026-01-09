import { Accordion, CapUIAccordionColor, CapUIAccordionSize, CapUIFontSize, Flex, Text } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import * as React from 'react'
import { FC } from 'react'
import VoteStepFilterButtons from '~/components/VoteStep/Filters/VoteStepFilterButtons'
import VoteStepFilterRadioGroup from '~/components/VoteStep/Filters/VoteStepFilterRadioGroup'
import './useVoteStepFilters'
import type { Filters } from './useVoteStepFilters'

type Props = {
  filters: Filters
  isMobile: boolean
}

const VoteStepFiltersAccordions: FC<Props> = ({ filters, isMobile }) => {
  const getOpenAccordions = React.useCallback(() => {
    const currentUrl = window.location.href
    const urlParams = new URL(currentUrl).searchParams
    const keys = Object.keys(filters)
    const openAccordions = keys.filter(key => urlParams.has(key))
    return openAccordions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, window.location.href])

  const [openAccordions, setOpenAccordions] = React.useState<string[]>(() => getOpenAccordions())

  React.useEffect(() => {
    setOpenAccordions(() => getOpenAccordions())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.href])

  return (
    <Flex direction="column" spacing={4}>
      <Accordion
        size={CapUIAccordionSize.sm}
        color={CapUIAccordionColor.white}
        defaultAccordion={openAccordions}
        allowMultiple
      >
        {Object.keys(filters).map(filterName => {
          const config = filters[filterName]
          return config.isEnabled ? (
            <Accordion.Item key={filterName} id={filterName}>
              <Accordion.Button>
                <Text fontWeight={600} fontSize={CapUIFontSize.BodyRegular} textAlign="left">
                  {config.label ?? ''}
                </Text>
              </Accordion.Button>
              <Accordion.Panel
                sx={{
                  px: pxToRem(4) + '!important',
                }}
              >
                {isMobile ? (
                  <VoteStepFilterButtons options={config.options} filterName={filterName} />
                ) : (
                  <VoteStepFilterRadioGroup options={config.options} filterName={filterName} />
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ) : null
        })}
      </Accordion>
    </Flex>
  )
}

export default VoteStepFiltersAccordions

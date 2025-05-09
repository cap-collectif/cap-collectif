import * as React from 'react'
import { Accordion, CapUIAccordionColor, CapUIAccordionSize, Flex, Text, CapUIFontSize } from '@cap-collectif/ui'
import VoteStepFilterRadioGroup from '~/components/VoteStep/Filters/VoteStepFilterRadioGroup'
import VoteStepFilterButtons from '~/components/VoteStep/Filters/VoteStepFilterButtons'
import type { Filters } from './useVoteStepFilters'
import './useVoteStepFilters'
import ResetCss from '~/utils/ResetCss'

type Props = {
  filters: Filters
  isMobile: boolean
}

const VoteStepFiltersAccordions = ({ filters, isMobile }: Props) => {

  const getOpenAccordions = React.useCallback(()=> {
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
      {Object.keys(filters).map(filterName => {
        const config = filters[filterName]
        return config.isEnabled ? (
          <Accordion
            key={filterName}
            size={CapUIAccordionSize.Sm}
            color={CapUIAccordionColor.Transparent}
            defaultAccordion={openAccordions}
          >
            <Accordion.Item
              id={filterName}
              sx={{
                padding: '0 !important',
              }}
            >
              <ResetCss>
                <Accordion.Button>
                  <Text fontWeight={600} fontSize={CapUIFontSize.BodyRegular} textAlign="left">
                    {config.label ?? ''}
                  </Text>
                </Accordion.Button>
              </ResetCss>
              <Accordion.Panel
                sx={{
                  padding: '0 16px !important',
                }}
              >
                {isMobile ? (
                  <VoteStepFilterButtons options={config.options} filterName={filterName} />
                ) : (
                  <VoteStepFilterRadioGroup options={config.options} filterName={filterName} />
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : null
      })}
    </Flex>
  )
}

export default VoteStepFiltersAccordions

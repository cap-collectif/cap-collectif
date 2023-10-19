import * as React from 'react'
import { Accordion, Flex, Text } from '@cap-collectif/ui'
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
  return (
    <Flex direction="column" spacing={4}>
      {Object.keys(filters).map((filterName, idx) => {
        const config = filters[filterName]
        return config.isEnabled ? (
          <Accordion key={filterName} size="sm" color="transparent" defaultAccordion={!idx ? filterName : null}>
            <Accordion.Item
              id={filterName}
              sx={{
                padding: '0 !important',
              }}
            >
              <ResetCss>
                <Accordion.Button>
                  <Text fontWeight={600} fontSize={3} textAlign="left">
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

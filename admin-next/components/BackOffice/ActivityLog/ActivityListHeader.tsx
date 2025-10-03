import * as React from 'react'
import { Button, CapUIIcon, CapUIIconSize, Flex, FormLabel, Icon, Input, Search } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import downloadCSV from '@utils/download-csv'
import { DateRange } from '@relay/ActivityLogPageQuery.graphql'

type Props = {
  term: string
  onTermChange: (term: string) => void
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
  onReset: () => void
}

export const ActivityListHeader: React.FC<Props> = ({ term, onTermChange, dateRange, setDateRange, onReset }) => {
  const intl = useIntl()

  const exportLogs = async () => {
    await downloadCSV('/download-app-logs', intl)
  }

  const handleStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      startedAt: event.target.value || null,
      endedAt: dateRange?.endedAt ?? null,
    })
  }

  const handleEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      startedAt: dateRange?.startedAt ?? null,
      endedAt: event.target.value || null,
    })
  }

  return (
    <Flex width="100%" gap={8}>
      <Flex direction="column" gap={1} mt="auto" mb={0}>
        <FormLabel label={intl.formatMessage({ id: 'global.search.label' })} />
        <Search
          id="search-activity"
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'activity-log.search-placeholder' })}
        />
      </Flex>

      <Flex alignItems={'flex-end'}>
        <Flex
          direction="column"
          alignItems="flex-start"
          gap={1}
          width="max-content"
          mb={0}
          sx={{ div: { marginBottom: '0 !important' } }}
        >
          <FormLabel htmlFor="startedAt" label={intl.formatMessage({ id: 'start-date' })} />
          <Input
            id="startedAt"
            name="startedAt"
            type="datetime-local"
            value={dateRange?.startedAt ?? ''}
            mb={0}
            onChange={handleStartChange}
          />
        </Flex>

        <Flex alignContent={'center'} justifyContent={'center'} mt={2} mb={1} mx={1}>
          <Icon name={CapUIIcon.LongArrowRight} mt={2} mb={0} size={CapUIIconSize.Md} />
        </Flex>

        <Flex
          direction="column"
          alignItems="flex-start"
          gap={1}
          width="max-content"
          mb={0}
          sx={{ div: { marginBottom: '0 !important' } }}
        >
          <FormLabel
            htmlFor="endedAt"
            label={intl.formatMessage({ id: 'ending-date' })}
            mb={0}
            sx={{
              div: { marginBottom: '0 !important' },
            }}
          />
          <Input
            id="endedAt"
            name="endedAt"
            type="datetime-local"
            value={dateRange?.endedAt ?? ''}
            onChange={handleEndChange}
          />
        </Flex>
      </Flex>

      <Button leftIcon={CapUIIcon.Download} onClick={exportLogs} mt="auto" mb={0} border="1px solid transparent">
        {intl.formatMessage({ id: 'global.export' })}
      </Button>

      <Button variant="secondary" onClick={onReset} mt="auto" mb={0} border="1px solid transparent">
        {intl.formatMessage({ id: 'global.action.reset-search-and-filters' })}
      </Button>
    </Flex>
  )
}

export default ActivityListHeader

import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Collapsable from '~ui/Collapsable'
import DropdownSelect from '~ui/DropdownSelect'
import { PROPOSAL_STATUS } from '~/constants/AnalyseConstants'
import type { ProposalsProgressStateValues } from '~/components/Admin/Project/ProjectAdminPage.reducer'

type Props = {
  value: ProposalsProgressStateValues
  onChange: (newValue: ProposalsProgressStateValues) => void
}

const AnalysisFilterProgressState = ({ value, onChange }: Props) => {
  const intl = useIntl()
  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="table.header.filter.progress" />
      </Collapsable.Button>
      <Collapsable.Element
        ariaLabel={intl.formatMessage({
          id: 'filter-by',
        })}
      >
        <DropdownSelect
          shouldOverflow
          value={value}
          defaultValue="ALL"
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({
            id: 'filter-by',
          })}
        >
          <DropdownSelect.Choice value="ALL">
            {intl.formatMessage({
              id: 'global.select_statuses',
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="TODO">
            {intl.formatMessage({
              id: PROPOSAL_STATUS.TODO.label,
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="IN_PROGRESS">
            {intl.formatMessage({
              id: PROPOSAL_STATUS.IN_PROGRESS.label,
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="FAVOURABLE">
            {intl.formatMessage({
              id: PROPOSAL_STATUS.FAVOURABLE.label,
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value="UNFAVOURABLE">
            {intl.formatMessage({
              id: PROPOSAL_STATUS.UNFAVOURABLE.label,
            })}
          </DropdownSelect.Choice>
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  )
}

export default AnalysisFilterProgressState

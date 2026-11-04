import ModerateReportingMutation from '@mutations/ModerateReportingMutation'
import type { ModerateReportingAction } from '@relay/ModerateReportingMutation.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { useIntl } from 'react-intl'

export type ReportingAction = Exclude<ModerateReportingAction, '%future added value'>

export const ACTION_LABEL: Record<ReportingAction, string> = {
  ARCHIVE: 'admin.action.reporting.archive.label',
  TRASH: 'admin.action.reporting.trash.label',
  DISABLE: 'admin.action.reporting.disable.label',
}

const SUCCESS_MESSAGE: Record<ReportingAction, string> = {
  ARCHIVE: 'admin.action.reporting.archive.success',
  TRASH: 'admin.action.reporting.trash.success',
  DISABLE: 'admin.action.reporting.disable.success',
}

// Shared by the details modal and the list confirmation modal; resolves to true on success
export const useModerateReporting = () => {
  const intl = useIntl()
  const [pendingAction, setPendingAction] = React.useState<ReportingAction | null>(null)

  const moderate = async (id: string, action: ReportingAction): Promise<boolean> => {
    setPendingAction(action)
    try {
      const response = await ModerateReportingMutation.commit({ input: { id, action } })
      if (response.moderateReporting?.errorCode || !response.moderateReporting?.reporting) {
        mutationErrorToast(intl)
        return false
      }
      successToast(intl.formatMessage({ id: SUCCESS_MESSAGE[action] }))
      return true
    } catch {
      mutationErrorToast(intl)
      return false
    } finally {
      setPendingAction(null)
    }
  }

  return { moderate, pendingAction }
}

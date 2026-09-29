import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'
import { useMutation } from 'react-relay'
import { CustomCodeVersioningPageCommitMutation } from '@relay/CustomCodeVersioningPageCommitMutation.graphql'
import { CustomCodeVersioningPageRestoreMutation } from '@relay/CustomCodeVersioningPageRestoreMutation.graphql'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { COMMIT_MUTATION, RESTORE_MUTATION } from './CustomCodeVersioningPage.queries'
import {
  ActiveCustomCodeModal,
  CommitForm,
  CustomCodeItem,
  CustomCodePayload,
  Version,
} from './customCodeVersioning.types'
import {
  capitalizeAuthorName,
  EMPTY_COMMIT_FORM,
  getErrorMessageKey,
  getRestoreFormDefaults,
  getStoredAuthorName,
  storeAuthorName,
} from './customCodeVersioning.utils'

type SetActiveModal = Dispatch<SetStateAction<ActiveCustomCodeModal>>

type UseCustomCodeCommitRestoreParams = {
  activeModal: ActiveCustomCodeModal
  draftContent: string
  hasUnsavedChanges: boolean
  selectedItem: CustomCodeItem | null
  setActiveModal: SetActiveModal
  versionsFirst: number
}

export const useCustomCodeCommitRestore = ({
  activeModal,
  draftContent,
  hasUnsavedChanges,
  selectedItem,
  setActiveModal,
  versionsFirst,
}: UseCustomCodeCommitRestoreParams) => {
  const intl = useIntl()
  const [storedAuthorName, setStoredAuthorName] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null)
  const form = useForm<CommitForm>({
    defaultValues: EMPTY_COMMIT_FORM,
    mode: 'onChange',
  })
  const formValues = form.watch()
  const [commitCustomCodeVersion, isCommitLoading] =
    useMutation<CustomCodeVersioningPageCommitMutation>(COMMIT_MUTATION)
  const [restoreCustomCodeVersion, isRestoreLoading] =
    useMutation<CustomCodeVersioningPageRestoreMutation>(RESTORE_MUTATION)
  const canSubmitCommit =
    !!selectedItem && !!formValues.title.trim() && !!formValues.authorName.trim() && hasUnsavedChanges
  const canSubmitRestore = !!selectedItem && !!formValues.title.trim() && !!formValues.authorName.trim()

  useEffect(() => {
    const authorName = getStoredAuthorName()
    setStoredAuthorName(authorName)
    form.reset({ ...EMPTY_COMMIT_FORM, authorName })
  }, [form])

  const resetForm = (authorName = storedAuthorName) => {
    form.reset({ ...EMPTY_COMMIT_FORM, authorName })
    setFormErrorMessage(null)
  }

  const rememberAuthorName = (authorName: string): string => {
    const normalizedAuthorName = capitalizeAuthorName(authorName)
    setStoredAuthorName(normalizedAuthorName)
    storeAuthorName(normalizedAuthorName)

    return normalizedAuthorName
  }

  const openCommitModal = () => {
    setFormErrorMessage(null)
    setActiveModal({ type: 'commit' })
  }

  const openRestoreModal = (version: Version) => {
    form.reset(getRestoreFormDefaults(version, storedAuthorName))
    setFormErrorMessage(null)
    setActiveModal({ type: 'restore', version })
  }

  const commit = () => {
    if (!selectedItem) return

    setFormErrorMessage(null)
    commitCustomCodeVersion({
      variables: {
        versionsFirst,
        input: {
          keyname: selectedItem.keyname,
          title: formValues.title.trim(),
          authorName: capitalizeAuthorName(formValues.authorName),
          description: formValues.description?.trim() || null,
          referenceUrl: formValues.referenceUrl.trim() || null,
          content: draftContent,
          baseContentHash: selectedItem.activeContentHash,
        },
      },
      onCompleted: response =>
        handleMutationResponse({
          customCode: response.commitCustomCodeVersion?.customCode as CustomCodePayload | null | undefined,
          errorCode: response.commitCustomCodeVersion?.errorCode,
          formAuthorName: formValues.authorName,
          intl,
          rememberAuthorName,
          resetForm,
          setActiveModal,
          setFormErrorMessage,
          toastMessageId: 'admin.custom-code.toast.versioned',
        }),
      onError: () => mutationErrorToast(intl),
    })
  }

  const restore = () => {
    if (!selectedItem || activeModal.type !== 'restore') return

    setFormErrorMessage(null)
    restoreCustomCodeVersion({
      variables: {
        versionsFirst,
        input: {
          versionId: activeModal.version.id,
          title: formValues.title.trim(),
          authorName: capitalizeAuthorName(formValues.authorName),
          description: formValues.description?.trim() || null,
          referenceUrl: formValues.referenceUrl.trim() || null,
          baseContentHash: selectedItem.activeContentHash,
        },
      },
      onCompleted: response =>
        handleMutationResponse({
          customCode: response.restoreCustomCodeVersion?.customCode as CustomCodePayload | null | undefined,
          errorCode: response.restoreCustomCodeVersion?.errorCode,
          formAuthorName: formValues.authorName,
          intl,
          rememberAuthorName,
          resetForm,
          setActiveModal,
          setFormErrorMessage,
          toastMessageId: 'admin.custom-code.toast.restored',
        }),
      onError: () => mutationErrorToast(intl),
    })
  }

  return {
    canSubmitCommit,
    canSubmitRestore,
    commitFormControl: form.control,
    formErrorMessage,
    isCommitLoading,
    isRestoreLoading,
    commit,
    openCommitModal,
    openRestoreModal,
    resetForm,
    restore,
  }
}

type HandleMutationResponseParams = {
  customCode?: CustomCodePayload | null
  errorCode?: string | null
  formAuthorName: string
  intl: IntlShape
  rememberAuthorName: (authorName: string) => string
  resetForm: (authorName?: string) => void
  setActiveModal: SetActiveModal
  setFormErrorMessage: (message: string | null) => void
  toastMessageId: string
}

const handleMutationResponse = ({
  customCode,
  errorCode,
  formAuthorName,
  intl,
  rememberAuthorName,
  resetForm,
  setActiveModal,
  setFormErrorMessage,
  toastMessageId,
}: HandleMutationResponseParams) => {
  if (errorCode) {
    setFormErrorMessage(intl.formatMessage({ id: getErrorMessageKey(errorCode) }))
    return
  }
  if (customCode) {
    const authorName = rememberAuthorName(formAuthorName)
    setActiveModal({ type: 'none' })
    resetForm(authorName)
    successToast(intl.formatMessage({ id: toastMessageId }))
  }
}

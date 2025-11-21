import { toast } from '@cap-collectif/ui'
export { mutationErrorToast } from './mutation-error-toast'

export const infoToast = (label: string) =>
  toast({
    variant: 'info',
    content: label,
  })

export const successToast = (label: string) =>
  toast({
    variant: 'success',
    content: label,
  })

export const loadingToast = (label: string) =>
  toast({
    variant: 'loading',
    content: label,
  })

export const warningToast = (label: string) =>
  toast({
    variant: 'warning',
    content: label,
  })

export const dangerToast = (label: string) =>
  toast({
    variant: 'danger',
    content: label,
  })

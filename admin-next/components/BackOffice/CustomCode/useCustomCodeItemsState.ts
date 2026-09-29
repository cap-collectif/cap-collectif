import { useEffect, useState } from 'react'
import { CustomCodeVersioningPageQuery } from '@relay/CustomCodeVersioningPageQuery.graphql'
import { buildCustomCodeItems, DEFAULT_SELECTED_KEYNAME, getSelectedCustomCodeItem } from './customCodeVersioning.utils'

export const useCustomCodeItemsState = (data: CustomCodeVersioningPageQuery['response']) => {
  const [selectedKeyname, setSelectedKeyname] = useState(DEFAULT_SELECTED_KEYNAME)
  const [draftContent, setDraftContent] = useState('')
  const items = buildCustomCodeItems(data)
  const selectedItem = getSelectedCustomCodeItem(items, selectedKeyname)
  const effectiveSelectedKeyname = selectedItem?.keyname ?? selectedKeyname
  const currentVersion = selectedItem?.versions[0]
  const previousVersions = selectedItem?.versions.filter(version => version.id !== currentVersion?.id) ?? []
  const previousVersionsCount = Math.max((selectedItem?.versionsCount ?? 0) - (currentVersion ? 1 : 0), 0)
  const hasUnsavedChanges = selectedItem ? draftContent !== selectedItem.value : false

  useEffect(() => {
    setDraftContent(selectedItem?.value ?? '')
  }, [selectedItem?.keyname, selectedItem?.value])

  const resetDraftContent = () => {
    if (selectedItem) {
      setDraftContent(selectedItem.value)
    }
  }

  return {
    currentVersion,
    draftContent,
    hasUnsavedChanges,
    isEmpty: items.length === 0,
    items,
    previousVersions,
    previousVersionsCount,
    selectedItem,
    selectedKeyname: effectiveSelectedKeyname,
    resetDraftContent,
    setDraftContent,
    setSelectedKeyname,
  }
}

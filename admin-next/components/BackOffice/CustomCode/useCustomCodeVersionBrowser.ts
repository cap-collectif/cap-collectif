import { MutableRefObject } from 'react'
import { useIntl } from 'react-intl'
import { fetchQuery, useQueryLoader, useRelayEnvironment } from 'react-relay'
import { CustomCodeVersioningPageDiffVersionQuery } from '@relay/CustomCodeVersioningPageDiffVersionQuery.graphql'
import { CustomCodeVersioningPageVersionQuery } from '@relay/CustomCodeVersioningPageVersionQuery.graphql'
import { CustomCodeVersioningPageVersionsQuery } from '@relay/CustomCodeVersioningPageVersionsQuery.graphql'
import { mutationErrorToast } from '@shared/utils/toasts'
import {
  CUSTOM_CODE_DIFF_VERSION_QUERY,
  CUSTOM_CODE_VERSION_QUERY,
  CUSTOM_CODE_VERSIONS_QUERY,
} from './CustomCodeVersioningPage.queries'
import { ActiveCustomCodeModal, CustomCodeItem, Version } from './customCodeVersioning.types'
import { getPreviousVersion } from './customCodeVersioning.utils'

type UseCustomCodeVersionBrowserParams = {
  activeModalRef: MutableRefObject<ActiveCustomCodeModal>
  diffRequestIdRef: MutableRefObject<number>
  selectedItem: CustomCodeItem | null
  setActiveModal: (activeModal: ActiveCustomCodeModal) => void
}

export const useCustomCodeVersionBrowser = ({
  activeModalRef,
  diffRequestIdRef,
  selectedItem,
  setActiveModal,
}: UseCustomCodeVersionBrowserParams) => {
  const intl = useIntl()
  const relayEnvironment = useRelayEnvironment()
  const [viewVersionQueryReference, loadViewVersionQuery, disposeViewVersionQuery] =
    useQueryLoader<CustomCodeVersioningPageVersionQuery>(CUSTOM_CODE_VERSION_QUERY)
  const [diffVersionQueryReference, loadDiffVersionQuery, disposeDiffVersionQuery] =
    useQueryLoader<CustomCodeVersioningPageDiffVersionQuery>(CUSTOM_CODE_DIFF_VERSION_QUERY)
  const [previousDiffVersionQueryReference, loadPreviousDiffVersionQuery, disposePreviousDiffVersionQuery] =
    useQueryLoader<CustomCodeVersioningPageDiffVersionQuery>(CUSTOM_CODE_DIFF_VERSION_QUERY)

  const disposeVersionQueries = () => {
    disposeViewVersionQuery()
    disposeDiffVersionQuery()
    disposePreviousDiffVersionQuery()
  }

  const openVersionView = (version: Version) => {
    disposeVersionQueries()
    setActiveModal({ type: 'versionContent', version })
    loadViewVersionQuery({ id: version.id })
  }

  const openVersionDiff = async (version: Version) => {
    if (!selectedItem) return

    const requestId = diffRequestIdRef.current + 1
    diffRequestIdRef.current = requestId
    disposeVersionQueries()

    let previousVersion = getPreviousVersion(selectedItem.versions, version)
    const pendingModal: ActiveCustomCodeModal = { type: 'versionDiff', version, previousVersion }
    activeModalRef.current = pendingModal
    setActiveModal(pendingModal)
    loadDiffVersionQuery({ id: version.id })

    if (!previousVersion && selectedItem.hasMoreVersions) {
      try {
        const response = await fetchQuery<CustomCodeVersioningPageVersionsQuery>(
          relayEnvironment,
          CUSTOM_CODE_VERSIONS_QUERY,
          {
            keyname: selectedItem.keyname,
            offset: selectedItem.versions.length,
            limit: 1,
          },
        ).toPromise()
        previousVersion = response?.customCodeVersions[0] ?? null
      } catch {
        mutationErrorToast(intl)
      }
    }

    const currentModal = activeModalRef.current
    if (
      diffRequestIdRef.current !== requestId ||
      currentModal.type !== 'versionDiff' ||
      currentModal.version.id !== version.id
    ) {
      return
    }

    const nextModal: ActiveCustomCodeModal = { type: 'versionDiff', version, previousVersion }
    activeModalRef.current = nextModal
    setActiveModal(nextModal)
    if (previousVersion) {
      loadPreviousDiffVersionQuery({ id: previousVersion.id })
    } else {
      disposePreviousDiffVersionQuery()
    }
  }

  return {
    diffVersionQueryReference,
    previousDiffVersionQueryReference,
    viewVersionQueryReference,
    disposeVersionQueries,
    openVersionDiff,
    openVersionView,
  }
}

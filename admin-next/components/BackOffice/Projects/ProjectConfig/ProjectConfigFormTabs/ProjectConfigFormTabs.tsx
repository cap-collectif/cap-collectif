import * as React from 'react'
import { Box, Button, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { ProjectConfigFormTabs_project$key } from '@relay/ProjectConfigFormTabs_project.graphql'
import Jodit from '@components/BackOffice/Form/TextEditor/Jodit'
import debounce from '@shared/utils/debounce-promise'
import CreateCustomProjectTabMutation from '@mutations/CreateCustomProjectTabMutation'
import UpdateCustomProjectTabMutation from '@mutations/UpdateCustomProjectTabMutation'
import UpdateEventsProjectTabMutation from '@mutations/UpdateEventsProjectTabMutation'
import UpdateNewsProjectTabMutation from '@mutations/UpdateNewsProjectTabMutation'
import { EventsTabContent_tab$key } from '@relay/EventsTabContent_tab.graphql'
import { NewsTabContent_tab$key } from '@relay/NewsTabContent_tab.graphql'
import UpdatePresentationProjectTabMutation from '@mutations/UpdatePresentationProjectTabMutation'
import DeleteProjectTabMutation from '@mutations/DeleteProjectTabMutation'
import ReorderProjectTabsMutation from '@mutations/ReorderProjectTabsMutation'
import DraggableTab from './DraggableTab'
import NewsTabContent from './NewsTabContent'
import EventsTabContent from './EventsTabContent'
import { parseAsString, useQueryState } from 'nuqs'
import { SavedValues, Edge } from './types'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'

export type ProjectConfigFormTabsProps = {
  project: ProjectConfigFormTabs_project$key
}

const FRAGMENT = graphql`
  fragment ProjectConfigFormTabs_project on Project {
    id
    tabs {
      id
      slug
      type
      position
      title
      enabled
      ... on ProjectTabCustom {
        body
      }
      ... on ProjectTabPresentation {
        body
      }
      ... on ProjectTabEvents {
        events {
          id
        }
        ...EventsTabContent_tab
      }
      ... on ProjectTabNews {
        news {
          id
        }
        ...NewsTabContent_tab
      }
      ...DraggableTab_tab
    }
  }
`

const SCROLL_AMOUNT = 200

const ProjectConfigFormTabs: React.FC<ProjectConfigFormTabsProps> = ({ project: projectRef }) => {
  const intl = useIntl()
  const { setSaving } = useNavBarContext()
  const project = useFragment(FRAGMENT, projectRef)

  // Display order of tab IDs — drives drag-and-drop optimistically while project.tabs is the Relay source of truth.
  const [tabOrder, setTabOrder] = React.useState<string[]>(() =>
    [...(project.tabs ?? [])].sort((a, b) => a.position - b.position).map(t => t.id),
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialSlug = React.useMemo(
    () => [...(project.tabs ?? [])].sort((a, b) => a.position - b.position)[0]?.slug ?? '',
    [],
  )
  const [activeTabSlug, setActiveTabSlug] = useQueryState('tab', parseAsString.withDefault(initialSlug))

  const [tabContents, setTabContents] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      (project.tabs ?? []).filter(t => (t as any).body != null).map(t => [t.id, (t as any).body as string]),
    ),
  )

  // Relay fragment refs and data indexed by tab id — updates when project.tabs changes via store updaters.
  const tabMap = React.useMemo(() => Object.fromEntries((project.tabs ?? []).map(t => [t.id, t])), [project.tabs])

  const [isAddingTab, setIsAddingTab] = React.useState(false)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState)
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState])

  React.useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== 'tab') return
        const destination = location.current.dropTargets[0]
        if (!destination) return

        const sourceIndex = source.data.index as number
        const destIndex = destination.data.index as number
        const edge = extractClosestEdge(destination.data) as Edge

        let newIndex = edge === 'right' ? destIndex + 1 : destIndex
        if (sourceIndex < newIndex) newIndex -= 1
        if (sourceIndex === newIndex) return

        const reordered = [...tabOrder]
        const [moved] = reordered.splice(sourceIndex, 1)
        reordered.splice(newIndex, 0, moved)
        setTabOrder(reordered)

        ReorderProjectTabsMutation.commit({
          input: { projectId: project.id, tabIds: reordered },
        }).catch(() => {
          setTabOrder(tabOrder)
          mutationErrorToast(intl)
        })
      },
    })
  }, [tabOrder, project.id, intl])

  const activeTab = tabMap[tabOrder.find(id => tabMap[id]?.slug === activeTabSlug) ?? tabOrder[0]]
  const isWysiwyg = activeTab?.type === 'PRESENTATION' || activeTab?.type === 'CUSTOM'

  const activeTabRef = React.useRef(activeTab)
  activeTabRef.current = activeTab

  const debouncedSaveBody = React.useRef(
    debounce(async (body: string) => {
      const tab = activeTabRef.current
      if (!tab) return
      setSaving(true)
      try {
        if (tab.type === 'CUSTOM') {
          await UpdateCustomProjectTabMutation.commit({
            input: { tabId: tab.id, title: tab.title, enabled: tab.enabled, body },
          })
        } else if (tab.type === 'PRESENTATION') {
          await UpdatePresentationProjectTabMutation.commit({
            input: { tabId: tab.id, title: tab.title, enabled: tab.enabled, body },
          })
        }
      } catch {
        mutationErrorToast(intl)
      } finally {
        setSaving(false)
      }
    }, 1000),
  ).current

  const handleAddTab = async () => {
    const title = intl.formatMessage({ id: 'back.project.tab.new' }) + project.tabs?.length

    setIsAddingTab(true)
    try {
      const result = await CreateCustomProjectTabMutation.commit(
        { input: { projectId: project.id, title, enabled: false } },
        {
          updater: store => {
            const payload = store.getRootField('createCustomProjectTab')
            const newTab = payload?.getLinkedRecord('projectTab')
            if (!newTab) return
            const projectRecord = store.get(project.id)
            if (!projectRecord) return
            const currentTabs = projectRecord.getLinkedRecords('tabs') ?? []
            projectRecord.setLinkedRecords([...currentTabs, newTab], 'tabs')
          },
        },
      )
      const created = result.createCustomProjectTab?.projectTab
      const errorCode = result.createCustomProjectTab?.errorCode
      if (errorCode) {
        mutationErrorToast(intl)
        return
      }
      if (created) {
        setTabOrder(prev => [...prev, created.id])
        setActiveTabSlug(created.slug)
        requestAnimationFrame(() => {
          const el = scrollRef.current
          if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
        })
      }
    } catch {
      mutationErrorToast(intl)
    } finally {
      setIsAddingTab(false)
    }
  }

  const handleSaved = async ({ id, title, enabled }: SavedValues) => {
    const tab = tabMap[id]
    if (!tab) return
    const body = tabContents[id] ?? ''
    let newSlug: string | null | undefined
    try {
      switch (tab.type) {
        case 'CUSTOM': {
          const result = await UpdateCustomProjectTabMutation.commit({
            input: { tabId: id, title, enabled, body },
          })
          newSlug = result.updateCustomProjectTab?.projectTab?.slug
          break
        }
        case 'PRESENTATION': {
          const result = await UpdatePresentationProjectTabMutation.commit({
            input: { tabId: id, title, enabled, body },
          })
          newSlug = result.updatePresentationProjectTab?.projectTab?.slug
          break
        }
        case 'EVENTS': {
          const result = await UpdateEventsProjectTabMutation.commit({
            input: {
              tabId: id,
              title,
              enabled,
              eventItems: ((tabMap[id] as any).events ?? []).map((e: any, i: number) => ({
                id: e.id,
                position: i + 1,
              })),
            },
          })
          newSlug = result.updateEventsProjectTab?.projectTab?.slug
          break
        }
        case 'NEWS': {
          const result = await UpdateNewsProjectTabMutation.commit({
            input: {
              tabId: id,
              title,
              enabled,
              newsItems: ((tabMap[id] as any).news ?? []).map((n: any, i: number) => ({ id: n.id, position: i + 1 })),
            },
          })
          newSlug = result.updateNewsProjectTab?.projectTab?.slug
          break
        }
        default:
          break
      }
      // Relay updates project.tabs automatically via store normalization.
      // Sync active slug in case the user renamed it.
      if (tab.slug === activeTabSlug && newSlug) setActiveTabSlug(newSlug)
    } catch {
      mutationErrorToast(intl)
    }
  }

  const handleDeleted = async (tabId: string) => {
    try {
      await DeleteProjectTabMutation.commit(
        { input: { tabId } },
        {
          updater: store => {
            const projectRecord = store.get(project.id)
            if (!projectRecord) return
            const currentTabs = projectRecord.getLinkedRecords('tabs') ?? []
            projectRecord.setLinkedRecords(
              currentTabs.filter(t => t.getDataID() !== tabId),
              'tabs',
            )
          },
        },
      )
      const remaining = tabOrder.filter(id => id !== tabId)
      setTabOrder(remaining)
      if (tabMap[tabId]?.slug === activeTabSlug) {
        setActiveTabSlug(tabMap[remaining[0]]?.slug ?? null)
      }
    } catch {
      mutationErrorToast(intl)
    }
  }

  return (
    <>
      <Flex direction="column" overflow="hidden" mt={0} px="lg" pb="lg" height="100%">
        {/* Tab bar */}
        <Flex align="center" borderBottom={isWysiwyg ? '' : '1px solid'} borderColor="gray.lighter" gap="lg">
          {canScrollLeft && (
            <Box
              as="button"
              onClick={() => scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })}
              flexShrink={0}
              mr={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'gray.700',
                '&:hover': { color: 'primary.base' },
              }}
            >
              <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Sm} />
            </Box>
          )}
          <Flex
            ref={scrollRef}
            flex="1"
            align="center"
            pl="lg"
            gap="lg"
            sx={{
              overflowX: 'scroll',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {tabOrder.map((id, index) => {
              const tabRef = tabMap[id]
              if (!tabRef) return null
              return (
                <DraggableTab
                  key={id}
                  tab={tabRef}
                  index={index}
                  isActive={tabRef.slug === activeTabSlug}
                  onSelect={slug => setActiveTabSlug(slug)}
                  onSaved={handleSaved}
                  onDeleted={handleDeleted}
                />
              )
            })}
          </Flex>
          {canScrollRight && (
            <Box
              as="button"
              onClick={() => scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })}
              flexShrink={0}
              ml={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'gray.700',
                '&:hover': { color: 'primary.base' },
              }}
            >
              <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Sm} />
            </Box>
          )}
          <Button
            variant="tertiary"
            leftIcon={CapUIIcon.Add}
            onClick={handleAddTab}
            type="button"
            isLoading={isAddingTab}
            disabled={tabOrder.length >= 10 || isAddingTab}
          >
            {intl.formatMessage({ id: 'back.project.tab.add' })}
          </Button>
        </Flex>

        {/* Tab content */}
        <Box minHeight={500} flex="1">
          {isWysiwyg ? (
            <Jodit
              key={activeTab?.id}
              id={`tab-content-${activeTab?.id}`}
              value={tabContents[activeTab?.id] ?? ''}
              onChange={value => {
                setTabContents(prev => ({ ...prev, [activeTab.id]: value }))
                debouncedSaveBody(value)
              }}
              platformLanguage="fr"
            />
          ) : activeTab?.type === 'NEWS' ? (
            <NewsTabContent tab={activeTab as unknown as NewsTabContent_tab$key} />
          ) : activeTab?.type === 'EVENTS' ? (
            <EventsTabContent tab={activeTab as unknown as EventsTabContent_tab$key} />
          ) : null}
        </Box>
      </Flex>
    </>
  )
}

export default ProjectConfigFormTabs

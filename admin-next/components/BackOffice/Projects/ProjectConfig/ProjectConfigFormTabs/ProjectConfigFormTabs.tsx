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
import UpdatePresentationProjectTabMutation from '@mutations/UpdatePresentationProjectTabMutation'
import DeleteProjectTabMutation from '@mutations/DeleteProjectTabMutation'
import ReorderProjectTabsMutation from '@mutations/ReorderProjectTabsMutation'
import DraggableTab from './DraggableTab'
import NewsTabContent from './NewsTabContent'
import EventsTabContent from './EventsTabContent'
import { parseAsString, useQueryState } from 'nuqs'
import { Tab, Edge } from './types'
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
      title
      slug
      enabled
      type
      position
      ... on ProjectTabCustom {
        body
      }
      ... on ProjectTabPresentation {
        body
      }
    }
  }
`

const SCROLL_AMOUNT = 200

const ProjectConfigFormTabs: React.FC<ProjectConfigFormTabsProps> = ({ project: projectRef }) => {
  const intl = useIntl()
  const { setSaving } = useNavBarContext()
  const project = useFragment(FRAGMENT, projectRef)

  const initialTabs = React.useMemo(
    () => [...(project.tabs ?? [])].sort((a, b) => a.position - b.position) as Tab[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [tabs, setTabs] = React.useState<Tab[]>(initialTabs)
  const [activeTabSlug, setActiveTabSlug] = useQueryState('tab', parseAsString.withDefault(initialTabs[0]?.slug ?? ''))
  const [tabContents, setTabContents] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(initialTabs.filter(t => (t as any).body != null).map(t => [t.id, (t as any).body as string])),
  )

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
        const destination = location.current.dropTargets[0]
        if (!destination) return

        const sourceIndex = source.data.index as number
        const destIndex = destination.data.index as number
        const edge = extractClosestEdge(destination.data) as Edge

        let newIndex = edge === 'right' ? destIndex + 1 : destIndex
        if (sourceIndex < newIndex) newIndex -= 1
        if (sourceIndex === newIndex) return

        const reordered = [...tabs]
        const [moved] = reordered.splice(sourceIndex, 1)
        reordered.splice(newIndex, 0, moved)
        setTabs(reordered)

        ReorderProjectTabsMutation.commit({
          input: { projectId: project.id, tabIds: reordered.map(t => t.id) },
        }).catch(() => {
          setTabs(tabs)
          mutationErrorToast(intl)
        })
      },
    })
  }, [tabs, project.id, intl])

  const activeTab = tabs.find(t => t.slug === activeTabSlug) ?? tabs[0]
  const isWysiwyg = activeTab?.type === 'PRESENTATION' || activeTab?.type === 'CUSTOM'

  const activeTabRef = React.useRef(activeTab)
  activeTabRef.current = activeTab

  const debouncedSaveBody = React.useRef(
    debounce(async (_tab: Tab, body: string) => {
      const tab = activeTabRef.current
      if (!tab || tab.id.startsWith('temp-')) return
      setSaving(true)
      try {
        if (tab.type === 'CUSTOM') {
          await UpdateCustomProjectTabMutation.commit({
            input: { tabId: tab.id, title: tab.title, slug: tab.slug, enabled: tab.enabled, body },
          })
        } else if (tab.type === 'PRESENTATION') {
          await UpdatePresentationProjectTabMutation.commit({
            input: { tabId: tab.id, title: tab.title, slug: tab.slug, enabled: tab.enabled, body },
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
    const title = intl.formatMessage({ id: 'back.project.tab.new' })
    const baseSlug = 'nouvel-onglet'
    const existingSlugs = new Set(tabs.map(t => t.slug))
    let slug = baseSlug
    let i = 2
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${i++}`
    }

    const tempId = `temp-${Date.now()}`
    const tempTab: Tab = {
      id: tempId,
      title,
      slug,
      enabled: false,
      type: 'CUSTOM',
      position: tabs.length,
    }
    setTabs(prev => [...prev, tempTab])
    setActiveTabSlug(slug)

    try {
      const result = await CreateCustomProjectTabMutation.commit({
        input: { projectId: project.id, title, slug, enabled: false },
      })
      const created = result.createCustomProjectTab?.projectTab
      if (created) {
        setTabs(prev => prev.map(t => (t.id === tempId ? { ...t, id: created.id } : t)))
        setActiveTabSlug(created.slug)
      }
    } catch {
      setTabs(prev => prev.filter(t => t.id !== tempId))
      setActiveTabSlug(tabs[0]?.slug ?? null)
      mutationErrorToast(intl)
    }
  }

  const handleSaved = async (updated: Tab) => {
    const body = tabContents[updated.id] ?? ''
    try {
      switch (updated.type) {
        case 'CUSTOM':
          await UpdateCustomProjectTabMutation.commit({
            input: { tabId: updated.id, title: updated.title, slug: updated.slug, enabled: updated.enabled, body },
          })
          break
        case 'PRESENTATION':
          await UpdatePresentationProjectTabMutation.commit({
            input: { tabId: updated.id, title: updated.title, slug: updated.slug, enabled: updated.enabled, body },
          })
          break
        case 'EVENTS':
          await UpdateEventsProjectTabMutation.commit({
            input: { tabId: updated.id, title: updated.title, slug: updated.slug, enabled: updated.enabled },
          })
          break
        case 'NEWS':
          await UpdateNewsProjectTabMutation.commit({
            input: { tabId: updated.id, title: updated.title, slug: updated.slug, enabled: updated.enabled },
          })
          break
        default:
          break
      }
      setTabs(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch {
      mutationErrorToast(intl)
    }
  }

  const handleDeleted = async (tabId: string) => {
    try {
      await DeleteProjectTabMutation.commit({ input: { tabId } })
      const remaining = tabs.filter(t => t.id !== tabId)
      setTabs(remaining)
      setActiveTabSlug(remaining[0]?.slug ?? null)
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
            {tabs.map((tab, index) => (
              <DraggableTab
                key={tab.id}
                tab={tab}
                index={index}
                isActive={tab.slug === activeTabSlug}
                onSelect={slug => setActiveTabSlug(slug)}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
              />
            ))}
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
          <Button variant="tertiary" leftIcon={CapUIIcon.Add} onClick={handleAddTab} type="button">
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
                debouncedSaveBody(activeTab, value)
              }}
              platformLanguage="fr"
            />
          ) : activeTab?.type === 'NEWS' ? (
            <NewsTabContent />
          ) : activeTab?.type === 'EVENTS' ? (
            <EventsTabContent />
          ) : null}
        </Box>
      </Flex>
    </>
  )
}

export default ProjectConfigFormTabs

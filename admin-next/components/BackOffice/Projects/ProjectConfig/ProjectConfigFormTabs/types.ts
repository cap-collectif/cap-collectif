import { ProjectConfigFormTabs_project$data } from '@relay/ProjectConfigFormTabs_project.graphql'
import { EditTabModal_tab$data } from '@relay/EditTabModal_tab.graphql'

export type { ProjectTabType } from '@relay/EditTabModal_tab.graphql'

export type TabState = Pick<ProjectConfigFormTabs_project$data['tabs'][number], 'id' | 'slug' | 'type' | 'position' | 'title'>

export type SavedValues = Pick<EditTabModal_tab$data, 'id' | 'title' | 'enabled'>

export type Edge = 'left' | 'right'

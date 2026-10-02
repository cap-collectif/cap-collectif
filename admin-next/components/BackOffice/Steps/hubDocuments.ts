const HUB_DOCUMENTS_PROJECT_TYPES = ['public-inquiry', 'public-consultation']

const isHubDocumentsProject = (projectTypeSlug: string | null | undefined): boolean =>
  HUB_DOCUMENTS_PROJECT_TYPES.includes(projectTypeSlug ?? '')

export { isHubDocumentsProject }

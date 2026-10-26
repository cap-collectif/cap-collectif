import React from 'react'
import { render, screen } from '@testing-library/react'
import { useFragment } from 'react-relay'
import VoteStepProjectHero from './VoteStepProjectHero'

const formatMessage = jest.fn(({ id }) => id)

jest.mock('@cap-collectif/ui', () => {
  const Element = ({ as: Component = 'div', children, ...props }) => <Component {...props}>{children}</Component>
  const Modal = () => null
  Modal.Header = Element
  Modal.Body = Element
  Modal.Footer = Element

  return {
    Avatar: () => null,
    Box: Element,
    Button: Element,
    Flex: Element,
    Heading: Element,
    Icon: () => null,
    Modal,
    Tag: Element,
    Text: Element,
    Tooltip: ({ children }) => <>{children}</>,
    CapUIIcon: { FolderO: 'FolderO', Lock: 'Lock', PinO: 'PinO' },
    CapUIFontSize: { Caption: 'Caption', BodySmall: 'BodySmall', Headline: 'Headline', DisplayMedium: 'DisplayMedium' },
    CapUILineHeight: { S: 'S' },
    CapUIIconSize: { Md: 'Md' },
    CapUIModalSize: { Md: 'Md', Lg: 'Lg' },
  }
})
jest.mock('react-intl', () => ({ useIntl: () => ({ formatMessage }) }))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useFragment: jest.fn() }))
jest.mock('@components/BackOffice/AppProvider/App.context', () => ({
  useAppContext: () => ({ siteColors: { primaryColor: '#123456' } }),
}))
jest.mock('@components/FrontOffice/SocialNetworks/ShareButtons', () => ({ url, title }) => (
  <div data-testid="share-buttons">{`${url}:${title}`}</div>
))
jest.mock('@shared/projectFrise/ProjectStepTabs', () => () => <div data-testid="project-step-tabs" />)
jest.mock('@shared/projectFrise/SVG/Play', () => () => null)
jest.mock('@shared/ui/Image', () => ({ getSrcSet: url => ({ src: url }) }))
jest.mock('@shared/hooks/useFeatureFlag', () => () => false)
jest.mock('@shared/hooks/useIsMobile', () => () => false)
jest.mock('@shared/sections/carrousel/DefaultProjectImage', () => () => <div data-testid="default-cover" />)
jest.mock('./VoteStepProjectHeroStats', () => () => <div data-testid="hero-stats" />)

const project = {
  title: 'Projet &amp; citoyen',
  url: '/project/projet-citoyen',
  cover: { url: 'https://example.test/cover.jpg', name: 'Cover' },
  video: null,
  archived: false,
  visibility: 'PUBLIC',
  authors: [{ __typename: 'User', id: 'author-id', url: '/profile/alice', username: 'Alice', avatarUrl: null }],
  themes: [],
  districts: { totalCount: 0, edges: [] },
  restrictedViewers: { totalUserCount: 0, edges: [] },
}

const renderHero = (projectData: typeof project | null) => {
  ;(useFragment as jest.Mock).mockReturnValue({
    id: 'step-id',
    state: 'OPENED',
    timeRange: { startAt: null, endAt: null },
    project: projectData,
  })
  return render(<VoteStepProjectHero step={{} as any} />)
}

describe('VoteStepProjectHero', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not render when the step has no project', () => {
    const { container } = renderHero(null)

    expect(container.innerHTML).toBe('')
  })

  it('renders the project identity, cover, sharing and navigation', () => {
    renderHero(project)

    expect(screen.getByRole('heading', { name: 'Projet & citoyen' })).toBeTruthy()
    expect(document.querySelector('img')?.getAttribute('src')).toBe('https://example.test/cover.jpg')
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByTestId('hero-stats')).toBeTruthy()
    expect(screen.getByTestId('share-buttons').textContent).toBe('/project/projet-citoyen:Projet & citoyen')
    expect(screen.getByTestId('project-step-tabs')).toBeTruthy()
    expect(screen.queryByTestId('default-cover')).toBeNull()
  })

  it('shows the fallback cover and archived status when there is no image', () => {
    renderHero({ ...project, cover: null, archived: true })

    expect(screen.getByTestId('default-cover')).toBeTruthy()
    expect(screen.getByText('global-archived')).toBeTruthy()
  })

  it('shows restricted access instead of the archived status for non-public projects', () => {
    renderHero({ ...project, archived: true, visibility: 'CUSTOM' })

    expect(screen.getByText('restrictedaccess')).toBeTruthy()
    expect(screen.queryByText('global-archived')).toBeNull()
  })
})

/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { createMockEnvironment } from 'relay-test-utils'
import ProjectHeaderThemeList, { ThemesButton } from '~/components/Project/ProjectHeaderThemeList'
import MockProviders, { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from '~/testUtils'

describe('<ProjectHeaderThemeList />', () => {
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
  })
  const themes = [
    {
      title: 'Immobilier',
      url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
      id: 'theme1',
    },
    {
      title: 'Justice',
      url: 'https://capco.dev/themes/justice?_locale=fr-FR',
      id: 'theme2',
    },
    {
      title: 'Transport',
      url: 'https://capco.dev/themes/transport?_locale=fr-FR',
      id: 'theme3',
    },
    {
      title: 'Thème vide',
      url: 'https://capco.dev/themes/theme-vide?_locale=fr-FR',
      id: 'theme4',
    },
  ]
  const environment = createMockEnvironment()

  const TestComponent = props => (
    <MockProviders store={{}} useCapUIProvider>
      <RelaySuspensFragmentTest
        store={{
          default: {
            parameters: {
              'color.link.hover': '#546E7A',
            },
          },
        }}
        environment={environment}
      >
        <ProjectHeaderThemeList {...props} />
      </RelaySuspensFragmentTest>
    </MockProviders>
  )

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent themes={themes} breakingNumber={2} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with the display of modal', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent themes={themes} breakingNumber={2} />)
    act(() => {
      wrapper.root.findByType(ThemesButton).props.onClick()
    })
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when project is archived', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent themes={themes} breakingNumber={2} isArchived />)
    expect(wrapper).toMatchSnapshot()
  })
})

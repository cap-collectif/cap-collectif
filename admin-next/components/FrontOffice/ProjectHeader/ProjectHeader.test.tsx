/* eslint-env jest */
import ReactTestRenderer from 'react-test-renderer'
import ProjectHeader from './ProjectHeader'
import { MockProviders } from 'tests/testUtils'

jest.mock('@shared/hooks/useFeatureFlag')
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname() {
    return mockUsePathname()
  },
}))

describe('<ProjectHeader />', () => {
  it('should render correctly', () => {
    const project = {
      title: 'Food project',
      authors: [
        {
          id: 'VXNlcjp1c2VyVmluY2VudA==',
          username: 'Vince',
          avatarUrl: 'https://127.0.0.1/media/default/0001/01/providerReference46.jpg',
        },
      ],
      themes: [{ id: 'theme1', title: 'Super theme' }],
      districts: {
        edges: [{ node: { id: 'district1', name: 'Le tieks' } }],
      },
    }

    mockUsePathname.mockImplementation(() => '/project/food-project/step/mon-etape')
    const wrapper = ReactTestRenderer.create(
      <MockProviders>
        <ProjectHeader projectSlug="food-project" project={project} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})

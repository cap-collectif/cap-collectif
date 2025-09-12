/* eslint-env jest */
import { render } from '@testing-library/react'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, MockProviders } from 'tests/testUtils'
import Carrousel from './Carrousel'
import WhatsNewMobile from './WhatsNewMobile'

const item = {
  title: 'Item1',
  position: 0,
  description: 'Lorem ipsum',
  isDisplayed: true,
  buttonLabel: 'Voir +',
  type: 'EVENT',
  redirectLink: '/event/mon-event',
  image: {
    id: 'img1',
    url: '/media/img1.png',
  },
  startAt: null,
  endAt: null,
}

describe('<Carrousel />', () => {
  let environment
  let TestComponent
  const defaultMockResolvers = {
    CarrouselConfiguration: () => ({
      id: 'carrouselId1',
      title: 'Title',
      isLegendEnabledOnImage: true,
      carrouselElements: {
        edges: [
          {
            node: item,
          },
        ],
      },
    }),
  }

  beforeEach(() => {
    environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment}>
        <Carrousel {...props} />
      </RelaySuspensFragmentTest>
    )
  })
  it('renders correctly with a carrousel', () => {
    const { asFragment } = render(<TestComponent type="carrousel" />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders correctly with a carrouselHighlighted', () => {
    const { asFragment } = render(<TestComponent type="carrouselHighlighted" />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders correctly with a carrouselHighlighted on mobile', () => {
    const { asFragment } = render(
      <MockProviders>
        <WhatsNewMobile title="TitleMobile" items={[item]} />
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})

/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
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
  let testComponentTree
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
    testComponentTree = ReactTestRenderer.create(<TestComponent type="carrousel" />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders correctly with a carrouselHighlighted', () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent type="carrouselHighlighted" />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('renders correctly with a carrouselHighlighted on mobile', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <WhatsNewMobile title="TitleMobile" items={[item]} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})

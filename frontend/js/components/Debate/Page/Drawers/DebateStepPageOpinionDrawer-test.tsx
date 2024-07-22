/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'
import type { DebateStepPageOpinionDrawerTestQuery } from '~relay/DebateStepPageOpinionDrawerTestQuery.graphql'
import DebateStepPageOpinionDrawer from './DebateStepPageOpinionDrawer'

describe('<DebateStepPageOpinionDrawer />', () => {
  let environment
  let testComponentTree
  let TestComponent
  let onClose
  const defaultMockResolvers = {
    DebateOpinion: () => ({
      title: 'Je suis pour',
      body: `Oui, ma gâtée, RS4 gris nardo, bien sûr qu'ils m'ont raté (gros, bien sûr)
    Soleil dans la bulle, sur le Prado, Shifter pro' (Shifter pro')
    Contre-sens (ah), ma chérie, tu es à contre-sens
    Puta, où tu étais quand j'mettais des sept euros d'essence (hein)`,
      type: 'FOR',
    }),
    User: () => ({
      username: 'Agui le penseur',
      media: {
        url: '<media-url>',
      },
      biography: 'Jsuis né dans les favela au brésil',
    }),
  }
  const query = graphql`
    query DebateStepPageOpinionDrawerTestQuery($id: ID = "<default>") @relay_test_operation {
      opinion: node(id: $id) {
        ...DebateStepPageOpinionDrawer_opinion
      }
    }
  `
  afterEach(() => {
    clearSupportForPortals()
  })
  beforeEach(() => {
    addsSupportForPortals()
    environment = createMockEnvironment()
    onClose = jest.fn()

    const TestRenderer = props => {
      const data = useLazyLoadQuery<DebateStepPageOpinionDrawerTestQuery>(query, {})
      if (!data.opinion) return null
      return <DebateStepPageOpinionDrawer opinion={data.opinion} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment} useCapUIProvider>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render a FOR opinion when open', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render an AGAINST opinion when open', async () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        DebateOpinion: () => ({
          title: 'Je suis contre',
          body: `Oui, ma gâtée, RS4 gris nardo, bien sûr qu'ils m'ont raté (gros, bien sûr)
    Soleil dans la bulle, sur le Prado, Shifter pro' (Shifter pro')
    Contre-sens (ah), ma chérie, tu es à contre-sens
    Puta, où tu étais quand j'mettais des sept euros d'essence (hein)`,
          type: 'AGAINST',
        }),
      }),
    )
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render nothing when closed', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen={false} onClose={onClose} />)

    expect(testComponentTree.toJSON().props.className.includes('toasts-container')).toBe(true)
    expect(testComponentTree.toJSON().children).toBeNull()
  })
})

/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelaySuspensFragmentTest, addsSupportForPortals, clearSupportForPortals } from '~/testUtils'
import type { DebateStepPageLinkedArticlesDrawerTestQuery } from '~relay/DebateStepPageLinkedArticlesDrawerTestQuery.graphql'
import DebateStepPageLinkedArticlesDrawer from './DebateStepPageLinkedArticlesDrawer'

describe('<DebateStepPageLinkedArticlesDrawer />', () => {
  let environment
  let testComponentTree
  let TestComponent
  let onClose
  const defaultMockResolvers = {
    Debate: () => ({
      articles: {
        edges: [
          {
            node: {
              coverUrl:
                'https://www.generationlibre.eu/wp-content/uploads/2021/03/markus-winkler-eNyIi0oS7P4-unsplash-e1616584197949-1024x576.jpg',
              id: 'RGViYXRlQXJ0aWNsZTozNDExZDhhZS05MzlhLTExZWItYjNjNy1kZTFjMTAxMmUwMDE=',
              origin: 'GenerationLibre',
              publishedAt: null,
              title: '« Non au passeport vaccinal » Gaspard Koenig - GenerationLibre',
              url: 'https://www.generationlibre.eu/medias/non-au-passeport-vaccinal-gaspard-koenig/',
            },
          },
          {
            node: {
              coverUrl:
                'http://media1.woopic.com/api/v1/images/1039%2Fmulti%2F3ukfr%2Fmacron-ceux-qui-disent-on-aura-un-vaccin-en-mars-ou-avril-prochain-vous-trompent%7Cfzqpqs-H.jpg?format=470x264&facedetect=1&quality=85',
              id: 'RGViYXRlQXJ0aWNsZTozNDEyMDUyMy05MzlhLTExZWItYjNjNy1kZTFjMTAxMmUwMDE=',
              origin: 'Orange Actualités',
              publishedAt: '2021-04-02 10:15:34',
              title: 'Macron: ceux qui disent "on aura un vaccin en mars ou avril prochain, vous trompent"',
              url: 'https://actu.orange.fr/societe/videos/macron-ceux-qui-disent-on-aura-un-vaccin-en-mars-ou-avril-prochain-vous-trompent-CNT000001tKjH0.html',
            },
          },
          {
            node: {
              coverUrl:
                'https://www.francetvinfo.fr/pictures/XG0eIHnEfHnOuHCFy2xOQse_Um4/1500x843/2021/03/09/phplNpe9r.jpg',
              id: 'RGViYXRlQXJ0aWNsZTpiZjU2YWY1NC05Mzk1LTExZWItYjNjNy1kZTFjMTAxMmUwMDE=',
              origin: 'Franceinfo',
              publishedAt: '2021-03-11 07:00:45',
              title:
                'Covid-19 : passeport vaccinal, "pass sanitaire", "certificat vert"... L\'article à lire pour comprendre le débat qui agite la France et l\'Europe',
              url: 'https://www.francetvinfo.fr/sante/maladie/coronavirus/vaccin/covid-19-passeport-vaccinal-pass-sanitaire-certificat-vert-l-article-a-lire-pour-comprendre-le-debat-qui-agite-la-france-et-l-europe_4324853.html',
            },
          },
        ],
      },
    }),
  }
  const query = graphql`
    query DebateStepPageLinkedArticlesDrawerTestQuery($id: ID = "<default>") @relay_test_operation {
      step: node(id: $id) {
        ...DebateStepPageLinkedArticlesDrawer_step
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
      const data = useLazyLoadQuery<DebateStepPageLinkedArticlesDrawerTestQuery>(query, {})
      if (!data.step) return null
      return <DebateStepPageLinkedArticlesDrawer step={data.step} {...props} />
    }

    TestComponent = props => (
      <RelaySuspensFragmentTest environment={environment} useCapUIProvider>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
    )

    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, defaultMockResolvers))
  })
  it('should render when open', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen onClose={onClose} />)
    expect(testComponentTree).toMatchSnapshot()
  })
  it('should render nothing when empty', async () => {
    const emptyMockResolvers = {
      Debate: () => ({
        articles: {
          edges: [],
        },
      }),
    }
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, emptyMockResolvers))
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen={false} onClose={onClose} />)
    // Length 6 for the toast container
    expect(testComponentTree.toJSON()).toHaveLength(6)
  })
  it('should render nothing when API could not load articles', async () => {
    const erroredMockResolvers = {
      Debate: () => ({
        articles: {
          edges: null,
        },
      }),
    }
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, erroredMockResolvers))
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen={false} onClose={onClose} />)
    expect(testComponentTree.toJSON()).toHaveLength(6)
  })
  it('should render nothing when closed', async () => {
    testComponentTree = ReactTestRenderer.create(<TestComponent isOpen={false} onClose={onClose} />)
    expect(testComponentTree.toJSON()).toHaveLength(6)
  })
})

// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { RelaySuspensFragmentTest } from '~/testUtils';
import type { DebateOpinionTestQuery } from '~relay/DebateOpinionTestQuery.graphql';
import DebateOpinion from './DebateOpinion';

describe('<DebateOpinion />', () => {
  let environment;
  let testComponentTree;
  let MobileTestComponent;
  let DesktopTestComponent;

  const query = graphql`
    query DebateOpinionTestQuery($id: ID = "<default>", $isMobile: Boolean!) @relay_test_operation {
      opinion: node(id: $id) {
        ...DebateOpinion_opinion @arguments(isMobile: $isMobile)
      }
    }
  `;

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
      biography: 'Jsuis né dans les favela au brésil',
    }),
  };

  beforeEach(() => {
    environment = createMockEnvironment();
    const desktopVariables = { isMobile: false };
    const mobileVariables = { isMobile: true };
    const TestRenderer = ({ componentProps, queryVariables }) => {
      const data = useLazyLoadQuery<DebateOpinionTestQuery>(query, queryVariables);
      if (!data.opinion) return null;
      return <DebateOpinion opinion={data.opinion} {...componentProps} />;
    };
    MobileTestComponent = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={mobileVariables} />
      </RelaySuspensFragmentTest>
    );
    DesktopTestComponent = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={desktopVariables} />
      </RelaySuspensFragmentTest>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  describe('when the query is on desktop', () => {
    it('should render a FOR opinion', async () => {
      testComponentTree = ReactTestRenderer.create(<DesktopTestComponent />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render an AGAINST opinion', async () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          ...defaultMockResolvers,
          DebateOpinion: () => ({
            title: 'Je suis contre',
            body: `Parce que c'est comme ça.`,
            type: 'AGAINST',
          }),
        }),
      );

      testComponentTree = ReactTestRenderer.create(<DesktopTestComponent />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render with a read more link', () => {
      testComponentTree = ReactTestRenderer.create(<DesktopTestComponent readMore />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });

  describe('when the query is on mobile', () => {
    it('should render a FOR opinion', () => {
      testComponentTree = ReactTestRenderer.create(<MobileTestComponent isMobile />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render with a read more link', () => {
      testComponentTree = ReactTestRenderer.create(<MobileTestComponent isMobile readMore />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});

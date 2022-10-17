// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import OpinionFollowButton from './OpinionFollowButton';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { OpinionFollowButtonTestQuery } from '~relay/OpinionFollowButtonTestQuery.graphql';

describe('<OpinionFollowButton />', () => {
  let environment;
  let testComponentTree;
  let TestOpinionFollowButton;

  const query = graphql`
    query OpinionFollowButtonTestQuery($id: ID = "<default>", $isAuthenticated: Boolean!)
    @relay_test_operation {
      opinion: node(id: $id) {
        ...OpinionFollowButton_opinion @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `;

  const defaultMockResolvers = {
    Opinion: () => ({
      id: 'opinion1',
      viewerIsFollowing: true,
      viewerFollowingConfiguration: 'MINIMAL',
    }),
  };
  const secondaryMockResolvers = {
    Opinion: () => ({
      id: 'opinion1',
      viewerIsFollowing: false,
      viewerFollowingConfiguration: null,
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {
      id: 'opinion1',
      isAuthenticated: true,
    };

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<OpinionFollowButtonTestQuery>(query, variables);
      if (!data.opinion) return null;
      return <OpinionFollowButton opinion={data.opinion} {...componentProps} />;
    };

    TestOpinionFollowButton = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
      </RelaySuspensFragmentTest>
    );

    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });
  afterEach(() => {
    clearSupportForPortals();
  });
  describe('<TestOpinionFollowButton />', () => {
    it('should render a button to unfollow a proposal when viewer is following ', () => {
      testComponentTree = ReactTestRenderer.create(<TestOpinionFollowButton />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render a button to follow a proposal when viewer is not following.', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, secondaryMockResolvers),
      );

      testComponentTree = ReactTestRenderer.create(<TestOpinionFollowButton />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render correctly when not authenticated', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, null),
      );
      testComponentTree = ReactTestRenderer.create(<TestOpinionFollowButton />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});

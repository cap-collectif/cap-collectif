// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import ModalPostDeleteConfirmation from './ModalPostDeleteConfirmation';
import type { ModalPostDeleteConfirmationTestQuery } from '~relay/ModalPostDeleteConfirmationTestQuery.graphql';

describe('<ModalConfirmationDelete />', () => {
  let environment;
  let testComponentTree;
  let TestModalConfirmationDelete;

  const query = graphql`
    query ModalPostDeleteConfirmationTestQuery($id: ID = "<default>") @relay_test_operation {
      post: node(id: $id) {
        ...ModalPostDeleteConfirmation_post
      }
    }
  `;

  const defaultMockResolvers = {
    Post: () => ({
      id: 'UG9zdDpwb3N0MTI=',
      title: 'Post FR 12',
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ModalPostDeleteConfirmationTestQuery>(query, variables);

      if (data?.post) {
        return <ModalPostDeleteConfirmation post={data?.post} {...componentProps} />;
      }

      return null;
    };

    TestModalConfirmationDelete = componentProps => (
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

  describe('<TestModalConfirmationDelete />', () => {
    it('should render correctly', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalConfirmationDelete />);
      expect(testComponentTree).toMatchSnapshot();
    });

    it('should render modal open', () => {
      testComponentTree = ReactTestRenderer.create(<TestModalConfirmationDelete />);
      const fakeEvent = {};
      testComponentTree.root.findByType('button').props.onClick(fakeEvent);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});

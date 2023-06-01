// @flow
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import MockProviders, { RelaySuspensFragmentTest } from '~/testUtils';
import VotesList from './VotesList';

describe('<VotesList />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestVotesList: any;

  beforeEach(() => {
    environment = createMockEnvironment();

    const TestRenderer = ({ showImages }) => {
      return <VotesList stepId="<default>" showImages={showImages} />;
    };

    TestVotesList = ({ showImages }) => (
      <RelaySuspensFragmentTest environment={environment}>
        <MockProviders useCapUIProvider>
          <TestRenderer showImages={showImages} />
        </MockProviders>
      </RelaySuspensFragmentTest>
    );
  });

  describe('<TestVotesList />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation),
      );
      testComponentTree = ReactTestRenderer.create(<TestVotesList showImages />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});

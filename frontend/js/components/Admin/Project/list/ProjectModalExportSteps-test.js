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
import ProjectModalExportSteps from './ProjectModalExportSteps';
import type { ProjectModalExportStepsTestQuery } from '~relay/ProjectModalExportStepsTestQuery.graphql';
import Menu from '~ds/Menu/Menu';
import { intlMock } from '~/mocks';

describe('<ProjectModalExportSteps />', () => {
  let environment;
  let testComponentTree;
  let TestModalConfirmationDelete;

  const query = graphql`
    query ProjectModalExportStepsTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectModalExportSteps_project
      }
    }
  `;

  const defaultMockResolvers = {
    Project: () => ({
      id: 'UHJvamVjdDpwcm9qZWN0SWRmMw==',
      title: 'Budget Participatif IdF 3',
      contributions: {
        totalCount: 5,
      },
    }),
  };

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const queryVariables = {};
    const intl = intlMock;

    const TestRenderer = ({ componentProps, queryVariables: variables }) => {
      const data = useLazyLoadQuery<ProjectModalExportStepsTestQuery>(query, variables);

      if (data?.project) {
        return <ProjectModalExportSteps intl={intl} project={data?.project} {...componentProps} />;
      }

      return null;
    };

    TestModalConfirmationDelete = componentProps => (
      <RelaySuspensFragmentTest environment={environment}>
        <Menu>
          <Menu.List>
            <TestRenderer componentProps={componentProps} queryVariables={queryVariables} />
          </Menu.List>
        </Menu>
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
  });
});

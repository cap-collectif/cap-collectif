// @flow
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { ProjectStepHeaderTestQuery } from '~relay/ProjectStepHeaderTestQuery.graphql';
import { RelaySuspensFragmentTest } from '~/testUtils';
import ProjectStepHeader from './ProjectStepHeader';

describe('<ProjectStepHeader />', () => {
  let environment: any;
  let testComponentTree: any;
  let TestProjectStepHeader: any;

  const query = graphql`
    query ProjectStepHeaderTestQuery @relay_test_operation {
      voteStep: node(id: "<default>") {
        ... on SelectionStep {
          title
          project {
            title
            votes {
              totalCount
            }
            contributors {
              totalCount
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;

  beforeEach(() => {
    environment = createMockEnvironment();

    const TestRenderer = () => {
      const data = useLazyLoadQuery<ProjectStepHeaderTestQuery>(query, {});
      if (data) {
        return <ProjectStepHeader stepId="<default>" />;
      }

      return null;
    };

    TestProjectStepHeader = () => (
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer />
      </RelaySuspensFragmentTest>
    );
  });

  describe('<TestProjectStepHeader />', () => {
    it('should render correctly', () => {
      environment.mock.queueOperationResolver(operation =>
        MockPayloadGenerator.generate(operation, {
          Node: () => ({
            title: 'Votez pour vos projets favoris',
            project: {
              title: 'Budget participatif 2022',
              votes: {
                totalCount: 147529,
              },
              contributors: {
                totalCount: 51472,
              },
              contributions: {
                totalCount: 8488,
              },
            },
          }),
        }),
      );
      testComponentTree = ReactTestRenderer.create(<TestProjectStepHeader />);
      expect(testComponentTree).toMatchSnapshot();
    });
  });
});

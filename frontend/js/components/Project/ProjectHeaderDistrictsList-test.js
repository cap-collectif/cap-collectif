// @flow
/* eslint-env jest */
import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ReactTestRenderer, { act } from 'react-test-renderer';
import ProjectHeaderDistrictsList, { DistrictsButton } from './ProjectHeaderDistrictsList';
import MockProviders, {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ProjectHeaderDistrictsListTestQuery } from '~relay/ProjectHeaderDistrictsListTestQuery.graphql';

describe('<ProjectHeaderDistrictsList />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    Project: () => ({
      districts: {
        totalCount: 5,
        edges: [
          { node: { name: 'zone 1' } },
          { node: { name: 'zone 2' } },
          { node: { name: 'zone 3' } },
          { node: { name: 'zone 4' } },
          { node: { name: 'zone 5' } },
        ],
      },
      archived: false,
    }),
  };

  const query = graphql`
    query ProjectHeaderDistrictsListTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderDistrictsList_project
      }
    }
  `;
  afterEach(() => {
    clearSupportForPortals();
  });

  beforeEach(() => {
    addsSupportForPortals();
    environment = createMockEnvironment();
    const TestRenderer = props => {
      const data = useLazyLoadQuery<ProjectHeaderDistrictsListTestQuery>(query, {});
      if (!data.project) return null;
      return <ProjectHeaderDistrictsList project={data.project} breakingNumber={3} {...props} />;
    };
    TestComponent = props => (
      <MockProviders store={{}} useCapUIProvider>
        <RelaySuspensFragmentTest
          store={{
            default: { parameters: { 'color.link.hover': '#546E7A' } },
          }}
          environment={environment}>
          <TestRenderer {...props} />
        </RelaySuspensFragmentTest>
      </MockProviders>
    );
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, defaultMockResolvers),
    );
  });

  it('should render correctly', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with the display of modal', () => {
    const wrapper = ReactTestRenderer.create(<TestComponent />);

    act(() => {
      wrapper.root.findByType(DistrictsButton).props.onClick();
    });
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly when project is archived', () => {
    environment.mock.queueOperationResolver(operation =>
      MockPayloadGenerator.generate(operation, {
        ...defaultMockResolvers,
        Project: () => ({ ...defaultMockResolvers.Project(), archived: true }),
      }),
    );
    const wrapper = ReactTestRenderer.create(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});

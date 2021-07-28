// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import ProjectHeaderThemeList, { ThemesButton } from '~/components/Project/ProjectHeaderThemeList';
import {
  addsSupportForPortals,
  clearSupportForPortals,
  RelaySuspensFragmentTest,
} from '~/testUtils';
import type { ProjectHeaderThemeListTestQuery } from '~relay/ProjectHeaderThemeListTestQuery.graphql';

describe('<ProjectHeaderThemeList />', () => {
  let environment;
  let TestComponent;

  const defaultMockResolvers = {
    Project: () => ({
      themes: [
        {
          title: 'Immobilier',
          url: 'https://capco.dev/themes/immobilier?_locale=fr-FR',
          id: 'theme1',
        },
        {
          title: 'Justice',
          url: 'https://capco.dev/themes/justice?_locale=fr-FR',
          id: 'theme2',
        },
        {
          title: 'Transport',
          url: 'https://capco.dev/themes/transport?_locale=fr-FR',
          id: 'theme3',
        },
        {
          title: 'Thème vide',
          url: 'https://capco.dev/themes/theme-vide?_locale=fr-FR',
          id: 'theme4',
        },
      ],
      archived: false,
    }),
  };
  const query = graphql`
    query ProjectHeaderThemeListTestQuery($id: ID = "<default>") @relay_test_operation {
      project: node(id: $id) {
        ...ProjectHeaderThemeList_project
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
      const data = useLazyLoadQuery<ProjectHeaderThemeListTestQuery>(query, {});
      if (!data.project) return null;
      return <ProjectHeaderThemeList project={data.project} breakingNumber={2} {...props} />;
    };
    TestComponent = props => (
      <RelaySuspensFragmentTest
        store={{
          default: { parameters: { 'color.link.hover': '#546E7A' } },
        }}
        environment={environment}>
        <TestRenderer {...props} />
      </RelaySuspensFragmentTest>
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
      wrapper.root.findByType(ThemesButton).props.onClick();
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

// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectListFiltersContainer } from './ProjectListFiltersContainer';
import { intlMock } from '../../../../mocks';

const defaultProps = {
  district: null,
  themes: [],
  author: null,
  theme: null,
  type: null,
  intl: intlMock,
};

const defaultState = {
  projectTypes: [],
  projectAuthors: [],
  projects: { totalCount: 2 },
};

describe('<ProjectListFiltersContainer />', () => {
  it('should render correctly without filters', () => {
    const wrapper = shallow(<ProjectListFiltersContainer {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with themes', () => {
    const props = {
      ...defaultProps,
      themes: [{ id: '1', slug: 'theme1', title: 'theme 1' }],
    };
    const wrapper = shallow(<ProjectListFiltersContainer {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with projects types', () => {
    const wrapper = shallow(<ProjectListFiltersContainer {...defaultProps} />);

    wrapper.setState({
      ...defaultState,
      projectTypes: [{ id: '1', slug: 'type1', title: 'type 1' }],
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with projects authors', () => {
    const wrapper = shallow(<ProjectListFiltersContainer {...defaultProps} />);
    wrapper.setState({ ...defaultState, projectAuthors: [{ id: '1', username: 'Kaaris270' }] });

    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with projects districts', () => {
    const wrapper = shallow(<ProjectListFiltersContainer {...defaultProps} />);
    wrapper.setState({
      ...defaultState,
      projectDistricts: {
        totalCount: 1,
        edges: {
          node: { id: '1', name: 'district1' },
        },
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with no projects', () => {
    const wrapper = shallow(<ProjectListFiltersContainer {...defaultProps} />);
    wrapper.setState({
      ...defaultState,
      projects: {
        totalCount: 0,
      },
    });
    expect(wrapper).toMatchSnapshot();
  });
});

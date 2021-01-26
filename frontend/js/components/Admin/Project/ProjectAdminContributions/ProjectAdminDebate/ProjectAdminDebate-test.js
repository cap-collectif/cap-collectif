/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminDebate } from './ProjectAdminDebate';
import { $fragmentRefs, $refType } from '~/mocks';

const baseProps = {
  debate: {
    $refType,
    $fragmentRefs,
    allArguments: {
      totalCount: 3,
    },
    votes: {
      totalCount: 1,
    },
  },
  hasContributionsStep: false,
  baseUrl: 'index/',
};

const props = {
  noContributionsStep: baseProps,
  withContributionsStep: {
    ...baseProps,
    hasContributionsStep: true,
  },
};

describe('<ProjectAdminDebate />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectAdminDebate {...props.noContributionsStep} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with contributions step', () => {
    const wrapper = shallow(<ProjectAdminDebate {...props.withContributionsStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});

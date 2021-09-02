// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdmin } from './ProjectStepAdmin';
import { $fragmentRefs, $refType, formMock, intlMock } from '~/mocks';

const baseProps = {
  ...formMock,
  intl: intlMock,
  form: 'testForm',
  hasFeatureDebate: false,
  project: {
    $fragmentRefs,
    $refType,
  },
  viewerIsAdmin: true,
};

const props = {
  basic: baseProps,
  withFeatureDebate: {
    ...baseProps,
    hasFeatureDebate: true,
  },
};

describe('<ProjectStepAdmin />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without feature debate', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.withFeatureDebate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with isAdmin false', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.basic} viewerIsAdmin={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});

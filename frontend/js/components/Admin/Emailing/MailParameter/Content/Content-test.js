// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ContentPage } from './index';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  disabled: false,
  showError: false,
  emailingCampaign: {
    $refType,
    $fragmentRefs,
  },
};

const props = {
  basic: baseProps,
  disabled: {
    ...baseProps,
    disabled: true,
  },
  withError: {
    ...baseProps,
    showError: true,
  },
};

describe('<ContentPage />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<ContentPage {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when disabled', () => {
    const wrapper = shallow(<ContentPage {...props.disabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when error', () => {
    const wrapper = shallow(<ContentPage {...props.withError} />);
    expect(wrapper).toMatchSnapshot();
  });
});

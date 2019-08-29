// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListPublicSSO } from './ListPublicSSO';
import { features } from '../../../redux/modules/default';

describe('<ListPublicSSO />', () => {
  const props = {
    features,
    onToggle: jest.fn(),
  };

  it('renders correctly without France Connect', () => {
    const wrapper = shallow(<ListPublicSSO {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all element with France Connect', () => {
    const wrapper = shallow(
      <ListPublicSSO features={{ ...features, login_franceconnect: true }} onToggle={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

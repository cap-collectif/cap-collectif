// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import 'jest-styled-components';
import { Container, Loader } from './Loader';

describe('<Loader />', () => {
  it('renders LoaderContainer', () => {
    const wrapper = shallow(<Container />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders Loader', () => {
    const wrapper = shallow(<Loader />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders nothing', () => {
    const wrapper = shallow(<Loader show={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});

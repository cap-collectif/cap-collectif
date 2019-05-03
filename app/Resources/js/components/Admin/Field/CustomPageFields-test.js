// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import CustomPageFields from './CustomPageFields';

describe('<CustomPageFields />', () => {
  const defaultProps = {
    customcode: 'string',
    picto: { id: 'Uuid', name: 'string', url: 'string' },
    metadescription: 'string',
  };

  it('renders correctly', () => {
    const wrapper = shallow(<CustomPageFields {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with no props', () => {
    const wrapper = shallow(<CustomPageFields />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with null picto', () => {
    const props = {
      ...defaultProps,
      picto: null,
    };
    const wrapper = shallow(<CustomPageFields {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

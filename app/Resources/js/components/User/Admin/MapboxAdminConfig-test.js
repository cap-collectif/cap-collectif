/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { MapboxAdminConfig } from './MapboxAdminConfig';
import { formMock, $fragmentRefs } from '../../../mocks';

describe('<MapboxAdminConfig/>', () => {
  it('should render', () => {
    const props = {
      ...formMock,
      mapToken: {
        mapToken: {
          $fragmentRefs,
        },
      },
    };
    const wrapper = shallow(<MapboxAdminConfig {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with styles', () => {
    const props = {
      ...formMock,
      mapToken: {
        mapToken: {
          $fragmentRefs,
        },
      },
    };
    const wrapper = shallow(<MapboxAdminConfig {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

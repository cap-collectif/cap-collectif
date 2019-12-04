// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { SSOConfigurationItem } from './SSOConfigurationItem';
import { $refType } from '../../../mocks';

describe('<SSOConfigurationItem />', () => {
  const props = {
    configuration: {
      ...$refType,
      __typename: 'Oauth2SSOConfiguration',
    },
  };

  it('renders correctly with Oauth2 configuration', () => {
    const wrapper = shallow(<SSOConfigurationItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

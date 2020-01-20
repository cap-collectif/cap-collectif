// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectDistrictAdminPage } from './ProjectDistrictAdminPage';
import { features } from '~/redux/modules/default';
import { $fragmentRefs, $refType } from '~/mocks';

const defaultDistrict = {
  id: '1',
  $fragmentRefs,
};

const defaultProps = {
  districts: {
    $fragmentRefs,
    $refType,
    edges: [
      $fragmentRefs,
      $refType,
      { node: defaultDistrict },
      { node: defaultDistrict },
      { node: defaultDistrict },
    ],
  },
  features,
};

describe('<ProjectDistrictAdminPage />', () => {
  it('should render correctly no districts', () => {
    const wrapper = shallow(<ProjectDistrictAdminPage {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

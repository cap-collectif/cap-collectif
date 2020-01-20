// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectDistrictForm } from './ProjectDistrictForm';
import { formMock, $fragmentRefs, $refType } from '~/mocks';
import { features } from '~/redux/modules/default';

const defaultDistrict = {
  $fragmentRefs,
  $refType,
  id: '1',
  name: 'oui',
  geojson: 'oui',
  displayedOnMap: true,
  border: null,
  background: null,
  translations: [
    {
      locale: 'fr-FR',
      name: 'Français',
    },
  ],
};

const defaultProps = {
  ...formMock,
  show: true,
  isCreating: true,
  member: 'oui',
  defaultLanguage: 'fr-FR',
  handleClose: jest.fn(),
  district: defaultDistrict,
  features,
};

describe('<ProjectDistrictForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectDistrictForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

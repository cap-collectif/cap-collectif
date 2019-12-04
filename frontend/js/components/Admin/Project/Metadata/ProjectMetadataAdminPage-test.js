// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectMetadataAdminPage } from './ProjectMetadataAdminPage';
import { formMock, intlMock } from '~/mocks';

const defaultProps = {
  ...formMock,
  intl: intlMock,
  project: null,
  formName: 'form',
};

describe('<ProjectMetadataAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectMetadataAdminPage {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

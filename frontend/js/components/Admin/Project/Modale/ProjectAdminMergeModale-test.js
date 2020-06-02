// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminMergeModale } from './ProjectAdminMergeModale';
import { formMock, intlMock } from '~/mocks';

describe('<ProjectAdminMergeModale />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    dispatch: jest.fn(),
    show: false,
    proposalsSelected: [
      {
        adminUrl: 'https://capco.dev/admin/capco/app/proposal/proposal109/edit?_locale=fr-FR',
        id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        title: 'Luffy',
      },
      {
        adminUrl: 'https://capco.dev/admin/capco/app/proposal/proposal120/edit?_locale=fr-FR',
        id: 'UHJvcGzdzMDk=',
        title: 'Zoro',
      },
    ],
    onClose: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ProjectAdminMergeModale {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

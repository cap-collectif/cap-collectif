// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectExternalAdminForm } from './ProjectExternalAdminForm';
import { formMock, intlMock, $refType } from '../../../../mocks';

describe('<ProjectExternalAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    dispatch: jest.fn(),
    isExternal: true,
    formName: 'ProjectExternalAdminForm',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectExternalAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        isExternal: true,
        externalLink: 'http://google.com/',
        externalContributionsCount: 7,
        externalParticipantsCount: 3,
        externalVotesCount: 0,
      },
    };
    const wrapper = shallow(<ProjectExternalAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

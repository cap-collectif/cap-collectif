// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectExternalProjectAdminForm } from './ProjectExternalProjectAdminForm';
import { formMock, intlMock, $refType } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProjectExternalProjectAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    features,
    onToggle: jest.fn(),
    dispatch: jest.fn(),
    isExternal: true,
    formName: 'ProjectExternalProjectAdminForm',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(
      <ProjectExternalProjectAdminForm {...defaultProps} hostUrl="capco.dev" />,
    );
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
    const wrapper = shallow(<ProjectExternalProjectAdminForm {...props} hostUrl="capco.dev" />);
    expect(wrapper).toMatchSnapshot();
  });
});

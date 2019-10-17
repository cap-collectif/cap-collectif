// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectContentAdminForm } from './ProjectContentAdminForm';
import { formMock, intlMock, $refType } from '../../../../mocks';

describe('<ProjectContentAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    formName: 'ProjectContentAdminForm',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectContentAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        id: '1',
        title: 'project',
        authors: [
          {
            value: 'id',
            label: 'username',
          },
        ],
        opinionTerm: 1,
        type: {
          id: '0',
        },
      },
    };
    const wrapper = shallow(<ProjectContentAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectContentAdminPageView from './ProjectContentAdminPageView';
import { $fragmentRefs } from '../../../mocks';

describe('<ProjectContentAdminPage />', () => {
  const defaultProps = {
    project: {
      $fragmentRefs,
    },
    isEditMode: true,
  };

  it('renders correctly when editing project', () => {
    const wrapper = shallow(<ProjectContentAdminPageView {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when no project', () => {
    const wrapper = shallow(<ProjectContentAdminPageView project={null} isEditMode={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});

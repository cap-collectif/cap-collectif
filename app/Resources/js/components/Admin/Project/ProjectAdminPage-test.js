// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectAdminPageView from './ProjectAdminPageView';
import { $fragmentRefs } from '../../../mocks';

describe('<ProjectContentAdminPage />', () => {
  const defaultProps = {
    project: {
      $fragmentRefs,
    },
    isEditMode: true,
  };

  it('renders correctly when editing project', () => {
    const wrapper = shallow(<ProjectAdminPageView {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when no project', () => {
    const wrapper = shallow(<ProjectAdminPageView project={null} isEditMode={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});

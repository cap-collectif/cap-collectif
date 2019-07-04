// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderAuthorsModal } from './ProjectHeaderAuthorsModal';
import { $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProjectHeaderAuthorsModal />', () => {
  it('renders correctly', () => {
    const props = {
      features,
      show: true,
      onClose: () => {},
      users: [
        {
          $refType,
          $fragmentRefs,
          username: 'toto',
          id: '1',
          url: 'test.com',
          userType: {
            name: 'userType1',
          },
        },
      ],
    };
    const wrapper = shallow(<ProjectHeaderAuthorsModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderAuthors } from './ProjectHeaderAuthors';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProjectHeaderAuthors />', () => {
  it('renders correctly', () => {
    const props = {
      project: {
        $refType,
        id: '1',
        publishedAt: '2019-05-18 09:57:30',
        authors: [
          {
            $fragmentRefs,
            username: 'toto',
          },
        ],
      },
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

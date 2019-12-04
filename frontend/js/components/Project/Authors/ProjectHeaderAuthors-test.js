// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderAuthors } from './ProjectHeaderAuthors';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProjectHeaderAuthors />', () => {
  it('renders correctly with one author', () => {
    const props = {
      project: {
        $refType,
        id: '1',
        authors: [
          {
            $fragmentRefs,
            username: 'toto',
            url: 'http://jaimeles.coquillettes',
          },
        ],
      },
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without authors', () => {
    const props = {
      project: {
        $refType,
        id: '1',
        authors: [],
      },
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with 3 authors', () => {
    const props = {
      project: {
        $refType,
        id: '1',
        authors: [
          {
            $fragmentRefs,
            username: 'toto',
            url: 'http://jaimeles.coquillettes',
          },
          {
            $fragmentRefs,
            username: 'tota',
            url: 'http://jaimeles.gnocchis',
          },
          {
            $fragmentRefs,
            username: 'titi',
            url: 'http://jaimeles.farfale',
          },
        ],
      },
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with two authors', () => {
    const props = {
      project: {
        $refType,
        id: '1',
        authors: [
          {
            $fragmentRefs,
            username: 'toto',
            url: 'http://jaimeles.coquillettes',
          },
          {
            $fragmentRefs,
            username: 'tota',
            url: 'http://jaimeles.gnocchis',
          },
        ],
      },
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

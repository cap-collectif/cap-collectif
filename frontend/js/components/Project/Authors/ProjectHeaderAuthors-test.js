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
      profilesToggle: true,
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
      profilesToggle: true,
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
      profilesToggle: true,
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
      profilesToggle: true,
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with one author but profiles are disabled', () => {
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
      profilesToggle: false,
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with two authors but profiles are disabled', () => {
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
      profilesToggle: false,
    };
    const wrapper = shallow(<ProjectHeaderAuthors {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

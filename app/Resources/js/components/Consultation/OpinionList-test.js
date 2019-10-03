// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import { $refType, $fragmentRefs, intlMock } from '../../mocks';

describe('<OpinionList />', () => {
  const defaultConsultation = {
    id: 'consultation1',
    opinionCountShownBySection: 5,
    $refType,
    $fragmentRefs,
  };
  const defaultSection = {
    $fragmentRefs,
    $refType,
    color: 'red',
    contribuable: true,
    opinions: {
      totalCount: 10,
    },
    defaultOrderBy: 'positions',
    id: 'id',
    slug: 'slug',
    url: 'https://capco.dev',
  };

  const defaultProps = {
    enablePagination: false,
    section: defaultSection,
    consultation: defaultConsultation,
    intl: intlMock,
  };

  it('renders correcty when not contribuable', () => {
    const props = {
      ...defaultProps,
      section: {
        ...defaultSection,
        contribuable: false,
      },
    };

    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with pagination disabled', () => {
    const wrapper = shallow(<OpinionList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with pagination enabled', () => {
    const wrapper = shallow(<OpinionList {...defaultProps} enablePagination />);
    expect(wrapper).toMatchSnapshot();

    const orderBy = ['random', 'last', 'old', 'favorable', 'votes', 'comments'];
    for (const order of orderBy) {
      wrapper.find('select').simulate('change', { target: { value: order } });
      expect(wrapper).toMatchSnapshot();
    }
  });
});

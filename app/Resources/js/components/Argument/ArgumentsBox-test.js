// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentsBox } from './ArgumentsBox';
import { $refType, $fragmentRefs } from '../../mocks';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';

describe('<ArgumentsBox />', () => {
  const opinion = {
    $refType,
    $fragmentRefs,
  };

  it('should return null with no section', () => {
    const wrapper = shallow(<ArgumentsBox opinion={opinion} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });

  it('should return null with incorrect section commentSystem', () => {
    const opinionWithBadSection = {
      ...opinion,
      section: { commentSystem: -1 },
    };
    const wrapper = shallow(<ArgumentsBox opinion={opinionWithBadSection} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.type()).toEqual(null);
  });

  it('should render correctly with a simple commentSystem', () => {
    const opinionWithSimpleCommentSystemSection = {
      ...opinion,
      section: { commentSystem: COMMENT_SYSTEM_SIMPLE },
    };
    const wrapper = shallow(<ArgumentsBox opinion={opinionWithSimpleCommentSystemSection} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ArgumentsBox__Switcher')).toHaveLength(0);
    expect(wrapper.find('#arguments-col--SIMPLE')).toHaveLength(1);
  });

  it('should render correctly with a for/against commentSystem', () => {
    const opinionWithBothCommentSystemSection = {
      ...opinion,
      section: { commentSystem: COMMENT_SYSTEM_BOTH },
    };
    const wrapper = shallow(<ArgumentsBox opinion={opinionWithBothCommentSystemSection} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('ArgumentsBox__Switcher')).toHaveLength(1);
    expect(wrapper.find('#arguments-col--FOR')).toHaveLength(1);
    expect(wrapper.find('#arguments-col--AGAINST')).toHaveLength(1);
  });
});

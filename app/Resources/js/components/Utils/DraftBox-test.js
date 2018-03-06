// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DraftBox } from './DraftBox';

describe('<DraftBox />', () => {
  const props = {};

  it('renders draft box', () => {
    const wrapper = shallow(
      <DraftBox {...props}>
        <div className="foo" />
      </DraftBox>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

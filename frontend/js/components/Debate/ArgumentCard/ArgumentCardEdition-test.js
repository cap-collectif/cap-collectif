// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentCardEdition } from './ArgumentCardEdition';
import { $refType } from '~/mocks';

describe('<ArgumentCardEdition />', () => {
  const argument = {
    $refType,
    id: 'argumentPour42',
    body: 'Oui',
  };

  it('renders correcty', () => {
    const wrapper = shallow(
      <ArgumentCardEdition argument={argument} body="userId" goBack={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

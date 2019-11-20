// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SelectTheme } from './SelectTheme';
import { $refType, intlMock } from '../../mocks';

describe('<SelectTheme />', () => {
  const props = {
    query: {
      themes: [
        { id: 'theme1', title: 'Mon premier thème' },
        { id: 'theme2', title: 'Mon second thème' },
      ],
      $refType,
    },
    intl: intlMock,
  };

  const emptyList = {
    query: {
      themes: [],
      $refType,
    },
    intl: intlMock,
    name: 'themes',
    multi: true,
    clearable: true,
    divId: 'myDivId',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<SelectTheme {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render empty list', () => {
    const wrapper = shallow(<SelectTheme {...emptyList} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render disabled', () => {
    const wrapper = shallow(<SelectTheme {...props} disabled />);
    expect(wrapper).toMatchSnapshot();
  });
});

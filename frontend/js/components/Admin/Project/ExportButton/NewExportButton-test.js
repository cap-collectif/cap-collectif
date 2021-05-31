// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import NewExportButton from './NewExportButton';

describe('<NewExportButton/>', () => {
  const defaultProps = {
    onChange: jest.fn(),
    linkHelp: 'http://help.com',
    disabled: false,
    exportableSteps: [
      {
        position: 1,
        step: {
          id: 'stepId1',
          __typename: 'Collect',
          title: 'étape de dépot',
          slug: '/dépot',
        },
      },
      {
        position: 2,
        step: {
          id: 'stepId2',
          __typename: 'Selection',
          title: 'étape de sélection',
          slug: '/select',
        },
      },
    ],
  };

  it('render correctly', () => {
    const wrapper = shallow(<NewExportButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('render disabled', () => {
    const props = {
      ...defaultProps,
      disabled: true,
    };
    const wrapper = shallow(<NewExportButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

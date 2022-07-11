// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdmin } from './ProjectStepAdmin';
import { $fragmentRefs, $refType, formMock, intlMock } from '~/mocks';

const baseProps = {
  ...formMock,
  intl: intlMock,
  form: 'testForm',
  project: {
    $fragmentRefs,
    $refType,
    firstCollectStep: {
      id: 'collect-step-123',
    },
  },
  query: {
    $fragmentRefs,
    $refType,
  },
  viewerIsAdmin: true,
  hasIdentificationCodeLists: true,
};

const props = {
  basic: baseProps,
  viewerNotAdmin: {
    ...baseProps,
    viewerIsAdmin: false,
  },
  noCollectStep: {
    ...baseProps,
    project: {
      ...baseProps.project,
      firstCollectStep: null,
    },
  },
};

describe('<ProjectStepAdmin />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with isAdmin false', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.viewerNotAdmin} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders list step without selection step when no collect step', () => {
    const wrapper = shallow(<ProjectStepAdmin {...props.noCollectStep} />);
    expect(wrapper).toMatchSnapshot();
  });
});

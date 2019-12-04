// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminNotationForm } from './ProposalAdminNotationForm';
import { intlMock, formMock } from '../../../mocks';

describe('<ProposalAdminNotationForm />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    disabled: false,
    dirty: false,
    responses: [],
    proposal: {
      id: '1',
      estimation: 1000,
      likers: [{ id: '1', displayName: 'liker-1' }],
      form: {
        evaluationForm: {
          description: null,
          questions: [],
        },
      },
      evaluation: {
        version: 1,
        responses: [],
      },
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminNotationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

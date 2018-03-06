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
    responses: [],
    // $FlowFixMe $refType
    proposal: {
      id: '1',
      estimation: 1000,
      likers: [{ id: '1', displayName: 'liker-1' }],
      form: {
        evaluationForm: {
<<<<<<< HEAD
          description: null,
          questions: [],
        },
=======
          questions: []
        }
>>>>>>> Implement relay-node pattern
      },
      evaluation: {
        version: 1,
        responses: []
      }
    }
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminNotationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminOfficialAnswerForm } from './ProposalAdminOfficialAnswerForm';
import { $refType, formMock } from '~/mocks';

describe('<ProposalAdminOfficialAnswerForm />', () => {
  const props = {
    dispatch: jest.fn(),
    onValidate: jest.fn(),
    publishedAt: '2017-02-01 00:03:00',
    submitting: false,
    pristine: false,
    invalid: false,
    ...formMock,
  };

  const officialResponse = {
    id: 'response',
    authors: [],
    body: '<p>slt</p>',
    isPublished: true,
    publishedAt: '2017-02-01 00:03:00',
  };

  it('render correctly without response', () => {
    const wrapper = shallow(
      <ProposalAdminOfficialAnswerForm
        {...props}
        proposal={{ id: 'proposal3', $refType, officialResponse: null }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly with response', () => {
    const wrapper = shallow(
      <ProposalAdminOfficialAnswerForm
        {...props}
        proposal={{ id: 'proposal3', $refType, officialResponse }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

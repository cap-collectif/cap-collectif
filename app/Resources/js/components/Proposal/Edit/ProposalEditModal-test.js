// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalEditModal } from './ProposalEditModal';
import { $fragmentRefs, $refType, intlMock } from '../../../mocks';

const defaultProposal = {
  $fragmentRefs,
  $refType,
  form: {
    $fragmentRefs,
  },
  id: '1',
  publicationStatus: 'PUBLISHED',
};

const defaultProps = {
  intl: intlMock,
  proposal: { ...defaultProposal },
  show: true,
  submitting: false,
  invalid: false,
  pristine: true,
  dispatch: jest.fn(),
};

describe('<ProposalEditModal />', () => {
  it('should render correctly with PUBLISHED status', () => {
    const wrapper = shallow(<ProposalEditModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with DRAFT status', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...defaultProposal,
        publicationStatus: 'DRAFT',
      },
    };

    const wrapper = shallow(<ProposalEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with DELETED status', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...defaultProposal,
        publicationStatus: 'DELETED',
      },
    };

    const wrapper = shallow(<ProposalEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with TRASHED status', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...defaultProposal,
        publicationStatus: 'TRASHED',
      },
    };

    const wrapper = shallow(<ProposalEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with TRASHED_NOT_VISIBLE status', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...defaultProposal,
        publicationStatus: 'TRASHED_NOT_VISIBLE',
      },
    };

    const wrapper = shallow(<ProposalEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with UNPUBLISHED status', () => {
    const props = {
      ...defaultProps,
      proposal: {
        ...defaultProposal,
        publicationStatus: 'UNPUBLISHED',
      },
    };

    const wrapper = shallow(<ProposalEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

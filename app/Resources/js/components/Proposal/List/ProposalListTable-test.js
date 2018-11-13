// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalListTable } from './ProposalListTable';
import { $refType } from '../../../mocks';

describe('<ProposalListTable />', () => {
  const step = {
    form: {
      usingThemes: true,
      usingDistrict: true,
      usingCategories: true,
      usingDescription: true,
      usingSummary: true,
      isProposalForm: true,
      descriptionMandatory: true,
    },
    $refType,
  };

  const stepFalseValues = {
    form: {
      usingThemes: false,
      usingDistrict: false,
      usingCategories: false,
      usingDescription: false,
      usingSummary: false,
      isProposalForm: false,
      descriptionMandatory: false,
    },
    $refType,
  };

  const proposals = {
    edges: [
      {
        node: {
          id: 'Title',
          title: 'Installation de bancs',
          reference: '1-3',
          publishedAt: '2018-08-16 15:15:39',
          theme: { title: 'Justice' },
          author: { displayName: 'admin', url: 'google.com', media: null },
          category: null,
          currentVotableStep: null,
          estimation: null,
          district: null,
          progressSteps: [],
          updatedAt: null,
          status: null,
          likers: [],
          url: null,
          updatedBy: null,
        },
      },
      {
        node: {
          id: 'proposal4',
          title: 'Proposition plus votable',
          reference: '1-2',
          publishedAt: '2018-09-17 16:15:39',
          theme: { title: 'Justice' },
          status: { name: 'En cours', color: 'info' },
          author: { displayName: 'admin2', url: 'google.com', media: null },
          category: null,
          currentVotableStep: null,
          estimation: null,
          district: null,
          progressSteps: [],
          updatedAt: null,
          likers: [],
          url: null,
          updatedBy: null,
        },
      },
    ],
    $refType,
  };

  it('renders table with formatted data', () => {
    const wrapper = shallow(<ProposalListTable step={step} proposals={proposals} />);
    wrapper.setState({ windowWidth: 995 });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders mobile version with formatted data & hidden values && proposalForm as question', () => {
    const wrapper = shallow(<ProposalListTable step={stepFalseValues} proposals={proposals} />);
    wrapper.setState({ windowWidth: 400 });
    expect(wrapper).toMatchSnapshot();
  });
});

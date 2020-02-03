// @flow
import { graphql } from 'react-relay';

// We explicitly write the translation keys rather than doing it dynamically so as not to break the translation detection command.
export const getProposalLabelByType = (projectType: ?string, label: string): string => {
  if (projectType === 'project.types.interpellation') {
    switch (label) {
      case 'add':
        return 'interpellation.add';
      case 'confirm_close_modal':
        return 'interpellation.confirm_close_modal';
      default:
        return `proposal.${label}`;
    }
  }

  return `proposal.${label}`;
};

export const getVotePageLabelByType = (projectType: string, label: string): string => {
  if (projectType === 'project.types.interpellation') {
    if (label === 'project.votes.title') {
      return 'project.supports.title';
    }

    if (label === 'project.votes.no_active_step') {
      return 'project.supports.no_active_step';
    }
  }

  return label;
};

// eslint-disable-next-line no-unused-vars
const ProposalFragment = {
  proposal: graphql`
    fragment interpellationLabelHelper_proposal on Proposal {
      project {
        type {
          title
        }
      }
      form {
        isProposalForm
      }
    }
  `,
};

type Proposal = {
  +project: ?{
    +type: ?{|
      +title: string,
    |},
  },
  +form: {
    +isProposalForm: boolean,
  },
};

// eslint-disable-next-line no-unused-vars
const StepFragment = {
  step: graphql`
    fragment interpellationLabelHelper_step on ProposalStep {
      form {
        isProposalForm
      }
      project {
        type {
          title
        }
      }
    }
  `,
};

type ProposalStep = {
  +form: ?{
    +isProposalForm: boolean,
  },
  +project: ?{
    +type: ?{|
      +title: string,
    |},
  },
};

export const isInterpellationContextFromProposal = (proposal: Proposal): boolean => {
  return !!(
    proposal.project &&
    proposal.project.type &&
    proposal.form.isProposalForm &&
    proposal.project.type.title === 'project.types.interpellation'
  );
};

export const isInterpellationContextFromStep = (step: ProposalStep): boolean => {
  return !!(
    step.project &&
    step.project.type &&
    step.form &&
    step.form.isProposalForm &&
    step.project.type.title === 'project.types.interpellation'
  );
};

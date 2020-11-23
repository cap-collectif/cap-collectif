// @flow
import { graphql } from 'react-relay';
import type { ProposalFormObjectType } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';

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
        objectType
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
    +objectType: ProposalFormObjectType,
  },
};

// eslint-disable-next-line no-unused-vars
const StepFragment = {
  step: graphql`
    fragment interpellationLabelHelper_step on ProposalStep {
      form {
        objectType
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
    +objectType: ProposalFormObjectType,
  },
  +project: ?{
    +type: ?{|
      +title: string,
    |},
  },
};

export const isInterpellationContextFromProposal = (proposal: ?Proposal): boolean => {
  return !!(
    proposal?.project?.type &&
    proposal?.form.objectType === 'PROPOSAL' &&
    proposal?.project.type.title === 'project.types.interpellation'
  );
};

export const isInterpellationContextFromStep = (step: ProposalStep): boolean => {
  return !!(
    step.project &&
    step.project.type &&
    step.form &&
    step.form.objectType === 'PROPOSAL' &&
    step.project.type.title === 'project.types.interpellation'
  );
};

export const isEstablishmentFormStep = (step: ProposalStep): boolean => {
  return !!(
    step.project &&
    step.project.type &&
    step.form &&
    step.form.objectType === 'ESTABLISHMENT'
  );
};

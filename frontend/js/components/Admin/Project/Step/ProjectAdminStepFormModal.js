// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import { STEP_TYPES } from '~/constants/StepTypeConstants';
import ProjectAdminStepForm, { type FranceConnectAllowedData } from './ProjectAdminStepForm';
import { StepModalTitle, StepModalContainer } from '../Form/ProjectAdminForm.style';
import type { ProjectAdminStepFormModal_project } from '~relay/ProjectAdminStepFormModal_project.graphql';
import type { ProjectAdminStepFormModal_query } from '~relay/ProjectAdminStepFormModal_query.graphql';

type Props = {|
  form: string,
  show: boolean,
  onClose: () => void,
  step: ?{ +title: string },
  type: string,
  index?: number,
  isCreating?: boolean,
  project: ProjectAdminStepFormModal_project,
  query: ProjectAdminStepFormModal_query,
|};

const loadFCAllowedData = (query: ProjectAdminStepFormModal_query) => {
  if (!query?.ssoConfigurations?.edges || query?.ssoConfigurations?.edges.length < 1) {
    return { FIRSTNAME: false, LASTNAME: false, DATE_OF_BIRTH: false };
  }
  return (
    query.ssoConfigurations.edges &&
    query.ssoConfigurations.edges
      .filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean)
      .reduce(
        (acc, sso) => {
          if (sso.__typename === 'FranceConnectSSOConfiguration') {
            acc.FIRSTNAME = sso.allowedData.includes('given_name');
            acc.LASTNAME = sso.allowedData.includes('family_name');
            acc.DATE_OF_BIRTH = sso.allowedData.includes('birthdate');
          }
          return acc;
        },
        { FIRSTNAME: false, LASTNAME: false, DATE_OF_BIRTH: false },
      )
  );
};

export const ProjectAdminStepFormModal = ({
  step,
  onClose,
  show,
  form,
  index,
  type,
  isCreating,
  project,
  query,
}: Props) => {
  const hasLoginFranceConnect = useFeatureFlag('login_franceconnect');
  const [data, setData] = useState<FranceConnectAllowedData>({
    FIRSTNAME: false,
    LASTNAME: false,
    DATE_OF_BIRTH: false,
  });
  const [ssoConfig, setSsoConfig] = useState<?boolean>(null);
  const isFranceConnectRequirementReady = true;
  React.useEffect(() => {
    async function fetchData() {
      if (!query.ssoConfigurations || ssoConfig !== null) {
        return;
      }

      if (isFranceConnectRequirementReady) {
        const fcAllowedData = loadFCAllowedData(query);
        setData(fcAllowedData);
      }
      const ssoConfiguration = query?.ssoConfigurations?.edges
        ? query.ssoConfigurations.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .filter(
              sso =>
                sso &&
                sso.__typename === 'FranceConnectSSOConfiguration' &&
                sso.isCompletelyConfigured &&
                sso.enabled,
            )
        : [];
      setSsoConfig(ssoConfiguration.length > 0);
    }

    fetchData();
  }, [setData, setSsoConfig, data, isFranceConnectRequirementReady, query, ssoConfig]);
  const stepType = STEP_TYPES.find(s => s.value === type);
  const modalTitle = stepType ? (isCreating ? stepType.addLabel : stepType.editLabel) : '';
  const isFranceConnectConfigured =
    hasLoginFranceConnect && ssoConfig && isFranceConnectRequirementReady;
  return (
    <StepModalContainer
      animation={false}
      show={show}
      onHide={onClose}
      dialogClassName="custom-modal-dialog"
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <StepModalTitle id="contained-modal-title-lg">
          <FormattedMessage id={modalTitle} />
        </StepModalTitle>
      </Modal.Header>
      <ProjectAdminStepForm
        isCreating={isCreating}
        formName={form}
        step={{ ...step, __typename: type }}
        index={index}
        handleClose={onClose}
        project={project}
        isFranceConnectConfigured={isFranceConnectConfigured}
        fcAllowedData={data}
      />
    </StepModalContainer>
  );
};

export default createFragmentContainer(ProjectAdminStepFormModal, {
  project: graphql`
    fragment ProjectAdminStepFormModal_project on Project {
      ...ProjectAdminStepForm_project
    }
  `,
  query: graphql`
    fragment ProjectAdminStepFormModal_query on Query {
      ssoConfigurations(first: 100, ssoType: FRANCE_CONNECT) {
        edges {
          node {
            __typename
            ... on FranceConnectSSOConfiguration {
              isCompletelyConfigured
              allowedData
              enabled
            }
          }
        }
      }
    }
  `,
});

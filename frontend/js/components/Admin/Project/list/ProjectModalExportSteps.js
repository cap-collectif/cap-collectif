// @flow
import * as React from 'react';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { Field, reduxForm } from 'redux-form';
import type { IntlShape } from 'react-intl';
import Button from '~ds/Button/Button';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import Text from '~ui/Primitives/Text';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import MenuListItem from '~ds/Menu/MenuListItem';
import type { ProjectModalExportSteps_project$key } from '~relay/ProjectModalExportSteps_project.graphql';
import type { Dispatch } from '~/types';
import Flex from '~ui/Primitives/Layout/Flex';
import component from '~/components/Form/Field';
import downloadCSV from '~/components/Utils/downloadCSV';
import colors from '~/styles/modules/colors';

const formName = 'form-export-project';

type FormValues = {|
  +export_list: any,
|};
type PropsBefore = {|
  +project: ProjectModalExportSteps_project$key,
  +intl: IntlShape,
  +isOnlyProjectAdmin?: boolean,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...PropsBefore,
|};

const FRAGMENT = graphql`
  fragment ProjectModalExportSteps_project on Project {
    title
    exportContributorsUrl
    exportableSteps {
      position
      step {
        title
        __typename
        exportStepUrl
        exportContributorsUrl
      }
    }
  }
`;
const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  values.export_list.labels.forEach(async url => {
    await downloadCSV(url, props.intl);
  });
};
const getSteptrad = step => {
  if (step?.step.__typename === 'QuestionnaireStep') {
    return (
      <FormattedHTMLMessage
        id="admin.project.list.export.step.exportStepUrl"
        values={{ index: step?.position, stepTitle: step?.step?.title }}
      />
    );
  }
  return (
    <FormattedHTMLMessage
      id="admin.project.list.export.step.exportStepUrl.alt"
      values={{ index: step?.position, stepTitle: step?.step?.title }}
    />
  );
};
const ProjectModalExportSteps = ({
  project: projectFragment,
  handleSubmit,
  isOnlyProjectAdmin,
}: Props) => {
  const project = useFragment(FRAGMENT, projectFragment);
  const intl = useIntl();
  const exportChoices = isOnlyProjectAdmin
    ? project.exportableSteps.map(step => {
        return {
          id: step?.step?.exportStepUrl,
          useIdAsValue: true,
          label: getSteptrad(step),
        };
      })
    : [
        {
          id: project.exportContributorsUrl,
          useIdAsValue: true,
          label: <FormattedHTMLMessage id="admin.project.list.export.exportContributorsUrl" />,
        },

        ...project.exportableSteps
          .map(step => {
            return [
              {
                id: step?.step?.exportStepUrl,
                useIdAsValue: true,
                label: getSteptrad(step),
              },
              {
                id: step?.step?.exportContributorsUrl,
                useIdAsValue: true,
                label: (
                  <FormattedHTMLMessage
                    id="admin.project.list.export.step.exportContributorsUrl"
                    values={{ index: step?.position, stepTitle: step?.step?.title }}
                  />
                ),
              },
            ].flat();
          })
          .flat(),
      ];
  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
      disclosure={
        <MenuListItem closeOnSelect={false}>
          <Text> {intl.formatMessage({ id: 'project.download.button' })} </Text>
        </MenuListItem>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Text
              color={`${colors.gray['500']} !important`}
              fontSize={1}
              lineHeight="sm"
              fontWeight="bold">
              {project.title}
            </Text>
            <Heading as="h4">{intl.formatMessage({ id: 'label_export_download' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex as="form" direction="column" spacing={3}>
              <Field
                id="export_list"
                name="export_list"
                component={component}
                type="checkbox"
                label={
                  <Text fontSize={3} fontWeight="normal">
                    {intl.formatMessage({ id: 'admin.project.list.export.title' })}
                  </Text>
                }
                choices={exportChoices}
              />
            </Flex>
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <ButtonGroup>
              <Button
                variantSize="medium"
                variant="secondary"
                variantColor="hierarchy"
                onClick={hide}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button
                variantSize="medium"
                variant="primary"
                variantColor="primary"
                onClick={() => {
                  handleSubmit();
                  hide();
                }}>
                {intl.formatMessage({ id: 'global.export.projects' })}
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};
export default (reduxForm({
  onSubmit,
  form: formName,
})(ProjectModalExportSteps): React.AbstractComponent<PropsBefore>);

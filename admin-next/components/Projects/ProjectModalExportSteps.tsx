import * as React from 'react';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import {
    Button,
    Modal,
    Heading,
    Text,
    ButtonGroup,
    Menu,
    CapUIModalSize,
    Box,
    FormLabel,
} from '@cap-collectif/ui';
import type {
    ProjectModalExportSteps_project$key,
    ProjectModalExportSteps_project,
} from '@relay/ProjectModalExportSteps_project.graphql';
import downloadCSV from 'utils/download-csv';
import { useForm } from 'react-hook-form';
import { FormControl, FieldInput } from '@cap-collectif/form';

const formName = 'form-export-project';

interface ProjectModalExportStepsProps {
    project: ProjectModalExportSteps_project$key;
}

type FormValues = {
    export_list: any;
};

const PROJECT_FRAGMENT = graphql`
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
const getSteptrad = (step: ProjectModalExportSteps_project['exportableSteps'][number]) => {
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
const ProjectModalExportSteps: React.FC<ProjectModalExportStepsProps> = ({
    project: projectFragment,
}) => {
    const project = useFragment(PROJECT_FRAGMENT, projectFragment);

    const intl = useIntl();
    const exportChoices = [
              {
                  id: project.exportContributorsUrl,
                  useIdAsValue: true,
                  label: (
                      <FormattedHTMLMessage id="admin.project.list.export.exportContributorsUrl" />
                  ),
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
                                      values={{
                                          index: step?.position,
                                          stepTitle: step?.step?.title,
                                      }}
                                  />
                              ),
                          },
                      ].flat();
                  })
                  .flat(),
          ];

    const { handleSubmit, formState, control, reset } = useForm({
        mode: 'onChange',
    });
    const { isSubmitting } = formState;

    const onSubmit = (values: FormValues) => {
        values.export_list.labels.forEach(async (url: string) => {
            await downloadCSV(url, intl);
        });
    };
    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
            disclosure={
                <Menu.Item closeOnSelect={false}>
                    <Text> {intl.formatMessage({ id: 'project.download.button' })} </Text>
                </Menu.Item>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Modal.Header.Label>{project.title}</Modal.Header.Label>
                        <Heading as="h4">
                            {intl.formatMessage({ id: 'label_export_download' })}
                        </Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Box as="form" id={formName}>
                            <FormControl name="export_list" control={control}>
                                <FormLabel
                                    label={intl.formatMessage({
                                        id: 'admin.project.list.export.title',
                                    })}
                                />
                                <FieldInput
                                    id="export_list"
                                    name="export_list"
                                    type="checkbox"
                                    control={control}
                                    // @ts-ignore https://github.com/cap-collectif/platform/issues/15972
                                    choices={exportChoices}
                                />
                            </FormControl>
                        </Box>
                    </Modal.Body>
                    <Modal.Footer>
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
                                isLoading={isSubmitting}
                                onClick={e => {
                                    handleSubmit((data: FormValues) => onSubmit(data))(e);
                                    hide();
                                    reset();
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
export default ProjectModalExportSteps;

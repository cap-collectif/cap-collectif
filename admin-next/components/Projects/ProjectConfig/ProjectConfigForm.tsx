import * as React from 'react';
import { Button, Flex, toast } from '@cap-collectif/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import ProjectConfigFormSide from './ProjectConfigFormSide/ProjectConfigFormSide';
import { FormValues, getInitialValues } from './ProjectConfigForm.utils';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { ProjectConfigFormQuery } from '@relay/ProjectConfigFormQuery.graphql';
import { ProjectConfigForm_project$key } from '@relay/ProjectConfigForm_project.graphql';
import ProjectConfigFormGeneral from './ProjectConfigFormGeneral';
import { useNavBarContext } from 'components/NavBar/NavBar.context';
import debounce from '@utils/debounce-promise';
import ProjectConfigFormSteps from './ProjectConfigFormSteps';
import UpdateNewProjectMutation from '@mutations/UpdateNewProjectMutation';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import moment from 'moment';
import { ProjectVisibility } from '@relay/CreateProjectMutation.graphql';
import { yupResolver } from '@hookform/resolvers/yup';

export type ProjectConfigFormProps = {
    project: ProjectConfigForm_project$key,
};

export const QUERY = graphql`
    query ProjectConfigFormQuery {
        availableLocales(includeDisabled: false) {
            code
            isEnabled
            isDefault
            traductionKey
        }
        ...ProjectConfigFormGeneral_query
        ...ProjectConfigFormSide_query
    }
`;

const FRAGMENT = graphql`
    fragment ProjectConfigForm_project on Project {
        id
        title
        description
        publishedAt
        metaDescription
        archived
        authors {
            value: id
            label: username
        }
        type {
            id
        }
        cover {
            id
            name
            size
            type: contentType
            url(format: "reference")
        }
        video
        themes {
            value: id
            label: title
        }
        restrictedViewers {
            edges {
                node {
                    value: id
                    label: title
                }
            }
        }
        address {
            formatted
            json
        }
        districts {
            edges {
                node {
                    value: id
                    label: name
                }
            }
        }
        firstCollectStep {
            form {
                isGridViewEnabled
                isListViewEnabled
                isMapViewEnabled
            }
        }
        visibility
        publishedAt
        opinionCanBeFollowed
        isExternal
        externalLink
        externalContributionsCount
        externalParticipantsCount
        externalVotesCount
        locale {
            value: id
            label: traductionKey
        }
        url
        steps(excludePresentationStep: true) {
            id
            label
            __typename
        }
        ...ProjectConfigFormSide_project
    }
`;

const formName = 'project_config_form';

const ProjectConfigForm: React.FC<ProjectConfigFormProps> = ({ project: projectRef }) => {
    const intl = useIntl();
    const query = useLazyLoadQuery<ProjectConfigFormQuery>(QUERY, {});
    const project = useFragment(FRAGMENT, projectRef);
    const { setSaving: triggerNavBarSaving, setBreadCrumbItems } = useNavBarContext();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const methods = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: getInitialValues(project, intl),
        resolver: yupResolver(
            yup.object().shape({
                externalLink: yup.string().when('isExternal', {
                    is: (isExternal: boolean) => isExternal === true,
                    then: yup.string().required(intl.formatMessage({ id: 'global.required' })),
                    otherwise: yup.string().nullable().notRequired(),
                }),
            }),
        ),
    });

    const onSubmit = ({ isExternal, addressText, ...values }: FormValues) => {
        setIsSubmitting(true);
        // TODO : Add customCode field
        const input = {
            ...values,
            cover: values?.cover?.id || null,
            steps: values.steps.map(s => s.id),
            themes: values.themes.map(t => t.value),
            authors: values.authors.map(a => a.value),
            districts: values.districts.map(d => d.value),
            restrictedViewerGroups:
                values.visibility.labels[0] === 'CUSTOM'
                    ? values.restrictedViewerGroups.map(r => r.value)
                    : undefined,
            visibility: values.visibility.labels[0] as ProjectVisibility,
            publishedAt: moment(values.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
            externalLink: isExternal ? values.externalLink : undefined,
            externalParticipantsCount: isExternal ? values.externalParticipantsCount : undefined,
            externalContributionsCount: isExternal ? values.externalContributionsCount : undefined,
            externalVotesCount: isExternal ? values.externalVotesCount : undefined,
            isExternal,
            locale: values.locale?.value || null,
            projectId: project.id,
            addressText: undefined,
            address: values.address && addressText ? JSON.stringify([values.address]) : null,
        };

        return UpdateNewProjectMutation.commit({ input })
            .then(() => {
                setIsSubmitting(false);
            })
            .catch(e => {
                console.error(e);
                mutationErrorToast(intl);
                setIsSubmitting(false);
            });
    };

    const { handleSubmit, getValues, watch, setValue, formState, trigger } = methods;

    const title = watch('title');
    const breadCrumbItems = [
        {
            title: intl.formatMessage({ id: 'global.all.projects' }),
            href: '/projects',
        },
        {
            title: title || intl.formatMessage({ id: 'new-project' }),
            href: '/',
        },
    ];

    React.useEffect(() => {
        setBreadCrumbItems(breadCrumbItems);
        return () => setBreadCrumbItems([]);
    }, [setBreadCrumbItems, title]);

    React.useEffect(() => {
        if (!isSubmitting) setTimeout(() => triggerNavBarSaving(isSubmitting), 1000);
        else triggerNavBarSaving(isSubmitting);
    }, [isSubmitting]);

    const onValidFormChange = debounce((values: FormValues) => {
        onSubmit(values);
    }, 500);

    React.useEffect(() => {
        watch((value, { name }) => {
            if (
                name === 'visibility' &&
                !value?.restrictedViewerGroups?.length &&
                value?.visibility?.labels?.[0] === 'CUSTOM'
            )
                return;
            if (name === 'publishedAt' && !value.publishedAt) return;
            if (name === 'addressText') return;
            if (name === 'isExternal' && value.isExternal) {
                setValue('externalLink', value.externalLink || '', { shouldTouch: true });
                return;
            }
            if (value.isExternal && !value.externalLink) {
                trigger('externalLink');
                return;
            }

            onValidFormChange(getValues());
        });
    }, [watch]);

    return (
        <Flex
            as="form"
            id={formName}
            onSubmit={handleSubmit(onSubmit)}
            direction="column"
            alignItems="flex-start"
            spacing={6}>
            <FormProvider {...methods}>
                <Flex direction="row" width="100%" spacing={6}>
                    <Flex direction="column" spacing={6} width="70%">
                        <ProjectConfigFormGeneral query={query} />
                        <ProjectConfigFormSteps />
                    </Flex>
                    <Flex direction="column" spacing={6} width="30%">
                        <ProjectConfigFormSide query={query} project={project} />
                    </Flex>
                </Flex>
            </FormProvider>
        </Flex>
    );
};

export default ProjectConfigForm;

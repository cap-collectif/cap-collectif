import * as React from 'react';
import {
    CapUIIcon,
    CapUIIconSize,
    Flex,
    FormControl,
    FormGuideline,
    FormLabel,
    Icon,
    Spinner,
    Text,
    Uploader as CapUIUploader,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import Papa from 'papaparse';
import AddEventsMutation from 'mutations/AddEventsMutation';
import {
    AddEventsInput,
    AddEventsMutationResponse,
    EventInput,
} from '@relay/AddEventsMutation.graphql';
import { HEADERS } from './EventImportModal';
import styled from 'styled-components';

type EventCsv = Omit<
    EventInput,
    'themes' | 'projects' | 'guestListEnabled' | 'enabled' | 'commentable'
> & {
    themes: string;
    projects: string;
    guestListEnabled: string;
    enabled: string;
    commentable: string;
};

type Results = AddEventsMutationResponse['addEvents'];

const headersAreValid = (headers: Array<string>): boolean =>
    JSON.stringify(headers) === JSON.stringify(HEADERS);

const prepareVariablesFromAnalyzedFile = (
    csvString: string,
    dryRun: boolean,
): AddEventsInput | null => {
    const result = Papa.parse<EventCsv>(csvString, { header: true });
    const fields = result.meta.fields;
    if (!!fields && !headersAreValid(fields)) {
        console.warn('File headers are not valid.');
        return null;
    }
    const events: Array<EventInput> = result.data
        .filter(event => event.title !== '')
        .map(event => {
            return {
                ...event,
                guestListEnabled: event.guestListEnabled === 'true',
                enabled: event.enabled === 'true',
                commentable: event.commentable === 'true',
                themes: event.themes.split('/')[0] === '' ? [] : event.themes.split('/'),
                projects: event.projects.split('/')[0] === '' ? [] : event.projects.split('/'),
            };
        });

    return {
        events,
        dryRun,
    };
};

type NotFoundMessageProps = {
    entity: ReadonlyArray<string | null>;
    translationKey: string;
};

const NotFoundMessage: React.FC<NotFoundMessageProps> = ({ entity, translationKey }) => {
    const intl = useIntl();
    return (
        <Flex direction="column" align="center">
            <Flex>
                <Icon name={CapUIIcon.Cross} color="red.500" size={CapUIIconSize.Md} />
                <Text ml={1} fontWeight={600}>
                    {intl.formatMessage({ id: translationKey }, { num: entity.length })}
                </Text>
            </Flex>
            {entity.map((name, key: number) => (
                <Text key={key}>{name}</Text>
            ))}
        </Flex>
    );
};

type ImportEventsFormProps = {
    loading: boolean;
    setLoading: (isLoading: boolean) => void;
    setData: (data: AddEventsInput) => void;
};

const Uploader = styled(CapUIUploader)`
    & > div {
        width: 100%;
    }
`;

const ImportEventsForm: React.FC<ImportEventsFormProps> = ({ setData }) => {
    const intl = useIntl();
    const [results, setResults] = React.useState<Results>(null);
    const [loading, setLoading] = React.useState(false);

    const importedEvents = results?.importedEvents;
    const brokenDates = results?.brokenDates;
    const notFoundProjects = results?.notFoundProjects;
    const notFoundThemes = results?.notFoundThemes;
    const notFoundEmails = results?.notFoundEmails;

    return (
        <Flex as="form" align="center">
            <FormControl mt={1} mb={2}>
                <FormLabel label={intl.formatMessage({ id: 'import-your-list' })} />
                <FormGuideline>
                    {intl.formatMessage({ id: 'uploader.banner.format' }) +
                        ' csv. ' +
                        intl.formatMessage({ id: 'uploader.banner.weight' }) +
                        ' 10mo.'}
                </FormGuideline>
                <Uploader
                    format=".csv"
                    onDrop={(acceptedFiles: File[]) => {
                        acceptedFiles.forEach(file => {
                            const reader = new window.FileReader();
                            reader.readAsText(file);
                            setLoading(true);
                            reader.onloadend = () => {
                                const result = reader.result as string;
                                const variables = prepareVariablesFromAnalyzedFile(result, true);
                                if (variables) {
                                    setData(variables);
                                    return AddEventsMutation.commit({ input: variables }).then(
                                        (response: AddEventsMutationResponse) => {
                                            if (response.addEvents) {
                                                setLoading(false);
                                                setResults(response.addEvents);
                                            }
                                        },
                                    );
                                }
                            };
                        });
                    }}
                    wording={{
                        fileDeleteLabel: intl.formatMessage({ id: 'admin.global.delete' }),
                        uploaderPrompt: intl.formatMessage(
                            { id: 'uploader-prompt' },
                            { count: 1, fileType: 'csv' },
                        ),
                        uploaderLoadingPrompt: intl.formatMessage({
                            id: 'page-media-add--loading',
                        }),
                    }}
                />

                {loading && (
                    <Flex justifyContent="center" mt={4}>
                        <Spinner size={CapUIIconSize.Lg} />
                    </Flex>
                )}

                <Flex direction="column" align="center" mt={4} spacing={2}>
                    {importedEvents && (
                        <Flex>
                            <Icon
                                name={CapUIIcon.Check}
                                color="green.500"
                                size={CapUIIconSize.Md}
                            />
                            <Text ml={1} fontWeight={600}>
                                {intl.formatMessage(
                                    { id: 'count-events-found' },
                                    { num: importedEvents?.length },
                                )}
                            </Text>
                        </Flex>
                    )}
                    {brokenDates && brokenDates.length > 0 && (
                        <NotFoundMessage
                            entity={brokenDates}
                            translationKey="count-untraceable-dates"
                        />
                    )}
                    {notFoundEmails && notFoundEmails.length > 0 && (
                        <NotFoundMessage
                            entity={notFoundEmails}
                            translationKey="count-untraceable-users"
                        />
                    )}
                    {notFoundProjects && notFoundProjects.length > 0 && (
                        <NotFoundMessage
                            entity={notFoundProjects}
                            translationKey="count-untraceable-projects"></NotFoundMessage>
                    )}
                    {notFoundThemes && notFoundThemes.length > 0 && (
                        <NotFoundMessage
                            entity={notFoundThemes}
                            translationKey="count-untraceable-themes"
                        />
                    )}
                </Flex>
            </FormControl>
        </Flex>
    );
};

export default ImportEventsForm;

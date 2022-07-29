import * as React from 'react';
import { FormattedHTMLMessage, IntlShape, useIntl } from 'react-intl';
import {
    Button,
    ButtonGroup,
    CapUIModalSize,
    Heading,
    Modal,
    toast,
    Text,
    Box,
} from '@cap-collectif/ui';
import ImportEventsForm from './ImportEventsForm';
import AddEventsMutation from 'mutations/AddEventsMutation';
import { AddEventsInput } from '@relay/AddEventsMutation.graphql';

export const HEADERS = [
    'title',
    'body',
    'authorEmail',
    'startAt',
    'endAt',
    'guestListEnabled',
    'address',
    'zipCode',
    'city',
    'country',
    'themes',
    'projects',
    'enabled',
    'commentable',
    'metaDescription',
    'customCode',
    'link',
];

const EXAMPLE_ROW = [
    "Titre de l'event",
    "Contenu de l'event",
    'admin@cap-collectif.com',
    '2010-05-20 00:00:00',
    '2010-07-24 00:00:00',
    'true',
    '25 rue claude tillier',
    '75012',
    'Paris',
    'France',
    'titre du theme1/titre du theme2',
    'titre du projet1/titre du projet2',
    'true',
    'true',
    '',
    '',
    '',
];

const csvData = encodeURI(`${HEADERS.join(';')}\n${EXAMPLE_ROW.join(';')}`);

export const onSubmit = (data: AddEventsInput, onClose: () => void, intl: IntlShape) => {
    const input = {
        ...data,
        dryRun: false,
    };
    return AddEventsMutation.commit({ input }).then(() => {
        onClose();
        toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'events-successfully-imported' }),
        });
    });
};

const EventImportModal: React.FC = () => {
    const intl = useIntl();
    const [data, setData] = React.useState<AddEventsInput>();
    const [loading, setLoading] = React.useState(false);

    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'modal-add-events-via-file' })}
            onClose={() => {
                setLoading(false);
                setData(undefined);
            }}
            disclosure={
                <Button
                    id="AdminImportEventsButton-import"
                    variant="secondary"
                    variantColor="hierarchy"
                    variantSize="small"
                    mr={6}>
                    {intl.formatMessage({ id: 'import' })}
                </Button>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading id="contained-modal-title-lg">
                            <Text>{intl.formatMessage({ id: 'modal-add-events-via-file' })}</Text>
                        </Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Box mb={6}>
                            <Text mb={2}>
                                {intl.formatMessage({ id: 'import-events-helptext' })}
                            </Text>
                            <Text
                                sx={{
                                    a: { color: 'blue.500' },
                                }}>
                                <FormattedHTMLMessage
                                    id="csv-file-helptext"
                                    values={{
                                        link: `data:text/csv;charset=utf-8,${csvData}`,
                                    }}
                                />
                            </Text>
                        </Box>
                        <ImportEventsForm
                            setData={setData}
                            loading={loading}
                            setLoading={setLoading}
                        />
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
                                id="AdminImportEventsButton-submit"
                                variantSize="medium"
                                variant="primary"
                                variantColor="primary"
                                disabled={!data}
                                onClick={async () => {
                                    if (data) {
                                        await onSubmit(data, hide, intl);
                                    }
                                }}>
                                {intl.formatMessage({ id: 'import' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default EventImportModal;

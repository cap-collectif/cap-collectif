import { FC } from 'react';
import { Flex } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import IdentificationCodesListsTable from './Table/IdentificationCodesListsTable';
import IdentificationCodesListCreationModal from './CreationModal/IdentificationCodesListCreationModal';
import { Section } from '@ui/Section';
import HelpButton from './HelpButton';

export type IdentificationCodesListType = {
    id: string;
    name: string;
    codesCount: number;
    alreadyUsedCount: number;
};

const IdentificationCodesLists: FC<{
    lists: Array<{ node: IdentificationCodesListType }>;
    connectionName: string;
}> = ({ lists, connectionName }) => {
    const intl = useIntl();

    return (
        <Section direction="row">
            <Flex direction="column" my={1} pr={2} width="50%">
                <Section.Title>
                    {intl.formatMessage({ id: 'identification-code-check' })}
                </Section.Title>
                <Section.Description my={1}>
                    {intl.formatMessage({ id: 'identification-code-check-help' })}
                </Section.Description>
                <Flex mt={6}>
                    <IdentificationCodesListCreationModal
                        connectionName={connectionName}
                        isFirst={false}
                    />
                    <HelpButton />
                </Flex>
            </Flex>
            <IdentificationCodesListsTable lists={lists} connectionName={connectionName} />
        </Section>
    );
};

export default IdentificationCodesLists;

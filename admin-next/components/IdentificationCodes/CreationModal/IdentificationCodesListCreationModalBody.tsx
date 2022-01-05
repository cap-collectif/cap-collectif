import { CreateUserIdentificationCodeListMutationResponse } from '@relay/CreateUserIdentificationCodeListMutation.graphql';
import { FC } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import {
    CapUISpotIcon,
    CapUISpotIconSize,
    Flex,
    headingStyles,
    Modal,
    SpotIcon,
    Text,
} from '@cap-collectif/ui';
import { DataType } from '../DataType';
import IdentificationCodesListCreationModalForm from './IdentificationCodesListCreationModalForm';

const IdentificationCodesListCreationModalBodyAfterResponse: FC<{
    response: CreateUserIdentificationCodeListMutationResponse;
}> = ({ response }) => {
    const intl = useIntl();

    return (
        <Flex direction="column" align="center">
            <SpotIcon name={CapUISpotIcon.CODES} size={CapUISpotIconSize.Lg} />
            <Text {...headingStyles.h4} my={1} textAlign="center" color="gray.900">
                <FormattedHTMLMessage
                    id={'identification-codes-associated-to-each-one'}
                    values={{
                        count: response.createUserIdentificationCodeList.userIdentificationCodeList
                            .codesCount,
                    }}
                />
            </Text>
            <Text {...headingStyles.h4} textAlign="center" color="gray.900">
                {intl.formatMessage({
                    id: 'download-and-send-codes-before-enable',
                })}
            </Text>
        </Flex>
    );
};

const IdentificationCodesListCreationModalBody: FC<{
    response: CreateUserIdentificationCodeListMutationResponse;
    data: DataType;
    setData: (data: DataType) => void;
    setName: (name: string) => void;
}> = ({ response, data, setData, setName }) => {
    return (
        <Modal.Body align="center">
            {response?.createUserIdentificationCodeList?.userIdentificationCodeList ? (
                <IdentificationCodesListCreationModalBodyAfterResponse response={response} />
            ) : (
                <IdentificationCodesListCreationModalForm
                    data={data}
                    setData={setData}
                    setName={setName}
                />
            )}
        </Modal.Body>
    );
};

export default IdentificationCodesListCreationModalBody;

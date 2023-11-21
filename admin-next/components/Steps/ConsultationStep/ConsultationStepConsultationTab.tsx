import React, {useRef} from 'react';
import { Box, Tabs } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { graphql, useFragment } from 'react-relay';
import ConsultationModel from '@components/Steps/ConsultationStep/ConsultationModel';
import ConsultationForm from '@components/Steps/ConsultationStep/ConsultationForm';
import { ConsultationStepConsultationTab_query$key } from '@relay/ConsultationStepConsultationTab_query.graphql';
import { UseFieldArrayRemove } from 'react-hook-form/dist/types/fieldArray';
import {
    FormValues,
    getDefaultSection,
} from '@components/Steps/ConsultationStep/ConsultationStepForm';
import useUrlState from "../../../hooks/useUrlState";

const QUERY_FRAGMENT = graphql`
    fragment ConsultationStepConsultationTab_query on Query {
        ...ConsultationModel_query
    }
`;

type Props = {
    consultationIndex: number;
    removeConsultation: UseFieldArrayRemove;
    query: ConsultationStepConsultationTab_query$key;
};

const ConsultationStepConsultationTab: React.FC<Props> = ({
    consultationIndex,
    removeConsultation,
    query: queryRef,
}) => {

    const [operationType] = useUrlState('operationType', 'EDIT');
    const isEditing = operationType === 'EDIT';

    const ConsultationCreationTypeEnum = {
        NEW: `NEW-${consultationIndex}`,
        MODEL: `MODEL-${consultationIndex}`,
    };

    const query = useFragment(QUERY_FRAGMENT, queryRef);

    const intl = useIntl();
    const { setValue, watch } = useFormContext<FormValues>();

    const consultationFormKey = `consultations.${consultationIndex}` as `consultations.${number}`;
    const sectionsFormKey = `${consultationFormKey}.sections` as `consultations.${number}.sections`;

    const [previousSelectedTab, setPreviousSelectedTab] = React.useState(
        ConsultationCreationTypeEnum.NEW,
    );

    // we store the current NEW tab consultation in a ref to not lose the value when switching with model tab
    const newTabConsultationRef = useRef(null);
    const modelTabConsultationRef = useRef(null);
    const consultation = watch(consultationFormKey);

    if (isEditing) {
        return (
            <Box
                id={`consultation-${consultationIndex}`}
                p={4}
                bg="gray.100"
                borderRadius={8}
                mb={4}>
                <ConsultationForm
                    consultationIndex={consultationIndex}
                    consultationFormKey={consultationFormKey}
                    sectionsFormKey={sectionsFormKey}
                    removeConsultation={removeConsultation}
                />
            </Box>
        );
    }

    return (
        <>
            <Tabs
                id={`consultation-${consultationIndex}`}
                mb={6}
                selectedId={ConsultationCreationTypeEnum.NEW}
                onChange={selectedTab => {
                    if (
                        previousSelectedTab === ConsultationCreationTypeEnum.MODEL &&
                        selectedTab === ConsultationCreationTypeEnum.NEW
                    ) {
                        modelTabConsultationRef.current = consultation;
                        setValue(`${consultationFormKey}`, newTabConsultationRef?.current);
                    }
                    if (
                        previousSelectedTab === ConsultationCreationTypeEnum.NEW &&
                        selectedTab === ConsultationCreationTypeEnum.MODEL
                    ) {
                        if (consultation.model === null) {
                            newTabConsultationRef.current = consultation;
                            setValue(`${consultationFormKey}`, modelTabConsultationRef?.current);
                        }
                    }
                    setPreviousSelectedTab(selectedTab);
                }}>
                <Tabs.ButtonList ariaLabel="consultationType">
                    <Tabs.Button id={ConsultationCreationTypeEnum.NEW}>
                        {intl.formatMessage({ id: 'global.new' })}
                    </Tabs.Button>
                    <Tabs.Button id={ConsultationCreationTypeEnum.MODEL}>
                        {intl.formatMessage({ id: 'from_model' })}
                    </Tabs.Button>
                </Tabs.ButtonList>
                <Tabs.PanelList>
                    <Tabs.Panel>
                        <ConsultationForm
                            consultationIndex={consultationIndex}
                            consultationFormKey={consultationFormKey}
                            sectionsFormKey={sectionsFormKey}
                            removeConsultation={removeConsultation}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel>
                        <ConsultationModel query={query} consultationFormKey={consultationFormKey}>
                            <ConsultationForm
                                consultationIndex={consultationIndex}
                                consultationFormKey={consultationFormKey}
                                sectionsFormKey={sectionsFormKey}
                                removeConsultation={removeConsultation}
                            />
                        </ConsultationModel>
                    </Tabs.Panel>
                </Tabs.PanelList>
            </Tabs>
        </>
    );
};

export default ConsultationStepConsultationTab;

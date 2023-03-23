import React from 'react';
import withPageAuthRequired from "@utils/withPageAuthRequired";
import {useRouter} from "next/router";
import Layout from "@components/Layout/Layout";
import {
    CapUIIconSize,
    Flex,
    Spinner,
} from "@cap-collectif/ui";
import QuestionnaireStepForm from "@components/Steps/QuestionnaireStep/QuestionnaireStepForm";

const UpdateQuestionnaireStepWrapper = () => {
    const router = useRouter();
    const projectId = router.query.projectId;
    const stepId = router.query.updateQuestionnaireStepId;

    if (!projectId || !stepId) return null;

    return (
        <Layout navTitle="">
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150"/>
                    </Flex>
                }>
                <QuestionnaireStepForm stepId={stepId as string}/>
            </React.Suspense>
        </Layout>
    )
}

export const getServerSideProps = withPageAuthRequired;

export default UpdateQuestionnaireStepWrapper;
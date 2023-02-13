import React from 'react';
import withPageAuthRequired from "@utils/withPageAuthRequired";
import {useRouter} from "next/router";
import Layout from "@components/Layout/Layout";
import {
    CapUIIconSize,
    Flex,
    Spinner,
} from "@cap-collectif/ui";
import DebateStepForm from "@components/Steps/DebateStep/DebateStepForm";

const UpdateDebateStepWrapper = () => {
    const router = useRouter();
    const projectId = router.query.projectId;
    const stepId = router.query.updateDebateStepId;

    if (!projectId || !stepId) return null;

    return (
        <Layout navTitle="">
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150"/>
                    </Flex>
                }>
                <DebateStepForm stepId={stepId as string}/>
            </React.Suspense>
        </Layout>
    )
}

export const getServerSideProps = withPageAuthRequired;

export default UpdateDebateStepWrapper;
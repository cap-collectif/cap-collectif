import React from 'react';
import withPageAuthRequired from "@utils/withPageAuthRequired";
import {useRouter} from "next/router";
import Layout from "@components/Layout/Layout";
import {
    CapUIIconSize,
    Flex,
    Spinner,
} from "@cap-collectif/ui";
import OtherStepForm from "@components/Steps/OtherStep/OtherStepForm";

const UpdateOtherStepWrapper = () => {
    const router = useRouter();
    const stepId = router.query.updateOtherStepId;

    if (!stepId) return null;

    return (
        <Layout navTitle="">
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150"/>
                    </Flex>
                }>
                <OtherStepForm stepId={stepId as string}/>
            </React.Suspense>
        </Layout>
    )
}

export const getServerSideProps = withPageAuthRequired;

export default UpdateOtherStepWrapper;
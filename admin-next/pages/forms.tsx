import * as React from 'react';
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui';
import Layout from '../components/Layout/Layout';
import { NextPage } from 'next';
import { PageProps } from '../types';
import { useIntl } from 'react-intl';
import withPageAuthRequired from '@utils/withPageAuthRequired';
import FormListQuery from "../components/Forms/FormListQuery";
import useFeatureFlag from "@hooks/useFeatureFlag";

const Forms: NextPage<PageProps> = () => {
    const intl = useIntl();
    const isNewProjectCreateEnabled = useFeatureFlag('unstable__new_create_project');
    if (!isNewProjectCreateEnabled) {
        throw new Error('You need to enable unstable__new_create_project feature to access this page.')
    }

    return (
        <Layout navTitle={intl.formatMessage({ id: 'global.formulaire' })}>
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                    </Flex>
                }
            >
                <FormListQuery />
            </React.Suspense>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;
export default Forms;

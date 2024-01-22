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

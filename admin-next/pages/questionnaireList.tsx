import * as React from 'react';
import { useIntl } from 'react-intl';
import { Flex, CapUIIconSize, Spinner } from '@cap-collectif/ui';
import { NextPage } from 'next';
import withPageAuthRequired from '../utils/withPageAuthRequired';
import { PageProps } from '../types';
import Layout from '../components/Layout/Layout';
import QuestionnaireListQuery from '../components/QuestionnaireList/QuestionnaireListQuery';

const QuestionnaireList: NextPage<PageProps> = () => {
    const intl = useIntl();

    return (
        <Layout navTitle={intl.formatMessage({ id: 'global.questionnaire' })}>
            <React.Suspense
                fallback={
                    <Flex alignItems="center" justifyContent="center">
                        <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
                    </Flex>
                }>
                <QuestionnaireListQuery />
            </React.Suspense>
        </Layout>
    );
};

export const getServerSideProps = withPageAuthRequired;

export default QuestionnaireList;

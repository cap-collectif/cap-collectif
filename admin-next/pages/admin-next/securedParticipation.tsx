import { NextPage } from 'next'
import { PageProps } from 'types'
import React, { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/Layout/Layout'
import { useIntl } from 'react-intl'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import SectionSms from '@components/SecuredParticipation/SectionSMS/SectionSms'
import SectionIdentificationCodes from '@components/SecuredParticipation/SectionIdentificationCodes/SectionIdentificationCodes'

const SecuredParticipation: NextPage<PageProps> = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'secured-participation' })}>
      <Flex direction="column" spacing={6}>
        <Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <SectionSms />
        </Suspense>
        <Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <SectionIdentificationCodes />
        </Suspense>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default SecuredParticipation

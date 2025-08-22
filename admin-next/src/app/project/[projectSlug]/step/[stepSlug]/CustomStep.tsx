'use client'

import React, { FC, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { pageProjectCustomStepMetadataQuery$data } from '@relay/pageProjectCustomStepMetadataQuery.graphql'
import { evalCustomCode } from 'src/app/custom-code'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { Box, Flex } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  prefetchedStep: pageProjectCustomStepMetadataQuery$data['step']
}

export const CustomStep: FC<Props> = ({ prefetchedStep: step }) => {
  const intl = useIntl()
  const { setBreadCrumbItems } = useNavBarContext()

  const { customCode, project, label } = step

  useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  React.useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: intl.formatMessage({ id: 'global.project.label' }), href: '/projects', showOnMobile: true },
      { title: project?.title, href: project?.url || '' },
      { title: label, href: '' },
    ])
  }, [setBreadCrumbItems, project, label, intl])

  return (
    <Box backgroundColor="neutral-gray.100" borderTop="1px solid" borderTopColor="neutral-gray.lighter" py="xxl">
      <Flex maxWidth={pxToRem(1280)} margin="auto">
        OK
      </Flex>
    </Box>
  )
}
export default CustomStep

'use client'

import { Accordion, Box, CapUIAccordionColor, CapUIFontSize, CapUILineHeight, Flex, Text } from '@cap-collectif/ui'
import { pageContactContentQuery$data } from '@relay/pageContactContentQuery.graphql'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { evalCustomCode } from '../custom-code'
import PageHeading from '@components/FrontOffice/PageHeading/PageHeading'
import ContactForm from '@components/FrontOffice/Contact/ContactForm'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type Props = {
  data: pageContactContentQuery$data
}

export const Contact: FC<Props> = ({ data }) => {
  const intl = useIntl()
  const { contactPageTitle, description, contactForms, customCode } = data

  useEffect(() => {
    evalCustomCode(customCode?.value)
  }, [customCode])

  const isMultiForm = contactForms.length > 1

  return (
    <Box px={[0, 6]} py={[0, 'xxl']}>
      <Flex maxWidth={pxToRem(1280)} width="100%" margin="auto" justify="space-between" direction={['column', 'row']}>
        <PageHeading
          display="flex"
          mode="large"
          title={contactPageTitle?.value}
          flex="1 1 0"
          subtitle={description?.value}
        />
        <Box flex="1 1 0">
          <Flex px={['md', 'xxl']} py={['xl', 'xxl']} direction="column" gap="lg">
            {contactForms.map((contactForm, idx) => {
              const renderForm = () => (
                <>
                  {contactForm.body ? (
                    <Text fontSize={CapUIFontSize.BodyRegular} mt="xs" as="div">
                      <WYSIWYGRender value={contactForm.body} />
                    </Text>
                  ) : null}
                  <Box
                    fontSize={CapUIFontSize.BodySmall}
                    lineHeight={CapUILineHeight.S}
                    my="lg"
                    mt={contactForm.body ? 'lg' : 'xs'}
                  >
                    {intl.formatMessage({ id: 'form.fields_mandatory_without_mention' })}
                  </Box>
                  <ContactForm form={contactForm} />
                </>
              )
              return isMultiForm ? (
                <Accordion
                  key={contactForm.id}
                  color={CapUIAccordionColor.white}
                  defaultAccordion={!idx && contactForm.id}
                >
                  <Accordion.Item id={contactForm.id}>
                    <Accordion.Button>{contactForm.title}</Accordion.Button>
                    <Accordion.Panel>{renderForm()}</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              ) : (
                <Box key={contactForm.id}>{renderForm()}</Box>
              )
            })}
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default Contact

import { FC, useCallback, useState } from 'react'
import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIIcon,
  Flex,
  FormGuideline,
  FormLabel,
  Icon,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { UPLOAD_PATH } from '@utils/config'
import CarrouselSelects from './CarrouselSelects'
import {
  getCardLabel,
  MAX_DESC_LENGTH,
  MAX_HIGHLIGHTED_DESC_LENGTH,
  MAX_HIGHLIGHTED_TITLE_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_TITLE_LENGTH,
  SectionType,
} from './Carrousel.utils'

export const CarrouselItem: FC<{ fieldBaseName: string; onDelete: () => void; type: SectionType }> = ({
  fieldBaseName,
  onDelete,
  type: sectionType,
}) => {
  const intl = useIntl()
  const { watch, control } = useFormContext()
  const { title, description, type, image, isDisplayed, id, defaultIsOpen } = watch(fieldBaseName)
  const [isOpen, setIsOpen] = useState(!id || defaultIsOpen)

  const titleKey = `${fieldBaseName}.title`
  const descKey = `${fieldBaseName}.description`
  const imageKey = `${fieldBaseName}.image`
  const btnKey = `${fieldBaseName}.buttonLabel`
  const linkKey = `${fieldBaseName}.redirectLink`
  const isDisplayedKey = `${fieldBaseName}.isDisplayed`

  // TODO: Update DS Select to get ref for focus
  const focusInputRef = useCallback(node => {
    setTimeout(() => {
      if (node) {
        node.querySelector('.cap-async-select__input')?.focus()
      }
    }, 10)
  }, [])

  if (isOpen)
    return (
      <Flex
        p={6}
        bg="gray.100"
        borderRadius="accordion"
        mt={4}
        justifyContent="space-between"
        alignItems="start"
        spacing={4}
        ref={focusInputRef}
      >
        <Box width="100%">
          <CarrouselSelects fieldBaseName={fieldBaseName} sectionType={sectionType} />
          <Flex spacing={6} alignItems="start" width="100%">
            <Flex direction="column" width={sectionType === 'carrouselHighlighted' ? '70%' : '100%'}>
              <FormControl name={titleKey} control={control} isRequired={isDisplayed} autoFocus={false}>
                <FormLabel htmlFor={titleKey} label={intl.formatMessage({ id: 'global.title' })} />
                <FieldInput
                  autoFocus={false}
                  id={titleKey}
                  name={titleKey}
                  control={control}
                  type="text"
                  placeholder={intl.formatMessage({
                    id: 'carrousel.placeholder.title',
                  })}
                  maxLength={sectionType === 'carrousel' ? MAX_TITLE_LENGTH : MAX_HIGHLIGHTED_TITLE_LENGTH}
                />
              </FormControl>
              <FormControl name={descKey} control={control}>
                <FormLabel htmlFor={descKey} label={intl.formatMessage({ id: 'global.description' })}>
                  <Box color="gray.500">{intl.formatMessage({ id: 'global.optional' })}</Box>
                </FormLabel>
                <FieldInput
                  id={descKey}
                  name={descKey}
                  control={control}
                  type={sectionType === 'carrousel' ? 'text' : 'textarea'}
                  placeholder={intl.formatMessage({
                    id: 'carrousel.placeholder.description',
                  })}
                  maxLength={sectionType === 'carrousel' ? MAX_DESC_LENGTH : MAX_HIGHLIGHTED_DESC_LENGTH}
                />
              </FormControl>
              {type === 'CUSTOM' ? (
                <Flex gap={4}>
                  <FormControl name={btnKey} control={control} isRequired={isDisplayed}>
                    <FormLabel htmlFor={btnKey} label={intl.formatMessage({ id: 'section.button_label' })} />
                    <FieldInput
                      id={btnKey}
                      name={btnKey}
                      control={control}
                      type="text"
                      placeholder={intl.formatMessage({
                        id: 'carrousel.placeholder.btn',
                      })}
                      maxLength={MAX_LABEL_LENGTH}
                    />
                  </FormControl>
                  <FormControl name={linkKey} control={control} isRequired={isDisplayed}>
                    <FormLabel htmlFor={linkKey} label={intl.formatMessage({ id: 'section.redirect_link' })} />
                    <FieldInput
                      id={linkKey}
                      name={linkKey}
                      control={control}
                      type="text"
                      placeholder={intl.formatMessage({
                        id: 'carrousel.placeholder.link',
                      })}
                    />
                  </FormControl>
                </Flex>
              ) : null}
              <Flex justify="space-between" alignItems="center" width="100%" flexWrap="wrap" gap={1}>
                <FormControl name={isDisplayedKey} control={control} marginBottom={0} width="auto">
                  <FieldInput
                    id={isDisplayedKey}
                    type="switch"
                    name={isDisplayedKey}
                    control={control}
                    direction="row-reverse"
                  >
                    {intl.formatMessage({ id: 'section.display_item' })}
                  </FieldInput>
                </FormControl>
                <Button
                  variantColor="danger"
                  variant="tertiary"
                  leftIcon={CapUIIcon.TrashO}
                  type="button"
                  onClick={onDelete}
                >
                  {intl.formatMessage({ id: 'global.delete' })}
                </Button>
              </Flex>
            </Flex>
            <FormControl name={imageKey} control={control} width="auto" key={image?.id}>
              <FormLabel
                htmlFor={imageKey}
                label={intl.formatMessage({ id: sectionType === 'carrousel' ? 'illustration' : 'image.header' })}
              >
                {sectionType === 'carrouselHighlighted' ? (
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                ) : null}
              </FormLabel>
              {sectionType === 'carrouselHighlighted' ? (
                <FormGuideline>
                  {intl.formatMessage({ id: 'supported.format.listed' }, { format: 'jpg, png' })}{' '}
                  {intl.formatMessage({ id: 'specific-max-weight' }, { weight: '1mo' })}
                  {intl.formatMessage({ id: 'specific-ratio' }, { ratio: '4:3' })}
                </FormGuideline>
              ) : null}
              <FieldInput
                id={imageKey}
                name={imageKey}
                control={control}
                type="uploader"
                format=".jpg,.jpeg,.png,.svg"
                maxSize={1000000}
                size={UPLOADER_SIZE.MD}
                showThumbnail
                uploadURI={UPLOAD_PATH}
              />
            </FormControl>
          </Flex>
        </Box>
        <ButtonQuickAction
          type="button"
          icon={CapUIIcon.ArrowUp}
          variantColor="gray"
          onClick={() => setIsOpen(false)}
          label={intl.formatMessage({ id: 'global.close' })}
        />
      </Flex>
    )

  return (
    <Flex
      spacing={6}
      mt={4}
      justifyContent="space-between"
      alignItems="center"
      bg="gray.100"
      borderRadius="accordion"
      py={4}
      pr={6}
      pl={2}
    >
      <Flex alignItems="center">
        <Icon name={CapUIIcon.Drag} color="neutral-gray.700" />
        {image?.url ? (
          <Box
            flex="none"
            as="img"
            width="100px"
            height="70px"
            src={image?.url}
            borderRadius="normal"
            ml={2}
            mr={6}
            sx={{ objectFit: 'cover' }}
          />
        ) : null}
        <Box>
          <Box fontSize={1}>{intl.formatMessage({ id: getCardLabel(type) })}</Box>
          <Text as="h4" fontWeight="semibold">
            {title}
          </Text>
          <Text lineHeight="initial">{description}</Text>
        </Box>
      </Flex>
      <ButtonQuickAction
        icon={CapUIIcon.ArrowDown}
        variantColor="gray"
        onClick={() => setIsOpen(true)}
        label={intl.formatMessage({ id: 'global.edit' })}
        type="button"
      />
    </Flex>
  )
}

export default CarrouselItem

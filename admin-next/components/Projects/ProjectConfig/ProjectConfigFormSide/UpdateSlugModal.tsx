import React from 'react'
import { graphql, useFragment } from 'react-relay'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import type { UpdateSlugModal_project$key } from '@relay/UpdateSlugModal_project.graphql'
import { useForm } from 'react-hook-form'
import {
  Box,
  Modal,
  Text,
  Flex,
  toast,
  CapUIModalSize,
  Button,
  FormLabel,
  ButtonGroup,
  CapUIIcon,
  Heading,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import UpdateProjectSlugMutation from '@mutations/UpdateProjectSlugMutation'

const FRAGMENT = graphql`
  fragment UpdateSlugModal_project on Project {
    slug
    url
    id
  }
`

type Props = {
  project: UpdateSlugModal_project$key
  onClose: () => void
}

type FormValues = {
  slug: string
  agree: boolean
}

const formName = 'update-slug-form'

const UpdateSlugModal = ({ project: projectFragment, onClose }: Props) => {
  const project = useFragment(FRAGMENT, projectFragment)
  const intl = useIntl()
  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { slug: project.slug, agree: false },
  })

  const onSubmit = (formValues: FormValues) => {
    const input = {
      projectId: project.id,
      slug: formValues.slug,
    }
    return UpdateProjectSlugMutation.commit({ input }).then(response => {
      onClose()
      if (response.updateProjectSlug?.errorCode) {
        return mutationErrorToast(intl)
      }
      toast({
        variant: 'success',
        content: intl.formatMessage({
          id: 'your-slug-has-been-updated',
        }),
      })
    })
  }
  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods

  const agree = watch('agree')
  const slug = watch('slug')

  const disabledSubmitButton = !agree || !slug

  if (!project) return null

  return (
    <form id={formName} onSubmit={handleSubmit(onSubmit)}>
      <Modal
        show
        onClose={onClose}
        ariaLabel={intl.formatMessage({ id: 'update-project-slug' })}
        size={CapUIModalSize.Lg}
      >
        <Modal.Header borderBottom="normal" borderColor="gray.200" pb={6}>
          <Heading>{intl.formatMessage({ id: 'update-project-slug' })}</Heading>
        </Modal.Header>
        <Modal.Body height="auto">
          <Box mb={4}>
            <Text>{intl.formatMessage({ id: 'my-permalink' })}</Text>
            <Text color="gray.500">{project?.url}</Text>
          </Box>

          <Box mb={2}>
            <Text fontWeight={700}>{intl.formatMessage({ id: 'update-slug-consequences' })}</Text>
            <ul>
              <Box as="li" mx={8} my={4}>
                <FormattedHTMLMessage id="project-urls-will-no-longer-work" />
              </Box>
              <Box as="li" mx={8} my={4}>
                <FormattedHTMLMessage id="data-related-to-this-slug-will-be-lost" values={{ slug: project?.slug }} />
              </Box>
            </ul>
          </Box>
          <Flex direction="column" mb={4}>
            <FormControl name="slug" control={control}>
              <FormLabel htmlFor="slug" label={intl.formatMessage({ id: 'my-slug' })} />
              <FieldInput name="slug" type="text" control={control} />
            </FormControl>
          </Flex>

          <Flex mb={2} mr={2}>
            <FormControl name="agree" control={control}>
              <FieldInput id="agree" name="agree" type="checkbox" control={control}>
                {intl.formatMessage({ id: 'understood-cannot-cancel' })}
              </FieldInput>
            </FormControl>
          </Flex>
        </Modal.Body>
        <Modal.Footer justify="space-between" borderTop="normal" borderColor="gray.200" pt={6}>
          <Flex align="center">
            <Button
              leftIcon={CapUIIcon.Info}
              variant="tertiary"
              fontWeight={600}
              ml={1}
              onClick={() =>
                window.open('https://aide.cap-collectif.com/article/276-modification-du-lien-dun-projet', '_blank')
              }
            >
              {intl.formatMessage({ id: 'information' })}
            </Button>
          </Flex>
          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              variantSize="big"
              variantColor="hierarchy"
              onClick={() => onClose()}
            >
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={e => {
                handleSubmit((data: FormValues) => onSubmit(data))(e)
              }}
              disabled={disabledSubmitButton}
              isLoading={isSubmitting}
              variantSize="big"
            >
              {intl.formatMessage({ id: 'global.validate' })}
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    </form>
  )
}

export default UpdateSlugModal

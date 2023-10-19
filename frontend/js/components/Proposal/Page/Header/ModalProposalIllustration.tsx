import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { reduxForm, submit, Field } from 'redux-form'
import { connect } from 'react-redux'
import { Button, ButtonGroup, Box, Heading, toast, Modal, CapUIModalSize } from '@cap-collectif/ui'
import type { Dispatch } from '~/types'
import colors from '~/utils/colors'
import ResetCss from '~/utils/ResetCss'
import component from '~/components/Form/Field'
import UpdateProposalIllustrationMutation from '~/mutations/UpdateProposalIllustrationMutation'
import { ILLUSTRATION_MAX_SIZE } from '~/components/Proposal/Form/ProposalForm'
const formName = 'proposal-illustration'
type FormValues = {
  media?: any | null | undefined
}
type Props = ReduxFormFormProps & {
  readonly dispatch: Dispatch
  readonly show: boolean
  readonly onClose: () => void
  readonly initialValues: FormValues
  readonly proposalId: string
  readonly intl: IntlShape
}

const onSubmit = (values: FormValues, _dispatch, { proposalId, intl }: Props) => {
  const data = {
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    proposalId,
  }
  return UpdateProposalIllustrationMutation.commit({
    input: data,
  })
    .then(response => {
      if (!response.updateProposalIllustration) {
        throw new Error('Mutation "UpdateProposalIllustrationMutation" failed.')
      } else if (response.updateProposalIllustration.errorCode) {
        toast({
          variant: 'danger',
          content: intl.formatMessage({
            id: `proposalIllustration${response.updateProposalIllustration.errorCode}`,
          }),
        })
      }
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatMessage({
          id: 'global.error.server.form',
        }),
      })
    })
}

const ModalProposalIllustration = ({ show, onClose, dispatch, submitting, pristine, invalid }: Props): JSX.Element => {
  const intl = useIntl()
  return (
    <Modal
      baseId="proposal-illustration-modal"
      size={CapUIModalSize.Md}
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage({
        id: 'global.visitor.dynamic',
      })}
      width={['100%', '720px']}
    >
      <ResetCss>
        <Modal.Header paddingY={6} borderBottom={`1px solid ${colors.borderColor}`}>
          <Heading as="h4" color="blue.900">
            {intl.formatMessage({
              id: 'edit-cover-image',
            })}
          </Heading>
        </Modal.Header>
      </ResetCss>
      <Modal.Body spacing={5}>
        <form id={formName}>
          <Box backgroundColor="white" mb="48px">
            <Field
              maxSize={ILLUSTRATION_MAX_SIZE}
              id="proposal_media"
              name="media"
              component={component}
              type="image"
              help={<FormattedHTMLMessage id="illustration-help-text" />}
            />
          </Box>
        </form>
      </Modal.Body>
      <Modal.Footer
        as="div"
        display="flex"
        flex={1}
        justifyContent="flex-end"
        py={4}
        px={6}
        align={['stretch', 'center']}
        direction={['column', 'row']}
        borderTop="normal"
        borderColor="gray.200"
      >
        <ButtonGroup>
          <Button
            variant="secondary"
            variantSize="big"
            variantColor="primary"
            justifyContent="center"
            disabled={submitting}
            onClick={onClose}
          >
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            disabled={pristine || submitting || invalid}
            isLoading={submitting}
            justifyContent={['center', 'flex-start']}
            onClick={() => {
              dispatch(submit(formName))
              setTimeout(() => {
                onClose()
              }, 2000)
            }}
          >
            {intl.formatMessage({
              id: submitting ? 'global.publication' : 'global.publish',
            })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  )
}

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(ModalProposalIllustration)
export default connect<any, any>()(injectIntl(form))

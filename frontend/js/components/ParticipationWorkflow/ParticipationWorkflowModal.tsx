import { CapUIModalSize, MultiStepModal, clearToasts } from '@cap-collectif/ui'
import * as React from 'react'
import PhoneRequirementModal from './PhoneRequirementModal'
import PhoneConfirmationModal from './PhoneConfirmationModal'
import BirthdayRequirementModal from './BirthdayRequirementModal'
import AddressRequirementModal from './AddressRequirementModal'
import NamesRequirementModal from './NamesRequirementModal'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ParticipationWorkflowModalQuery } from '~relay/ParticipationWorkflowModalQuery.graphql'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'
import CookieMonster from '@shared/utils/CookieMonster'
import ContributionValidationModal from '~/components/ParticipationWorkflow/ContributionValidationModal'
import CheckboxesRequirementModal from '~/components/ParticipationWorkflow/CheckboxesRequirementModal'
import FranceConnectRequirementModal from '~/components/ParticipationWorkflow/FranceConnectRequirementModal'
import CaptchaModal from '~/components/ParticipationWorkflow/CaptchaModal'
import {
  ParticipationWorkflowContextProvider,
} from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import ZipCodeRequirementModal from '~/components/ParticipationWorkflow/ZipCodeRequirementModal'
import { FormProvider, useForm } from 'react-hook-form'
import { AddressComplete } from '@cap-collectif/form'
import EmailParticipantForm from '~/components/ParticipationWorkflow/EmailParticipantForm'
import EmailParticipantCheckEmail from '~/components/ParticipationWorkflow/EmailParticipantCheckEmail'
import LoginChoices from '~/components/ParticipationWorkflow/LoginChoices'
import EmailAccountLoginForm from '~/components/ParticipationWorkflow/EmailAccountLoginForm'
import EmailAccountLoginSSOForm from '~/components/ParticipationWorkflow/EmailAccountLoginSSOForm'
import EmailMagicLinkForm from '~/components/ParticipationWorkflow/EmailMagicLinkForm'
import EmailMagicLinkCheckEmail from '~/components/ParticipationWorkflow/EmailMagicLinkCheckEmail'
import EmailParticipantCaptcha from '~/components/ParticipationWorkflow/EmailParticipantCaptcha'
import EmailMagicLinkCaptcha from '~/components/ParticipationWorkflow/EmailMagicLinkCaptcha'
import ModalSkeleton from '~/components/ParticipationWorkflow/ModalSkeleton'
import { useIntl } from 'react-intl'
import ConsentInternalCommunicationEmailModal
  from '~/components/ParticipationWorkflow/ConsentInternalCommunicationEmailModal'
import ConsentInternalCommunicationModal from '~/components/ParticipationWorkflow/ConsentInternalCommunicationModal'
import { useEffect } from 'react'
import { onUnload } from '~/components/Reply/Form/ReplyForm'
import IdentificationCodeRequirementModal from '~/components/ParticipationWorkflow/IdentificationCodeRequirementModal'
import ConsentPrivacyPolicyRequirementModal
  from '~/components/ParticipationWorkflow/ConsentPrivacyPolicyRequirementModal'
import moment from 'moment'

type Props = {
  stepId: string
  contributionId: string
}

export type FormValues = {
  firstname: string
  lastname: string
  countryCode: string
  phone: string
  code: string
  address: string
  realAddress: AddressComplete
  birthday: moment.Moment
  zipCode: string
  checkboxes: {
    [requirementId: string]: boolean,
  }
  userIdentificationCode: string
  consentPrivacyPolicy: boolean
}

export const QUERY = graphql`
    query ParticipationWorkflowModalQuery($stepId: ID!, $participantToken: String, $isAuthenticated: Boolean!, $contributionId: ID!) {
        ...EmailMagicLinkCheckEmail_query
        ...EmailParticipantCheckEmail_query
        siteColors {
            ...EmailAccountLoginSSOForm_colors
        }
        step: node(id: $stepId) {
            ...on QuestionnaireStep {
                url
            }
            ...on SelectionStep {
                url
            }
            ...on CollectStep {
                url
            }
            ...on RequirementStep {
                requirements {
                    edges {
                        node {
                            __typename
                            ...on EmailVerifiedRequirement {
                                viewerValue @include(if: $isAuthenticated)
                                participantValue(token: $participantToken)
                            }
                            ...on FirstnameRequirement {
                                viewerValue @include(if: $isAuthenticated)
                                participantValue(token: $participantToken)
                            }
                            ...on LastnameRequirement {
                                viewerValue @include(if: $isAuthenticated)
                                participantValue(token: $participantToken)
                            }
                            ...on PhoneRequirement {
                                viewerValue @include(if: $isAuthenticated)
                                participantValue(token: $participantToken)
                            }
                            ...on IdentificationCodeRequirement {
                                viewerValue @include(if: $isAuthenticated)
                                participantValue(token: $participantToken)
                            }
                            ...on CheckboxRequirement {
                                id
                                label
                            }
                            viewerMeetsTheRequirement @include(if: $isAuthenticated)
                            participantMeetsTheRequirement(token: $participantToken)
                        }
                    }
                }
            }
        }
        contribution: node(id: $contributionId) {
            __typename
            ...on Reply {
                url
                requirementsUrl
                completionStatus
            }
            ...on ProposalVote {
                step {
                    url
                }
                requirementsUrl
                completionStatus
            }
        }
        siteImage(keyname: "image.logo" ) {
            media {
                url
                width
                height
            }
        }
        viewer @include(if: $isAuthenticated) {
            consentInternalCommunication
            email
        }
        participant(token: $participantToken) {
            consentInternalCommunication
            email
        }
    }
`

const getParticipantToken = (): string | null => {
  const encodedToken = CookieMonster.getParticipantCookie()
  return encodedToken ? window.atob(encodedToken) : null
}

const ParticipationWorkflowModal: React.FC<Props> = ({ stepId, contributionId }) => {
  const isAuthenticated = useSelector((state: GlobalState) => !!state.user.user)
  const participantToken = getParticipantToken()
  const query = useLazyLoadQuery<ParticipationWorkflowModalQuery>(QUERY, {
    stepId,
    participantToken,
    isAuthenticated,
    contributionId,
  })

  const viewer = query?.viewer ?? null;
  const participant = query?.participant ?? null;

  const intl = useIntl()

  const { step, siteColors, contribution, siteImage } = query

  const logo = siteImage?.media ?? null

  const contributionUrl = step?.url ?? '/';
  const requirementsUrl = contribution?.requirementsUrl as string
  const contributionTypeName = contribution?.__typename as string

  useEffect(() => {
    clearToasts()

    // dirty way to remove it like this but no other choice if we want to keep it in ReplyForm, it could be handled differently when reply form will be merged into workflow
    window.removeEventListener('beforeunload', onUnload)
  }, [])


  const requirements = step?.requirements?.edges?.map(edge => edge.node).map(node => node) ?? []
  let filteredRequirements = requirements.map((requirement) => {
    return {
      ...requirement,
      isMeetingTheRequirement: isAuthenticated ? requirement.viewerMeetsTheRequirement : requirement.participantMeetsTheRequirement,
      viewerMeetsTheRequirement: undefined,
      participantMeetsTheRequirement: undefined,
    }
  })

  const firstnameRequirement = filteredRequirements.find(requirement => requirement.__typename === 'FirstnameRequirement')
  const lastnameRequirement = filteredRequirements.find(requirement => requirement.__typename === 'LastnameRequirement')
  const showNames = (firstnameRequirement && !firstnameRequirement.isMeetingTheRequirement) || (lastnameRequirement && !lastnameRequirement.isMeetingTheRequirement)

  filteredRequirements = filteredRequirements.filter(requirement => ['FirstnameRequirement', 'LastnameRequirement'].includes(requirement.__typename) === false)
  if (showNames) {
    const index = requirements.findIndex(requirement => ['FirstnameRequirement', 'LastnameRequirement'].includes(requirement.__typename))
    filteredRequirements.splice(index, 0, {
      '__typename': 'NamesRequirement',
      participantMeetsTheRequirement: undefined,
      viewerMeetsTheRequirement: undefined,
      isMeetingTheRequirement: false,
    })
  }


  const checkboxes = filteredRequirements.filter(r => r.__typename === 'CheckboxRequirement' && r.isMeetingTheRequirement === false)
  if (checkboxes.length > 0) {
    filteredRequirements = filteredRequirements.filter(r => r.__typename !== 'CheckboxRequirement')
    const index = requirements.findIndex(r => r.__typename === 'CheckboxRequirement')
    filteredRequirements.splice(index, 0, {
      '__typename': 'CheckboxesRequirement',
      participantMeetsTheRequirement: undefined,
      viewerMeetsTheRequirement: undefined,
      isMeetingTheRequirement: false,
    })
  }

  const phoneRequirement = filteredRequirements.find(r => r.__typename === 'PhoneRequirement')
  const phoneVerifiedRequirement = filteredRequirements.find(r => r.__typename === 'PhoneVerifiedRequirement')
  const emailRequirement = filteredRequirements.find(r => r.__typename === 'EmailVerifiedRequirement');
  const ssoRequirement = filteredRequirements.find(r => r.__typename === 'SSORequirement');
  const fcRequirement = filteredRequirements.find(r => r.__typename === 'FranceConnectRequirement');


  filteredRequirements = filteredRequirements.filter(r => {
    // in case there is phoneVerifiedRequirement required we always show phoneRequirement since it is responsible for sending the code
    if (r.__typename === 'PhoneRequirement' && (phoneVerifiedRequirement && phoneVerifiedRequirement.isMeetingTheRequirement === false)) {
      return true;
    }

    return r.isMeetingTheRequirement === false
  })

  const convertPhone = (phone: string) => {
    if (!phone) {
      return ''
    }

    return phone.replace('+33', '0');
  }

  const defaultValues = {
    firstname: isAuthenticated ? firstnameRequirement?.viewerValue : firstnameRequirement?.participantValue,
    lastname: isAuthenticated ? lastnameRequirement?.viewerValue : lastnameRequirement?.participantValue,
    phone: isAuthenticated ? convertPhone(phoneRequirement?.viewerValue) : convertPhone(phoneRequirement?.participantValue),
    birthday: moment("2000-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss"),
    countryCode: '+33',
  }

  const formMethods = useForm<FormValues>({
    defaultValues,
    mode: 'onBlur'
  })

  const isMeetingEmailRequirement = emailRequirement?.isMeetingTheRequirement ?? false
  const isMeetingSSORequirement = ssoRequirement?.isMeetingTheRequirement ?? false
  const isMeetingFcRequirement = fcRequirement?.isMeetingTheRequirement ?? false

  const phonesRequirements = filteredRequirements.filter(r => ['PhoneRequirement', 'PhoneVerifiedRequirement'].includes(r.__typename));
  const hasPhoneVerifiedRequirement = phonesRequirements.some(r => r.__typename === 'PhoneVerifiedRequirement');
  const hasOnlyPhoneRequirement = phonesRequirements.length === 1;

  filteredRequirements = filteredRequirements.filter(r => !['PhoneRequirement', 'PhoneVerifiedRequirement'].includes(r.__typename));

  const hasMetAllRequirements = filteredRequirements.length === 0 && contribution?.completionStatus === 'COMPLETED';
  const email = viewer?.email ?? participant?.email;
  const consentInternalCommunication = viewer?.consentInternalCommunication ?? participant?.consentInternalCommunication;

  if(!contribution && step?.url) {
    const toastConfig = JSON.stringify({ variant: 'danger', message: 'participant-already-contributed-title'})
    window.location.href = `${step.url}?toast=${toastConfig}`
    return <ModalSkeleton />;
  }

  if (!step) {
    return null
  }

  return (
    <ParticipationWorkflowContextProvider value={{ stepId, contributionUrl, logo, requirementsUrl, contributionId, contributionTypeName }}>
      <FormProvider {...formMethods}>
        <MultiStepModal
          hideOnClickOutside={false}
          ariaLabel={intl.formatMessage({ id: 'participation-workflow.requirements' })}
          size={CapUIModalSize.Fullscreen}
          smoothWorkflow
          hideCloseButton
          onClose={() => {
          }}
          show
          fullSizeOnMobile
        >
          {
            fcRequirement && !isMeetingFcRequirement && (
              <FranceConnectRequirementModal />
            )
          }
          {
            ssoRequirement && !isMeetingSSORequirement && (
              <EmailAccountLoginSSOForm
                colors={siteColors}
                modalTitle={intl.formatMessage({ id: 'please-identify-with-our-sso' })}
              />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailParticipantForm hideGoBackArrow />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailParticipantCaptcha />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailParticipantCheckEmail query={query} />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailAccountLoginForm>
                <LoginChoices
                  selected="ACCOUNT_LOGIN_FORM"
                />
              </EmailAccountLoginForm>
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <FranceConnectRequirementModal>
                <LoginChoices
                  selected="ACCOUNT_LOGIN_FRANCE_CONNECT_FORM"
                />
              </FranceConnectRequirementModal>
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailAccountLoginSSOForm colors={siteColors}>
                <LoginChoices
                  selected="ACCOUNT_LOGIN_SSO_FORM"
                />
              </EmailAccountLoginSSOForm>
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailMagicLinkForm />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailMagicLinkCaptcha  />
            )
          }
          {
            (emailRequirement && !isMeetingEmailRequirement) && (
              <EmailMagicLinkCheckEmail query={query} />
            )
          }
          {
            phonesRequirements.map((requirement, index) => {
              const { __typename } = requirement
              if (__typename === 'PhoneRequirement') {
                return <PhoneRequirementModal key={__typename} hideGoBackArrow={index === 0 || !hasOnlyPhoneRequirement} isPhoneVerifiedRequired={hasPhoneVerifiedRequirement} />
              }
              if (__typename === 'PhoneVerifiedRequirement') {
                return <PhoneConfirmationModal key={__typename} />
              }
          })}
          {
            filteredRequirements.map((requirement, index) => {
              const { __typename } = requirement
              const hideGoBackArrow = index === 0 && !hasOnlyPhoneRequirement
              if (__typename === 'ConsentPrivacyPolicyRequirement') {
                return <ConsentPrivacyPolicyRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'NamesRequirement') {
                return <NamesRequirementModal
                  key={__typename}
                  hideGoBackArrow={hideGoBackArrow}
                  showFirstname={!!firstnameRequirement}
                  showLastname={!!lastnameRequirement}
                />
              }
              if (__typename === 'PostalAddressRequirement') {
                return <AddressRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'DateOfBirthRequirement') {
                return <BirthdayRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'IdentificationCodeRequirement') {
                return <IdentificationCodeRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'CheckboxesRequirement') {
                return <CheckboxesRequirementModal key={__typename} checkboxes={checkboxes} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'FranceConnectRequirement') {
                return <FranceConnectRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'ZipCodeRequirement') {
                return <ZipCodeRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
              if (__typename === 'FranceConnectRequirement') {
                return <FranceConnectRequirementModal key={__typename} hideGoBackArrow={hideGoBackArrow} />
              }
            })
          }
          {
            (!emailRequirement && !isAuthenticated && !hasMetAllRequirements) && (
              <CaptchaModal />
            )
          }
          {
            !hasMetAllRequirements && (
              <ContributionValidationModal contributionId={contributionId} />
            )
          }
          {
            !email && !consentInternalCommunication && (
              <ConsentInternalCommunicationEmailModal />
            )
          }
          {
            (email && !consentInternalCommunication) && (
              <ConsentInternalCommunicationModal />
            )
          }
          {/* Uncomment when registration is implemented */}
          {/*{*/}
          {/*  (!isAuthenticated && emailRequirement && isMeetingEmailRequirement && consentInternalCommunication) && (*/}
          {/*    <CreateAccountModal email={emailRequirement.participantValue} />*/}
          {/*  )*/}
          {/*}*/}
        </MultiStepModal>
      </FormProvider>
    </ParticipationWorkflowContextProvider>
  )
}
export default ParticipationWorkflowModal

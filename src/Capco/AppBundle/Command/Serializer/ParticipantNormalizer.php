<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\User\UserRolesTextResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ParticipantNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        private readonly UserRolesTextResolver $userRolesTextResolver,
        private readonly UserUrlResolver $userUrlResolver,
        TranslatorInterface $translator
    ) {
        parent::__construct($translator);
    }

    /**
     * @param array<string, null|bool> $context
     * @param mixed                    $data
     * @param null|mixed               $format
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER])
            && $data instanceof ContributorInterface
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        if (!$object instanceof ContributorInterface) {
            throw new \InvalidArgumentException('Object must be an instance of ContributorInterface.');
        }

        /** @var ContributorInterface $object */
        $userArray = $this->getParticipantPersonnalData($object);

        $isUser = $object instanceof User;

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PARTICIPANT_USER_CREATED_AT => $object->getCreatedAt() ? $object->getCreatedAt()->format('Y-m-d H:i:s') : null,
                self::EXPORT_PARTICIPANT_USER_UPDATED_AT => $object->getUpdatedAt() ? $object->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                self::EXPORT_PARTICIPANT_USER_LAST_LOGIN => $isUser ? $object->getLastLogin() ? $object->getLastLogin()->format('Y-m-d H:i:s') : null : null,
                self::EXPORT_PARTICIPANT_USER_ROLES_TEXT => $isUser ? $this->userRolesTextResolver->resolve($object) : null,
                self::EXPORT_PARTICIPANT_USER_ENABLED => $isUser ? $this->getReadableBoolean($object->isEnabled()) : null,
                self::EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED => $this->getReadableBoolean($object->isEmailConfirmed()),
                self::EXPORT_PARTICIPANT_USER_LOCKED => $isUser ? $this->getReadableBoolean($object->isLocked()) : null,
                self::EXPORT_PARTICIPANT_USER_IS_PHONE_CONFIRMED => $this->getReadableBoolean($object->isPhoneConfirmed()),
                self::EXPORT_PARTICIPANT_GENDER => $isUser ? $object->getGender() : null,
                self::EXPORT_PARTICIPANT_WEBSITE_URL => $isUser ? $object->getWebsiteUrl() : null,
                self::EXPORT_PARTICIPANT_BIOGRAPHY => $isUser ? $object->getBiography() : null,
                self::EXPORT_PARTICIPANT_IS_FRANCE_CONNECT_ASSOCIATED => $isUser ? $this->getReadableBoolean($object->isFranceConnectAccount()) : null,
            ];

            $userArray = array_merge($userArray, $fullExportData);
        }

        if (isset($context['step']) && $context['step']->isVotable()) {
            $userArray[self::EXPORT_PARTICIPANT_VOTES_TOTAL_COUNT_PER_STEP] = $this->getParticipantVoteCountPerStep($object, $context['step']);
            $userArray[self::EXPORT_PARTICIPANT_PROPOSAL_COUNT_PER_STEP] = $this->getProposalCountPerStep($object, $context['step']);
            $userArray[self::EXPORT_PARTICIPANT_VOTED_PROPOSAL_IDS] = $this->getVotedProposalReferencesPerStep($object, $context['step']);
        }

        return $this->translateHeaders($userArray);
    }

    /**
     * @return array{
     *     export_participant_user_id: string,
     *     export_participant_username: string,
     *     export_participant_user_email: string,
     *     export_participant_consent_internal_communication: string,
     *     export_participant_phone: string|null,
     *     export_participant_type: string,
     *     export_participant_firstname: string,
     *     export_participant_lastname: string,
     *     export_participant_date_of_birth: string|null,
     *     export_participant_postal_address: string|null,
     *     export_participant_zip_code: string|null,
     *     export_participant_city: string|null,
     *     export_participant_profile_url: string|null,
     *     export_participant_identification_code: string|null
     * }
     */
    public function getParticipantPersonnalData(ContributorInterface $contributor): array
    {
        $isUser = $contributor instanceof User;

        return [
            self::EXPORT_PARTICIPANT_USER_ID => $contributor->getId(),
            self::EXPORT_PARTICIPANT_USERNAME => $contributor->getUsername(),
            self::EXPORT_PARTICIPANT_USER_EMAIL => $contributor->getEmail(),
            self::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION => $this->getReadableBoolean($contributor->isConsentInternalCommunication()),
            self::EXPORT_PARTICIPANT_PHONE => $contributor->getPhone(),
            self::EXPORT_PARTICIPANT_TYPE => $isUser ? $contributor->getUserType()?->getName() : '',
            self::EXPORT_PARTICIPANT_FIRSTNAME => $contributor->getFirstName(),
            self::EXPORT_PARTICIPANT_LASTNAME => $contributor->getLastName(),
            self::EXPORT_PARTICIPANT_DATE_OF_BIRTH => $contributor->getDateOfBirth()?->format('Y-m-d H:i:s') ?? null,
            self::EXPORT_PARTICIPANT_POSTAL_ADDRESS => $contributor->getPostalAddress()?->getFormatted() ?? null,
            self::EXPORT_PARTICIPANT_ZIP_CODE => $contributor->getZipCode(),
            self::EXPORT_PARTICIPANT_CITY => $contributor->getCity(),
            self::EXPORT_PARTICIPANT_PROFILE_URL => $isUser ? $this->userUrlResolver->__invoke($contributor) : null,
            self::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => $contributor->getUserIdentificationCode()?->getIdentificationCode() ?? null,
        ];
    }

    private function getParticipantVoteCountPerStep(ContributorInterface $contributor, AbstractStep $step): int
    {
        $filterClosure = fn (AbstractVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $step->getId()
            && $vote->getIsAccounted();

        return $contributor->getVotes()->filter($filterClosure)->count();
    }

    private function getProposalCountPerStep(ContributorInterface $contributor, AbstractStep $step): int
    {
        $filterClosure = function (Proposal $proposal) use ($step) {
            if ($step instanceof CollectStep) {
                $proposalStep = $proposal->getStep();

                return null !== $proposalStep
                    && $proposalStep->getId() === $step->getId()
                    && $proposal->isPublished();
            }

            $selectionSteps = array_filter(
                $proposal->getSelectionSteps(),
                static fn (SelectionStep $selectionStep) => $selectionStep->getId() === $step->getId()
            );

            if (empty($selectionSteps)) {
                return false;
            }

            $proposalStep = reset($selectionSteps);

            return $proposalStep->getId() === $step->getId() && $proposal->isPublished();
        };

        return $contributor->getProposals()->filter($filterClosure)->count();
    }

    private function getVotedProposalReferencesPerStep(ContributorInterface $contributor, AbstractStep $step): string
    {
        $filterClosure = function (AbstractVote $vote) use ($step) {
            $currentVoteStep = $vote->getStep();
            if (null === $currentVoteStep) {
                return false;
            }

            return $vote instanceof AbstractProposalVote
                && null !== $vote->getProposal()
                && $vote->isPublished()
                && $vote->getIsAccounted()
                && $currentVoteStep->getId() === $step->getId();
        };

        $votedProposalReferences = $contributor->getVotes()->filter($filterClosure)->map(
            fn (AbstractVote $vote) => $vote->getProposal() ? $vote->getProposal()->getReference() : null
        )->toArray();

        return implode(',', $votedProposalReferences);
    }
}

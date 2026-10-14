<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class AddVocalContributionMutation implements MutationInterface
{
    public function __construct(
        private readonly VocalContributionRepository $vocalContributionRepository,
        private readonly ParticipantHelper $participantHelper,
        private readonly EntityManagerInterface $entityManager,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        private readonly ViewerIsMeetingRequirementsResolver $viewerIsMeetingRequirementsResolver
    ) {
    }

    /**
     * @return array{contributionId: string, shouldTriggerParticipationWorkflow: bool, shouldTriggerConsentInternalCommunication: bool, completionStatus: string, participantToken: ?string}
     */
    public function __invoke(Argument $input, ?User $viewer = null): array
    {
        $values = $input->offsetGet('input');
        $vocal = $this->getVocalContribution($values['vocalId'] ?? null);
        $participant = $this->getParticipant($values['participantToken'] ?? null, $viewer, $vocal);

        $this->assertCanUseVocal($vocal, $viewer, $participant);

        if ($viewer) {
            $vocal->setUser($viewer);
        } else {
            $vocal->setParticipant($participant);
        }

        $meetsRequirements = $this->meetsRequirements($viewer, $participant);
        if ($meetsRequirements) {
            $vocal->setCompletedStatus();
        } else {
            $vocal->setMissingRequirementsStatus();
        }

        $this->entityManager->flush();

        return [
            'contributionId' => GlobalId::toGlobalId('VocalContribution', $vocal->getId()),
            'shouldTriggerParticipationWorkflow' => !$meetsRequirements,
            'shouldTriggerConsentInternalCommunication' => !($viewer ?? $participant)->isConsentInternalCommunication(),
            'completionStatus' => $vocal->getCompletionStatus(),
            'participantToken' => $participant?->getToken(),
        ];
    }

    private function getVocalContribution(?string $globalId): VocalContribution
    {
        $decoded = null !== $globalId ? GlobalId::fromGlobalId($globalId) : [];
        if ('VocalContribution' !== ($decoded['type'] ?? null)) {
            throw new UserError('Invalid vocal contribution ID.');
        }

        $vocal = $this->vocalContributionRepository->find($decoded['id']);
        if (!$vocal instanceof VocalContribution) {
            throw new UserError('Vocal contribution not found.');
        }

        if (Media::VOCAL_CONTRIBUTION_CONTEXT !== $vocal->getMedia()->getContext()) {
            throw new UserError('Invalid vocal contribution media.');
        }

        return $vocal;
    }

    private function getParticipant(?string $token, ?User $viewer, VocalContribution $vocal): ?Participant
    {
        if (null === $token && $vocal->getParticipant()) {
            if (!$viewer) {
                throw new UserError('A participant token is required.');
            }

            return null;
        }

        if (null !== $token) {
            try {
                return $this->participantHelper->getParticipantByToken($token);
            } catch (ParticipantNotFoundException) {
                throw new UserError('Invalid participant token.');
            }
        }

        return $viewer ? null : $this->participantHelper->getOrCreateParticipant();
    }

    private function assertCanUseVocal(VocalContribution $vocal, ?User $viewer, ?Participant $participant): void
    {
        if (ContributionCompletionStatus::COMPLETED === $vocal->getCompletionStatus()) {
            throw new UserError('Vocal contribution is already submitted.');
        }

        if ($viewer) {
            if ($vocal->getUser() && $vocal->getUser() !== $viewer) {
                throw new UserError('Vocal contribution does not belong to this user.');
            }
            if ($vocal->getParticipant() && $participant !== $vocal->getParticipant()) {
                throw new UserError('Participant token does not match the vocal contribution.');
            }

            return;
        }

        if ($vocal->getUser() || !$participant || ($vocal->getParticipant() && $vocal->getParticipant() !== $participant)) {
            throw new UserError('Vocal contribution does not belong to this participant.');
        }
    }

    private function meetsRequirements(?User $viewer, ?Participant $participant): bool
    {
        $step = $this->collectStepRepository->findVocalContributionStep();
        if (null === $step) {
            throw new UserError('No vocal contribution step is configured.');
        }

        $args = new Argument([
            'stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId()),
        ]);

        if ($viewer) {
            return $this->viewerIsMeetingRequirementsResolver->__invoke($args, $viewer);
        }

        \assert(null !== $participant);

        return $this->participantIsMeetingRequirementsResolver->__invoke($participant, $args);
    }
}

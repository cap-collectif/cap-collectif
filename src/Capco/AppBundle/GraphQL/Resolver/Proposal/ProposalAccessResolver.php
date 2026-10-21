<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalAccessResolver implements QueryInterface
{
    public function __construct(private readonly ParticipantHelper $participantHelper)
    {
    }

    /**
     * @return array{canEdit: bool, canDelete: bool}
     */
    public function __invoke(Proposal $proposal, Argument $args, ?User $viewer = null): array
    {
        // Check authenticated user access
        if ($viewer) {
            if ($viewer->isSuperAdmin()) {
                return [
                    'canEdit' => true,
                    'canDelete' => true,
                ];
            }

            if ($viewer->isAdmin() && $proposal->getAuthor() !== $viewer) {
                return [
                    'canEdit' => true,
                    'canDelete' => false,
                ];
            }

            // Organization owner has full access
            if ($viewer->getOrganization() && $proposal->getProposalForm()->getOwner() === $viewer->getOrganization()) {
                return [
                    'canEdit' => true,
                    'canDelete' => false,
                ];
            }

            // Author access with step restrictions
            if ($proposal->getAuthor() === $viewer) {
                return $this->resolveAuthorRestrictions($proposal);
            }
        }

        // Check participant token access
        $participantTokenInput = $args['participantToken'] ?? null;
        $emailTokenInput = $args['emailToken'] ?? null;

        $emailToken = $proposal->getEmailToken();

        $participant = null;
        if ($participantTokenInput) {
            try {
                $participant = $this->participantHelper->getParticipantByToken($participantTokenInput);
            } catch (ParticipantNotFoundException) {
            }
        }

        $participantIsAuthor = $participant && $participant === $proposal->getParticipant();
        $isValidEmailToken = $emailTokenInput && $emailTokenInput === $emailToken;

        $hasWriteAccess = $participantIsAuthor || $isValidEmailToken;

        return $hasWriteAccess
            ? $this->resolveAuthorRestrictions($proposal)
            : ['canEdit' => false, 'canDelete' => false];
    }

    /**
     * @return array{canEdit: bool, canDelete: bool}
     */
    private function resolveAuthorRestrictions(Proposal $proposal): array
    {
        $step = $proposal->getStep();

        return [
            'canEdit' => $proposal->isDraft() || !$step->getPreventProposalEdit(),
            'canDelete' => $proposal->isDraft() || !$step->getPreventProposalDelete(),
        ];
    }
}

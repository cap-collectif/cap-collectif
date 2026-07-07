<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryProposalFromSlugResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalRepository $repository,
        private readonly ParticipantHelper $participantHelper
    ) {
    }

    public function __invoke(Argument $args, $viewer): ?Proposal
    {
        $proposal = $this->repository->getOneBySlug($args->offsetGet('slug'));

        if (!$proposal) {
            return null;
        }

        $participant = $viewer ? null : $this->getParticipant($args);
        $participantCanSeeProposal = $participant && $proposal->getParticipant() === $participant;

        if (
            $proposal->isDraft()
            && $proposal->getAuthor() !== $viewer
            && !$participantCanSeeProposal
        ) {
            return null;
        }

        if (!$proposal->viewerCanSee($viewer) && !$participantCanSeeProposal) {
            return null;
        }

        if ($proposal->isDeleted()) {
            return null;
        }

        return $proposal;
    }

    private function getParticipant(Argument $args): ?Participant
    {
        $participantToken = $args->offsetGet('participantToken');
        if (!$participantToken) {
            return null;
        }

        try {
            return $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException) {
            return null;
        }
    }
}

<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantProposalsResolver implements ResolverInterface
{
    private ProposalRepository $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(Participant $participant, ?Argument $args = null): ConnectionInterface
    {
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->proposalRepository->findPaginatedByParticipant(
                $participant,
                $limit,
                $offset
            )
        );

        $totalCount = $this->proposalRepository->countByParticipant(
            $participant
        );

        return $paginator->auto($args, $totalCount);
    }
}

<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantVotesResolver implements ResolverInterface
{
    private AbstractVoteRepository $voteRepository;

    public function __construct(AbstractVoteRepository $voteRepository)
    {
        $this->voteRepository = $voteRepository;
    }

    public function __invoke(Participant $participant, ?Argument $args = null): ConnectionInterface
    {
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->voteRepository->findPaginatedByParticipant(
                $participant,
                $limit,
                $offset
            )
        );

        $totalCount = $this->voteRepository->countByParticipant(
            $participant
        );

        return $paginator->auto($args, $totalCount);
    }
}

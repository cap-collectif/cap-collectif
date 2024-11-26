<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantRepliesResolver implements QueryInterface
{
    private readonly ReplyRepository $replyRepository;

    public function __construct(ReplyRepository $replyRepository)
    {
        $this->replyRepository = $replyRepository;
    }

    public function __invoke(Participant $participant, ?Argument $args = null): ConnectionInterface
    {
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->replyRepository->findPaginatedByParticipant(
                $participant,
                $limit,
                $offset
            )
        );

        $totalCount = $this->replyRepository->countByParticipant(
            $participant
        );

        return $paginator->auto($args, $totalCount);
    }
}

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
    public function __construct(private readonly ReplyRepository $replyRepository)
    {
    }

    public function __invoke(Participant $participant, mixed $viewer, ?Argument $args = null): ConnectionInterface
    {
        $replies = $this->replyRepository->findBy(['participant' => $participant]);

        $paginator = new Paginator(
            fn (int $offset, int $limit) => \array_slice($replies, $offset, $limit)
        );

        $totalCount = \count($replies);

        return $paginator->auto($args, $totalCount);
    }
}

<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\CommentVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserCommentVotesResolver implements ResolverInterface
{
    protected $commentVoteRepository;

    public function __construct(CommentVoteRepository $commentVoteRepository)
    {
        $this->commentVoteRepository = $commentVoteRepository;
    }

    public function __invoke(
        User $user,
        Argument $args = null,
        ?int $offset = null,
        ?int $limit = 100
    ): Connection {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }

        $paginator = new Paginator(function (?int $offset, ?int $limit) use ($user) {
            return $this->commentVoteRepository->findAllByVoter($user, $limit, $offset);
        });

        $totalCount = $this->commentVoteRepository->countAllByVoter($user);

        return $paginator->auto($args, $totalCount);
    }
}

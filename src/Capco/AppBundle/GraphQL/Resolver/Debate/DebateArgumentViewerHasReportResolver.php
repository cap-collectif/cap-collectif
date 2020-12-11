<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateArgumentViewerHasReportResolver implements ResolverInterface
{
    private DebateArgumentVoteRepository $repository;

    public function __construct(DebateArgumentVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(DebateArgument $debateArgument, ?User $viewer = null): bool
    {
        return $viewer &&
            $this->repository->getOneByDebateArgumentAndUser($debateArgument, $viewer);
    }
}

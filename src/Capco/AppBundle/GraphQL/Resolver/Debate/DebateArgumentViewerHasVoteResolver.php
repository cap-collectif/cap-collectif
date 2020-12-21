<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;

class DebateArgumentViewerHasVoteResolver implements ResolverInterface
{
    use ResolverTrait;
    private DebateArgumentVoteRepository $repository;

    public function __construct(DebateArgumentVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(DebateArgument $debateArgument, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return null !== $this->repository->getOneByDebateArgumentAndUser($debateArgument, $viewer);
    }
}

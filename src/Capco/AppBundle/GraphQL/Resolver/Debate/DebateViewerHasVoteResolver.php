<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateViewerHasVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly DebateVoteRepository $repository
    ) {
    }

    public function __invoke(Debate $debate, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return null !== $this->repository->getOneByDebateAndUser($debate, $viewer);
    }
}

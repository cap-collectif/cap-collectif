<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateViewerHasArgumentResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly DebateArgumentRepository $repository)
    {
    }

    public function __invoke(Debate $debate, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return 0 < $this->repository->countByDebateAndUser($debate, $viewer);
    }
}

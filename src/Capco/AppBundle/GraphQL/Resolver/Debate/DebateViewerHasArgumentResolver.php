<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateViewerHasArgumentResolver implements ResolverInterface
{
    use ResolverTrait;

    private DebateArgumentRepository $repository;

    public function __construct(DebateArgumentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, $viewer): bool
    {
        $this->preventNullableViewer($viewer);

        return 0 < $this->repository->countByDebateAndUser($debate, $viewer);
    }
}

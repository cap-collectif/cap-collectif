<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DebateViewerUnpublishedArgumentResolver implements ResolverInterface
{
    use ResolverTrait;
    private DebateArgumentRepository $repository;

    public function __construct(DebateArgumentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, $viewer): ?DebateArgument
    {
        $user = $this->preventNullableViewer($viewer);

        return $this->repository->getUnpublishedByDebateAndUser($debate, $user);
    }
}

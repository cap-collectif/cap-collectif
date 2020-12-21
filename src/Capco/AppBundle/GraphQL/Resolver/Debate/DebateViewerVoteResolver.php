<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;

class DebateViewerVoteResolver implements ResolverInterface
{
    use ResolverTrait;
    private DebateVoteRepository $repository;

    public function __construct(DebateVoteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Debate $debate, $viewer): ?DebateVote
    {
        $this->preventNullableViewer($viewer);

        return $this->repository->getOneByDebateAndUser($debate, $viewer);
    }
}

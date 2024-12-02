<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DebateViewerVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly DebateVoteRepository $repository)
    {
    }

    public function __invoke(Debate $debate, $viewer): ?DebateVote
    {
        $this->preventNullableViewer($viewer);

        return $this->repository->getOneByDebateAndUser($debate, $viewer);
    }
}

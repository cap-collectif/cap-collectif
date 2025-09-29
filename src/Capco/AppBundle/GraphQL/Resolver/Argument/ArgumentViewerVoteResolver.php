<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ArgumentViewerVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private ArgumentVoteRepository $argumentVoteRepository
    ) {
    }

    public function __invoke(Argument $argument, $viewer): ?ArgumentVote
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->argumentVoteRepository->getByArgumentAndUser($argument, $viewer);
    }
}

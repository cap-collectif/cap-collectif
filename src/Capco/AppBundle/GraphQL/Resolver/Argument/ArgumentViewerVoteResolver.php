<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Entity\ArgumentVote;

class ArgumentViewerVoteResolver implements ResolverInterface
{
    use ResolverTrait;

    private $argumentVoteRepository;

    public function __construct(ArgumentVoteRepository $argumentVoteRepository)
    {
        $this->argumentVoteRepository = $argumentVoteRepository;
    }

    public function __invoke(Argument $argument, $viewer): ?ArgumentVote
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->argumentVoteRepository->getByArgumentAndUser($argument, $viewer);
    }
}

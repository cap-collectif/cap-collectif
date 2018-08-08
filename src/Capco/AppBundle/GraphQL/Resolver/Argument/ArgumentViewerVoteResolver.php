<?php
namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Entity\ArgumentVote;

class ArgumentViewerVoteResolver implements ResolverInterface
{
    private $argumentVoteRepository;

    public function __construct(ArgumentVoteRepository $argumentVoteRepository)
    {
        $this->argumentVoteRepository = $argumentVoteRepository;
    }

    public function __invoke(Argument $argument, User $user): ?ArgumentVote
    {
        return $this->argumentVoteRepository->getByArgumentAndUser($argument, $user);
    }
}

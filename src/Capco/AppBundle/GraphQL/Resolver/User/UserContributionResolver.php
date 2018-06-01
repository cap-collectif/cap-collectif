<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserContributionResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(User $object, Argument $args)
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($object, $args) {
            return $this->getContributionsByType($args->offsetGet('type'), $object);
        });

        $totalCount = 0;

        return $paginator->auto($args, $totalCount);
    }

    public function getContributionsByType(string $requestedType = null, User $user)
    {
        switch ($requestedType) {
            case 'Opinions':
                return $user->getOpinions()->toArray();
                break;
            case 'OpinionVersions':
                return $user->getOpinionVersions()->toArray();
                break;
            case 'Votes':
                return $user->getVotes()->toArray();
                break;
            case 'Comments':
                return $user->getComments()->toArray();
                break;
            case 'Arguments':
                return $user->getArguments()->toArray();
                break;
            case 'Sources':
                return $user->getSources()->toArray();
                break;
            case 'Proposals':
                return $user->getProposals()->toArray();
                break;
            case 'Replies':
                return $user->getReplies()->toArray();
                break;
            default:
                return $user->getContributions();
                break;
        }
    }
}

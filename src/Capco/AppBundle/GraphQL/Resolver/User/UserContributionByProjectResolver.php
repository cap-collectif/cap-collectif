<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Argument;

class UserContributionByProjectResolver implements ResolverInterface
{
    private $contributionSearch;

    public function __construct(ContributionSearch $contributionSearch)
    {
        $this->contributionSearch = $contributionSearch;
    }

    public function __invoke(User $user, Project $project, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        if (!$project->hasParticipativeStep()) {
            return $paginator->auto($args, 0);
        }

        $totalCount = $this->contributionSearch->countByAuthorAndProject($user, $project);

        // Comments are not accounted

        return $paginator->auto($args, $totalCount);
    }
}

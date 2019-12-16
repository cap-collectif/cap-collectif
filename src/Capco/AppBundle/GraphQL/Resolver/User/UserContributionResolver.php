<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserContributionResolver implements ContainerAwareInterface, ResolverInterface
{
    use ContainerAwareTrait;

    private $contributionSearch;

    public function __construct(ContributionSearch $contributionSearch)
    {
        $this->contributionSearch = $contributionSearch;
    }

    public function __invoke(User $user, Argument $args): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        list($type, $projectId, $stepId, $consultationId, $includeTrashed) = [
            $args->offsetGet('type'),
            $args->offsetGet('project'),
            $args->offsetGet('step'),
            $args->offsetGet('consultation'),
            $args->offsetGet('includeTrashed')
        ];

        if (!$type) {
            $totalCount = 0;
            $paginator = new Paginator(function () use (
                $projectId,
                $stepId,
                $consultationId,
                $user,
                &$totalCount
            ) {
                $totalCount = $this->contributionSearch->countByAuthor($user);

                if ($projectId) {
                    $totalCount = $this->contributionSearch->countByAuthorAndProject(
                        $user,
                        $projectId
                    );
                }

                if ($stepId) {
                    $totalCount = $this->contributionSearch->countByAuthorAndStep($user, $stepId);
                }

                if ($consultationId) {
                    $totalCount = $this->contributionSearch->countByAuthorAndConsultation(
                        $user,
                        $consultationId
                    );
                }

                return [];
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->setTotalCount($totalCount);

            return $connection;
        }

        $paginator = new ElasticSearchPaginator(function (?string $cursor, int $limit) use (
            $type,
            $user,
            $includeTrashed
        ) {
            return $this->contributionSearch->getContributionsByAuthorAndType(
                $user,
                $limit,
                $type,
                $cursor,
                $includeTrashed
            );
        });

        return $paginator->auto($args);
    }
}

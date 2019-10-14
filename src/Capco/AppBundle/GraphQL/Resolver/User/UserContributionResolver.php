<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Enum\ContributionType;
use Capco\AppBundle\Repository\OpinionRepository;
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
    private $opinionRepository;

    public function __construct(
        ContributionSearch $contributionSearch,
        OpinionRepository $opinionRepository
    ) {
        $this->contributionSearch = $contributionSearch;
        $this->opinionRepository = $opinionRepository;
    }

    public function __invoke(User $user, Argument $args): ConnectionInterface
    {
        $query = $this->getContributionsByType(
            $user,
            $args->offsetGet('type'),
            $args->offsetGet('project'),
            $args->offsetGet('step'),
            $args->offsetGet('consultation')
        );
        $paginator = new Paginator(static function (int $offset, int $limit) use ($query) {
            return $query['values'];
        });

        return $paginator->auto($args, $query['totalCount']);
    }

    public function searchContributionsByType(User $user, string $type, array &$result)
    {
        $ids = [];
        $contributions = $this->contributionSearch->getContributionsByAuthorAndTypes($user, [
            $type
        ]);
        foreach ($contributions->getAggregation('opinions')['buckets'] as $opinionContributions) {
            $ids[] = $opinionContributions['key'];
        }
        $result['values'] = $this->contributionSearch->getHydratedResults(
            $this->opinionRepository,
            $ids
        );
        $result['totalCount'] = $contributions->getTotalHits();

        return $result;
    }

    public function getContributionsByType(
        User $user,
        string $requestedType = null,
        string $projectId = null,
        string $stepId = null,
        string $consultationId = null
    ): array {
        $result = [];
        switch ($requestedType) {
            case ContributionType::OPINION:
                return $this->searchContributionsByType($user, 'opinion', $result);

                break;
            case ContributionType::OPINIONVERSION:
                return $this->searchContributionsByType($user, 'opinionVersion', $result);

                break;
            case ContributionType::COMMENT:
                return $this->searchContributionsByType($user, 'comment', $result);

                break;
            case ContributionType::ARGUMENT:
                return $this->searchContributionsByType($user, 'argument', $result);

                break;
            case ContributionType::SOURCE:
                return $this->searchContributionsByType($user, 'source', $result);

                break;
            case ContributionType::PROPOSAL:
                return $this->searchContributionsByType($user, 'proposal', $result);

                break;
            case ContributionType::REPLY:
                return $this->searchContributionsByType($user, 'reply', $result);

                break;
            default:
                // The extras parameters (projectId, stepId, consultationId) are
                // temporary used to test the ContributionSearch's class methods.
                $result['values'] = [];
                if ($projectId) {
                    $result['totalCount'] = $this->container
                        ->get(ContributionSearch::class)
                        ->countByAuthorAndProject($user, $projectId);

                    return $result;
                }

                if ($stepId) {
                    $result['totalCount'] = $this->contributionSearch->countByAuthorAndStep(
                        $user,
                        $stepId
                    );

                    return $result;
                }

                if ($consultationId) {
                    $result['totalCount'] = $this->contributionSearch->countByAuthorAndConsultation(
                        $user,
                        $consultationId
                    );

                    return $result;
                }

                $result['totalCount'] = $this->contributionSearch->countByAuthor($user);

                return $result;

                break;
        }
    }
}

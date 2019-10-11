<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Enum\ContributionType;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SourceRepository;
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
                $result['values'] = $this->container
                    ->get(OpinionRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(OpinionRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::OPINIONVERSION:
                $result['values'] = $this->container
                    ->get(OpinionVersionRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(OpinionVersionRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::COMMENT:
                $result['values'] = $this->container
                    ->get(CommentRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(CommentRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::ARGUMENT:
                $result['values'] = $this->container
                    ->get(ArgumentRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(ArgumentRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::SOURCE:
                $result['values'] = $this->container
                    ->get(SourceRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(SourceRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::PROPOSAL:
                $result['values'] = $this->container
                    ->get(ProposalRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(ProposalRepository::class)
                    ->countAllByAuthor($user);

                return $result;

                break;
            case ContributionType::REPLY:
                $result['values'] = $this->container
                    ->get(ReplyRepository::class)
                    ->findAllByAuthor($user);
                $result['totalCount'] = $this->container
                    ->get(ReplyRepository::class)
                    ->countAllByAuthor($user);

                return $result;

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

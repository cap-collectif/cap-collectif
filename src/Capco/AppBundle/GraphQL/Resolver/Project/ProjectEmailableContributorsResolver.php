<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Mailer\Recipient\ProjectRecipientsFetcher;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectEmailableContributorsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly ProjectRecipientsFetcher $projectRecipientsFetcher,
    ) {
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function __invoke(Project $project, Argument $argument): ConnectionInterface
    {
        $paginator = new Paginator(fn (?int $offset, ?int $limit) => $this->projectRecipientsFetcher->getRecipientDataByProject(
            project: $project,
            offset: $offset,
            limit: $limit,
        ));
        $connection = $paginator->auto($argument, $this->projectRecipientsFetcher->getTotalCountByProject($project));
        $connection->{'refusingCount'} = $this->projectRecipientsFetcher->getRefusingCountByProject($project);

        return $connection;
    }
}

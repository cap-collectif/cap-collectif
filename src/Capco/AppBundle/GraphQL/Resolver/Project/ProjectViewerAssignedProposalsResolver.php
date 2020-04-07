<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Search\ProposalSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ProjectViewerAssignedProposalsResolver implements ResolverInterface
{
    use ResolverTrait;

    private ProposalSearch $proposalSearch;

    public function __construct(ProposalSearch $proposalSearch)
    {
        $this->proposalSearch = $proposalSearch;
    }

    public function __invoke(Project $project, Arg $args, $viewer): ConnectionInterface
    {
        $this->preventNullableViewer($viewer);

        $paginator = new ElasticsearchPaginator(
            function (?string $cursor, int $limit) use (
                $args,
                $viewer,
                $project
            ) {
                $filters = [];
                $search = null;

                if ($args->offsetExists('district')) {
                    $filters['district'] = $args->offsetGet('district');
                }
                if ($args->offsetExists('analysts')) {
                    $filters['analysts'] = $args->offsetGet('analysts');
                }
                if ($args->offsetExists('supervisor')) {
                    $filters['supervisor'] = $args->offsetGet('supervisor');
                }
                if ($args->offsetExists('decisionMaker')) {
                    $filters['decisionMaker'] = $args->offsetGet('decisionMaker');
                }

                return $this->proposalSearch->searchProposalAssignedToViewer(
                    $project->getId(),
                    $viewer->getId(),
                    $filters,
                    $limit,
                    $cursor
                );
            }
        );

        return $paginator->auto($args);
    }
}

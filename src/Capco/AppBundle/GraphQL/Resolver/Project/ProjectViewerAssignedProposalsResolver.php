<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
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

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $args,
            $viewer,
            $project
        ) {
            $filters = [];
            $state = null;

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
            if ($args->offsetExists('category')) {
                $filters['category'] = $args->offsetGet('category');
            }
            if ($args->offsetExists('state')) {
                $state = $args->offsetGet('state');
            }
            list($direction, $field) = [
                $args->offsetGet('orderBy')['direction'],
                $args->offsetGet('orderBy')['field'],
            ];
            $order = ProposalSearch::findOrderFromFieldAndDirection($field, $direction);

            return $this->proposalSearch->searchProposalAssignedToViewer(
                $project->getId(),
                $viewer->getId(),
                $filters,
                $order,
                $state,
                $limit,
                $cursor
            );
        });

        return $paginator->auto($args);
    }
}

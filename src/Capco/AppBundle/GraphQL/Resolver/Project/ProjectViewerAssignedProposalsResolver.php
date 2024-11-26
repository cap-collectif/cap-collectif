<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Search\ProposalSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ProjectViewerAssignedProposalsResolver implements QueryInterface
{
    use ResolverTrait;

    private readonly ProposalSearch $proposalSearch;

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
            if ($args->offsetExists('analysts') && null !== $args->offsetGet('analysts')) {
                $analysts = [];
                foreach ($args->offsetGet('analysts') as $analyst) {
                    $analysts[] = GlobalIdResolver::getDecodedId($analyst)['id'];
                }
                $filters['analysts'] = $analysts;
            }
            if ($args->offsetExists('supervisor') && null !== $args->offsetGet('supervisor')) {
                $filters['supervisor'] = GlobalIdResolver::getDecodedId(
                    $args->offsetGet('supervisor')
                )['id'];
            }
            if (
                $args->offsetExists('decisionMaker')
                && null !== $args->offsetGet('decisionMaker')
            ) {
                $filters['decisionMaker'] = GlobalIdResolver::getDecodedId(
                    $args->offsetGet('decisionMaker')
                )['id'];
            }
            if ($args->offsetExists('category')) {
                $filters['category'] = $args->offsetGet('category');
            }
            if ($args->offsetExists('state')) {
                $state = $args->offsetGet('state');
            }
            if ($args->offsetExists('theme')) {
                $filters['theme'] = $args->offsetGet('theme');
            }
            if ($args->offsetExists('term')) {
                $filters['term'] = $args->offsetGet('term');
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

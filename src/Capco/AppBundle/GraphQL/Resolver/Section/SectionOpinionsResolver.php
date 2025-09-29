<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\Search;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\RequestStack;

class SectionOpinionsResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionSearch $opinionSearch
    ) {
    }

    public function __invoke(
        OpinionType $section,
        Argument $args,
        ?User $viewer,
        RequestStack $request
    ): ConnectionInterface {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $section,
            $args,
            $viewer,
            $request
        ) {
            [$field, $direction, $includeTrashed, $author] = [
                $args->offsetGet('orderBy')['field'],
                $args->offsetGet('orderBy')['direction'],
                $args->offsetGet('includeTrashed'),
                $args->offsetGet('author'),
            ];
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = ['type.id' => $section->getId(), 'published' => true];

            if (!$includeTrashed) {
                $filters['trashed'] = false;
            }

            if ($author) {
                $filters['author.id'] = GlobalId::fromGlobalId($author)['id'];
            }

            $seed = Search::generateSeed($request, $viewer);

            return $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $cursor,
                $viewer,
                $seed
            );
        });

        return $paginator->auto($args);
    }
}

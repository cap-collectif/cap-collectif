<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\Search;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class SectionOpinionsResolver implements ResolverInterface
{
    private $opinionSearch;

    public function __construct(OpinionSearch $opinionSearch)
    {
        $this->opinionSearch = $opinionSearch;
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
            list($field, $direction, $includeTrashed, $author) = [
                $args->offsetGet('orderBy')['field'],
                $args->offsetGet('orderBy')['direction'],
                $args->offsetGet('includeTrashed'),
                $args->offsetGet('author')
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

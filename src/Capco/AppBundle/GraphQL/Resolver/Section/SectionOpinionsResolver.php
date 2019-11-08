<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Search\OpinionSearch;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

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
        ?User $viewer
    ): ConnectionInterface {
        $totalCount = 0;

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $section,
            $args,
            $viewer,
            &$totalCount
        ) {
            list($field, $direction, $includeTrashed, $author) = [
                $args->offsetGet('orderBy')['field'],
                $args->offsetGet('orderBy')['direction'],
                $args->offsetGet('includeTrashed'),
                $args->offsetGet('author')
            ];
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = ['type.id' => $section->getId()];

            if (!$includeTrashed) {
                $filters['trashed'] = false;
            }

            if ($author) {
                $filters['author.id'] = GlobalId::fromGlobalId($author)['id'];
            }

            $results = $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $offset,
                $viewer
            );
            $totalCount = (int) $results['count'];

            return $results['opinions'];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}

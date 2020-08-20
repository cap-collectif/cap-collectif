<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Search\Search;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Search\VersionSearch;
use Capco\AppBundle\Enum\VersionOrderField;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OpinionVersionsResolver implements ResolverInterface
{
    use ResolverTrait;

    private VersionSearch $versionSearch;

    public function __construct(VersionSearch $versionSearch)
    {
        $this->versionSearch = $versionSearch;
    }

    public function __invoke(
        Opinion $opinion,
        ?Argument $args = null,
        $viewer = null,
        ?RequestStack $request = null,
        ?\ArrayObject $context = null
    ): Connection {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
                'orderBy' => [
                    'field' => VersionOrderField::PUBLISHED_AT,
                    'direction' => OrderDirection::DESC,
                ],
            ]);
        }
        $this->protectArguments($args);

        $isACLDisabled = $this->isACLDisabled($context);
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];
        $order = VersionSearch::findOrderFromFieldAndDirection($field, $direction);

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $opinion,
            $viewer,
            $request,
            $isACLDisabled,
            $order
        ) {
            $seed = Search::generateSeed($request, $viewer);

            return $this->versionSearch->getByCriteriaOrdered(
                [
                    'opinion.id' => $opinion->getId(),
                ],
                $order,
                $limit,
                $cursor,
                $viewer,
                $seed,
                $isACLDisabled
            );
        });

        return $paginator->auto($args);
    }
}

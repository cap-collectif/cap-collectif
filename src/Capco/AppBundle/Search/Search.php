<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\EntityRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Result;
use Elastica\ResultSet;
use Symfony\Component\HttpFoundation\RequestStack;

abstract class Search
{
    public const RESULTS_PER_PAGE = 10;
    public const BIG_INT_VALUE = 2147483647;

    public const AVAILABLE_TYPES_FOR_MULTI_MATCH = [
        Query\MultiMatch::TYPE_BEST_FIELDS,
        Query\MultiMatch::TYPE_MOST_FIELDS,
        Query\MultiMatch::TYPE_CROSS_FIELDS,
        Query\MultiMatch::TYPE_PHRASE,
        Query\MultiMatch::TYPE_PHRASE_PREFIX
    ];

    protected $index;
    protected $type;

    public function __construct(Index $index)
    {
        $this->index = $index;
    }

    public static function generateSeed(RequestStack $request, $viewer = null)
    {
        if ($viewer instanceof User) {
            // sprintf with %u is here in order to avoid negative int.
            $seed = sprintf('%u', crc32($viewer->getId()));
        } elseif ($request->getCurrentRequest()) {
            // sprintf with %u is here in order to avoid negative int.
            $seed = sprintf('%u', ip2long($request->getCurrentRequest()->getClientIp()));
        } else {
            $seed = random_int(0, PHP_INT_MAX);
        }

        return $seed;
    }

    public function getHydratedResults(EntityRepository $repository, array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $results = $repository->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($results, static function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $results;
    }

    protected function searchTermsInMultipleFields(
        Query\BoolQuery $query,
        array $fields,
        $terms = null,
        $type = null
    ): Query\BoolQuery {
        if (empty(trim($terms))) {
            $multiMatchQuery = new Query\MatchAll();
        } else {
            $multiMatchQuery = new Query\MultiMatch();
            $multiMatchQuery->setQuery($terms)->setFields($fields);

            if ($type && \in_array($type, self::AVAILABLE_TYPES_FOR_MULTI_MATCH, true)) {
                $multiMatchQuery->setType($type);
            }
        }

        $query->addMust($multiMatchQuery);

        return $query;
    }

    protected function searchNotInTermsForField(
        Query\BoolQuery $query,
        $fieldName,
        $terms
    ): Query\BoolQuery {
        if (\is_array($terms)) {
            $matchQuery = new Query\Terms($fieldName, $terms);
        } else {
            $matchQuery = new Query\Match($fieldName, $terms);
        }

        $query->addMustNot($matchQuery);

        return $query;
    }

    protected function getHydratedResultsFromResultSet(
        ObjectRepository $repository,
        ResultSet $resultSet
    ): array {
        $ids = array_map(static function (Result $result) {
            return $result->getId();
        }, $resultSet->getResults());

        return $this->getHydratedResults($repository, $ids);
    }

    protected function getRandomSortedQuery(Query\AbstractQuery $query, int $seed = 123): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore->setBoostMode(Query\FunctionScore::BOOST_MODE_REPLACE);
        $functionScore->setQuery($query);
        $functionScore->setRandomScore($seed);

        return new Query($functionScore);
    }

    protected function getFiltersForProjectViewerCanSee(string $projectPath, User $viewer): array
    {
        $visibility = ProjectVisibilityMode::getProjectVisibilityByRoles($viewer);

        return [
            (new BoolQuery())->addShould([
                new Term([
                    "${projectPath}.visibility" => [
                        'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                    ]
                ]),
                new Query\Terms("${projectPath}.authors.id", [$viewer->getId()])
            ]),
            (new BoolQuery())->addMust([
                new Term([
                    "${projectPath}.visibility" => [
                        'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                    ]
                ]),
                new Query\Terms("${projectPath}.restrictedViewerIds", [$viewer->getId()])
            ]),
            (new BoolQuery())->addMust([
                new Query\Terms("${projectPath}.visibility", $visibility),
                new Query\Range("${projectPath}.visibility", [
                    'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                ])
            ])
        ];
    }

    protected function getCursors(ResultSet $resultSet): array
    {
        return array_map(static function (Result $result) {
            return $result->getParam('sort');
        }, $resultSet->getResults());
    }

    protected function applyCursor(Query $query, ?string $cursor): void
    {
        if ($cursor) {
            $query->setParam('search_after', ElasticsearchPaginator::decodeCursor($cursor));
        }
    }
}

<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;
use Elastica\ResultSet;
use Symfony\Component\HttpFoundation\RequestStack;

abstract class Search
{
    public const NONE_VALUE = 'NONE';
    public const RESULTS_PER_PAGE = 10;
    public const BIG_INT_VALUE = 2147483647;

    public const AVAILABLE_TYPES_FOR_MULTI_MATCH = [
        Query\MultiMatch::TYPE_BEST_FIELDS,
        Query\MultiMatch::TYPE_MOST_FIELDS,
        Query\MultiMatch::TYPE_CROSS_FIELDS,
        Query\MultiMatch::TYPE_PHRASE,
        Query\MultiMatch::TYPE_PHRASE_PREFIX,
    ];
    protected $type;

    public function __construct(protected Index $index)
    {
    }

    public static function generateSeed(?RequestStack $requestStack = null, $viewer = null)
    {
        if ($viewer instanceof User) {
            // sprintf with %u is here in order to avoid negative int.
            return sprintf('%u', crc32((string) $viewer->getId()));
        }

        if ($requestStack && $requestStack->getCurrentRequest()) {
            // sprintf with %u is here in order to avoid negative int.
            return sprintf(
                '%u',
                ip2long(RequestGuesser::getClientIpFromRequest($requestStack->getCurrentRequest()))
            );
        }

        return random_int(0, \PHP_INT_MAX);
    }

    public function getHydratedResults(EntityRepository $repository, array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $results = $repository->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort(
            $results,
            static fn ($a, $b) => array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false)
        );

        return $results;
    }

    public function getHydratedResultsFromRepositories(array $repositories, ResultSet $set): array
    {
        $informations = array_map(
            static fn (Result $result) => [
                'id' => $result->getDocument()->get('id'),
                'objectType' => $result->getDocument()->get('objectType'),
                'geoip' => $result->getDocument()->has('geoip')
                    ? $result->getDocument()->get('geoip')
                    : null,
            ],
            $set->getResults()
        );
        $ids = array_map(static fn (array $information) => $information['id'], $informations);

        $types = array_unique(
            array_map(static fn (array $information) => $information['objectType'], $informations)
        );
        $map = [];
        foreach ($types as $type) {
            $typeInformations = array_filter(
                $informations,
                static fn (array $information) => $information['objectType'] === $type
            );
            $typeIds = array_map(
                static fn (array $information) => $information['id'],
                $typeInformations
            );
            $map[$type] = $typeIds;
        }
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $results = [];
        foreach ($map as $objectType => $objectIds) {
            array_push($results, ...$repositories[$objectType]->hydrateFromIds($objectIds));
        }
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($results, static fn ($a, $b) => array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false));

        $this->addGeoIpData($results, $informations);

        return $results;
    }

    protected function addGeoIpData(array $results, array $informations): void
    {
        $informationsWithIdAsKey = [];
        foreach ($informations as $information) {
            $informationsWithIdAsKey[$information['id']] = $information['geoip'];
        }
        foreach ($results as $result) {
            if (!empty($informationsWithIdAsKey[$result->getId()])) {
                $result->geoip = [
                    'countryName' => $informationsWithIdAsKey[$result->getId()]['country_name'] ?? null,
                    'regionName' => $informationsWithIdAsKey[$result->getId()]['region_name'] ?? null,
                    'cityName' => $informationsWithIdAsKey[$result->getId()]['city_name'] ?? null,
                ];
            }
        }
    }

    /**
     * Type does not exists anymore in Elasticsearch,
     * so we use this method to add a "objectType" filter.
     *
     * @param null|mixed $type
     */
    protected function addObjectTypeFilter(Query $query, $type = null): void
    {
        $bool = $query->getQuery();

        if (!($bool instanceof Query\BoolQuery)) {
            $bool = new Query\BoolQuery();
            $bool->addMust($query->getQuery());
        }

        $bool->addFilter($this->createObjectTypeFilter($type));
        $query->setQuery($bool);
    }

    protected function addObjectNotTypeFilter(Query $query, $type = null): void
    {
        $bool = $query->getQuery();

        if (!($bool instanceof Query\BoolQuery)) {
            $bool = new Query\BoolQuery();
            $bool->addMust($query->getQuery());
        }

        $bool->addMustNot($this->createObjectTypeFilter($type));

        $query->setQuery($bool);
    }

    protected function searchTermsInMultipleFields(
        Query\BoolQuery $query,
        array $fields,
        $terms = null,
        $type = null
    ): Query\BoolQuery {
        if (empty(trim((string) $terms))) {
            $multiMatchQuery = new Query\MatchAll();
        } else {
            $fields = $this->formatFieldsBoosts($fields);
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
            $matchQuery = new Query\MatchQuery($fieldName, $terms);
        }

        $query->addMustNot($matchQuery);

        return $query;
    }

    protected function getHydratedResultsFromResultSet(
        EntityRepository $repository,
        ResultSet $resultSet
    ): array {
        $ids = array_map(static fn (Result $result) => $result->getDocument()->get('id'), $resultSet->getResults());

        return $this->getHydratedResults($repository, $ids);
    }

    protected function getRandomSortedQuery(Query\AbstractQuery $query, ?int $seed = 123): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore->setBoostMode(Query\FunctionScore::BOOST_MODE_REPLACE);
        $functionScore->setQuery($query);
        $functionScore->setRandomScore($seed);

        return new Query($functionScore);
    }

    protected function getFiltersForProjectViewerCanSee(string $projectPath, ?User $viewer): array
    {
        if (!$viewer) {
            return [
                (new BoolQuery())->addShould(
                    new Term([
                        "{$projectPath}.visibility" => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                        ],
                    ])
                ),
            ];
        }
        $visibility = ProjectVisibilityMode::getProjectVisibilityByRoles($viewer);

        return [
            (new BoolQuery())
                ->addShould(new Query\Terms("{$projectPath}.authors.id", [$viewer->getId()]))
                ->addShould(
                    new Term([
                        "{$projectPath}.visibility" => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                        ],
                    ])
                ),
            (new BoolQuery())
                ->addFilter(
                    new Term([
                        "{$projectPath}.visibility" => [
                            'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM,
                        ],
                    ])
                )
                ->addFilter(
                    new Query\Terms("{$projectPath}.restrictedViewerIds", [$viewer->getId()])
                ),
            (new BoolQuery())
                ->addFilter(new Query\Terms("{$projectPath}.visibility", $visibility))
                ->addFilter(
                    new Query\Range("{$projectPath}.visibility", [
                        'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM,
                    ])
                ),
        ];
    }

    protected function formatFieldsBoosts(array $fields): array
    {
        $formattedFields = [];
        foreach ($fields as $key => $value) {
            if (!\is_string($key)) {
                $formattedFields[] = $value;
            } else {
                $formattedFields[] = $key . '^' . $value;
            }
        }

        return $formattedFields;
    }

    protected function getCursors(ResultSet $resultSet): array
    {
        return array_map(static fn (Result $result) => $result->getParam('sort'), $resultSet->getResults());
    }

    protected function applyCursor(Query $query, ?string $cursor): void
    {
        if ($cursor) {
            $query->setParam('search_after', ElasticsearchPaginator::decodeCursor($cursor));
        }
    }

    protected function setSortWithId(Query $query, array $sortArgs)
    {
        return $query->setParam('sort', array_merge($sortArgs, ['id' => new \stdClass()]));
    }

    protected function filterTrashed(array &$filters, BoolQuery $boolQuery): void
    {
        if (isset($filters['trashed']) && !$filters['trashed']) {
            $boolQuery->addMustNot(new Exists('trashedAt'));
            unset($filters['trashed']);
        }
        unset($filters['trashed']);
    }

    protected function getSort(string $order): array
    {
        switch ($order) {
            case 'old':
                $sortField = 'createdAt';
                $sortOrder = 'asc';

                break;

            case 'last':
                $sortField = 'createdAt';
                $sortOrder = 'desc';

                break;

            case 'old-published':
                $sortField = 'publishedAt';
                $sortOrder = 'asc';

                break;

            case 'last-published':
                $sortField = 'publishedAt';
                $sortOrder = 'desc';

                break;

            case 'comments':
                return [
                    'commentsCount' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc'],
                ];

            case 'least-popular':
                return [
                    'votesCountNok' => ['order' => 'DESC'],
                    'votesCountOk' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC'],
                ];

            case 'least-voted':
                $sortField = 'votesCount';
                $sortOrder = 'asc';

                break;

            case 'position':
                $sortField = 'position';
                $sortOrder = 'desc';

                break;

            case 'least-position':
                $sortField = 'position';
                $sortOrder = 'asc';

                break;

            case 'popular':
                return [
                    'votesCountOk' => ['order' => 'DESC'],
                    'votesCountNok' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC'],
                ];

            case 'voted':
                $sortField = 'votesCount';
                $sortOrder = 'desc';

                break;

            default:
                throw new \RuntimeException('Unknown order: ' . $order);

                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function createObjectTypeFilter(?string $type = null): Query\Term
    {
        if (null === $type) {
            $type = $this->type;
            if (null === $type) {
                throw new \RuntimeException('Type is not specified!');
            }
        }

        return new Query\Term(['objectType' => $type]);
    }
}

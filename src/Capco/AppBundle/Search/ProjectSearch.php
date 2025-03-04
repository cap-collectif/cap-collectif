<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectAffiliation;
use Capco\AppBundle\Enum\ProjectStatus;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;

class ProjectSearch extends Search
{
    final public const SEARCH_FIELDS = [
        'title',
        'title.std',
        'reference',
        'reference.std',
        'body',
        'body.std',
        'object',
        'object.std',
        'teaser',
        'teaser.std',
    ];
    private const POPULAR = 'POPULAR';
    private const PUBLISHED_AT = 'PUBLISHED_AT';

    public function __construct(Index $index, private readonly ProjectRepository $projectRepo)
    {
        parent::__construct($index);
        $this->type = 'project';
    }

    public function searchProjects(
        int $offset,
        int $limit,
        array $orderBy,
        ?string $term,
        array $providedFilters,
        ?array $affiliations = null,
        ?User $user = null
    ): array {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            self::SEARCH_FIELDS,
            $term,
            'phrase_prefix'
        );

        if (
            isset($providedFilters['withEventOnly'])
            && true === $providedFilters['withEventOnly']
        ) {
            $withEventOnlyBoolQuery = new Query\BoolQuery();
            $withEventOnlyBoolQuery->addShould(new Query\Range('eventCount', ['gt' => 0]));
            $boolQuery->addFilter($withEventOnlyBoolQuery);
            unset($providedFilters['withEventOnly']);
        }

        if (isset($providedFilters['locale'])) {
            $localeBoolQuery = new Query\BoolQuery();
            $localeBoolQuery
                ->addShould(new Term(['locale.id' => ['value' => $providedFilters['locale']]]))
                ->addShould((new Query\BoolQuery())->addMustNot(new Exists('locale')))
            ;
            $boolQuery->addFilter($localeBoolQuery);
            unset($providedFilters['locale']);
        }

        $hasOwnerAffiliation =
            $user && $affiliations && \in_array(ProjectAffiliation::OWNER, $affiliations, true);
        if ($hasOwnerAffiliation) {
            $boolQuery->addFilter(new Term(['owner.id' => $user->getId()]));
        }

        $hasAuthorAffiliation =
            $user && $affiliations && \in_array(ProjectAffiliation::AUTHOR, $affiliations, true);
        if ($hasAuthorAffiliation) {
            $boolQuery->addFilter(new Term(['authors.id' => $user->getId()]));
        }

        foreach ($providedFilters as $key => $value) {
            if ('authors.id' === $key && $value) {
                $boolQuery->addFilter(new Query\Terms($key, [$value]));

                continue;
            }

            if ('projectStatus' === $key && $value === (string) ProjectStatus::OPENED) {
                $boolQuery->addFilter(new Query\Terms($key, [$value, (string) ProjectStatus::OPENED_PARTICIPATION]));

                continue;
            }

            if (null !== $value) {
                $boolQuery->addFilter(new Term([$key => ['value' => $value]]));
            }
        }

        $boolQuery->addFilter(new Exists('id'));

        $query = new Query($boolQuery);

        $query->setSort($this->getProjectSort($orderBy));

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit)
        ;

        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $results = $this->getHydratedResultsFromResultSet($this->projectRepo, $resultSet);

        return [
            'projects' => $results,
            'count' => $resultSet->getTotalHits(),
        ];
    }

    public function getAllContributions(): int
    {
        $query = new Query();
        $query->setSource(['contributionsCount', 'visibility']);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query, $this->projectRepo->count([]));
        $totalCount = array_sum(
            array_map(static function (Result $result) {
                if (ProjectVisibilityMode::VISIBILITY_PUBLIC === $result->getData()['visibility']) {
                    return $result->getData()['contributionsCount'];
                }

                return 0;
            }, $resultSet->getResults())
        );

        return $totalCount;
    }

    private function getProjectSort(array $orderBy): array
    {
        switch ($orderBy['field']) {
            case self::POPULAR:
                return [
                    'contributionsCount' => ['order' => $orderBy['direction']],
                    'createdAt' => ['order' => 'desc'],
                ];

            case self::PUBLISHED_AT:
                $sortField = 'publishedAt';
                $sortOrder = $orderBy['direction'];

                break;

            default:
                throw new \RuntimeException("Unknown order: {$orderBy}");
        }

        return [$sortField => ['order' => $sortOrder]];
    }
}

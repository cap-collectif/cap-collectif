<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\EventAffiliation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;
use Capco\AppBundle\Enum\EventOrderField;
use Elastica\ResultSet;

class EventSearch extends Search
{
    const SEARCH_FIELDS = [
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
        'fullAddress',
        'fullAddress.std',
    ];

    private EventRepository $eventRepository;
    private EntityManagerInterface $em;

    public function __construct(
        Index $index,
        EventRepository $eventRepository,
        EntityManagerInterface $em
    ) {
        parent::__construct($index);
        $this->eventRepository = $eventRepository;
        $this->type = 'event';
        $this->em = $em;
    }

    public function searchEvents(
        ?string $cursor,
        int $limit,
        ?string $terms,
        array $providedFilters,
        array $orderBy,
        ?array $affiliations = null,
        ?User $user = null,
        ?bool $onlyWhenAuthor = false
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            self::SEARCH_FIELDS,
            $terms,
            'phrase_prefix'
        );

        $hasOwnerAffiliation =
            $user &&
            !$onlyWhenAuthor &&
            $affiliations &&
            \in_array(EventAffiliation::OWNER, $affiliations, true);
        if ($hasOwnerAffiliation) {
            $boolQuery->addFilter(new Term(['owner.id' => $user->getId()]));
        }

        if ($user && $onlyWhenAuthor) {
            $boolQuery->addFilter(new Term(['author.id' => $user->getId()]));
        }

        if (isset($providedFilters['isFuture'])) {
            switch ($providedFilters['isFuture']) {
                // PASSED only
                case false:
                    $dateBoolQuery = new Query\BoolQuery();
                    $endDateIsNullQuery = new Query\BoolQuery();
                    $dateBoolQuery->addShould(new Query\Range('endAt', ['lt' => 'now/d']));
                    $endDateIsNullQuery->addMustNot(new Query\Exists('endAt'));
                    $dateBoolQuery->addShould($endDateIsNullQuery);
                    $boolQuery->addFilter($dateBoolQuery);
                    $boolQuery->addMust(new Query\Range('startAt', ['lt' => 'now/d']));

                    break;
                // FUTURE and current
                case true:
                    $dateBoolQuery = new Query\BoolQuery();
                    $dateBoolQuery->addShould(new Query\Range('startAt', ['gte' => 'now/d']));
                    $dateBoolQuery->addShould(new Query\Range('endAt', ['gte' => 'now/d']));
                    $boolQuery->addFilter($dateBoolQuery);

                    break;
                // FUTURE and PASSED (null case)
                default:
                    break;
            }
        }

        $filters = $this->getFilters($providedFilters);
        foreach ($filters as $key => $value) {
            $boolQuery->addFilter(new Term([$key => ['value' => $value]]));
        }
        $boolQuery->addFilter(new Exists('id'));

        if ('random' === $orderBy['field']) {
            $query = $this->getRandomSortedQuery($boolQuery);
        } else {
            $query = new Query($boolQuery);
            $query->setSort($this->getEventSort($orderBy));
        }

        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $this->applyCursor($query, $cursor);
        $query->setTrackTotalHits(true);

        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    public function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        $emFilters = $this->em->getFilters();
        if ($emFilters->isEnabled('softdeleted')) {
            $this->em->getFilters()->disable('softdeleted');
        }
        $results = new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->eventRepository, $response),
            $cursors,
            $response->getTotalHits()
        );
        $emFilters->enable('softdeleted');

        return $results;
    }

    public function getAllIdsOfAuthorOfEvent(?string $terms = null): array
    {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            ['author.username', 'author.username.std'],
            $terms,
            'phrase_prefix'
        );

        $query = new Query($boolQuery);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        $authorIds = array_map(static function (Result $result) {
            return $result->getData()['author']['id'];
        }, $resultSet->getResults());

        return array_unique($authorIds);
    }

    private function getEventSort(array $orderBy): array
    {
        switch ($orderBy['field']) {
            case EventOrderField::END_AT:
                return [
                    'endAt' => ['order' => $orderBy['direction']],
                    'startAt' => ['order' => $orderBy['direction']],
                    'createdAt' => ['order' => $orderBy['direction']],
                ];

            case EventOrderField::START_AT:
                return [
                    'startAt' => ['order' => $orderBy['direction']],
                    'endAt' => ['order' => $orderBy['direction']],
                    'createdAt' => ['order' => $orderBy['direction']],
                ];
            default:
                throw new \RuntimeException("Unknown order: ${$orderBy['field']}");
        }
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];

        if (isset($providedFilters['themes'])) {
            $filters['themes.id'] = $providedFilters['themes'];
        }
        if (isset($providedFilters['locale'])) {
            $filters['translations.locale'] = $providedFilters['locale'];
        }
        if (isset($providedFilters['isRegistrable'])) {
            $filters['isRegistrable'] = $providedFilters['isRegistrable'];
        }
        if (isset($providedFilters['isPresential'])) {
            $filters['isPresential'] = $providedFilters['isPresential'];
        }
        if (isset($providedFilters['enabled'])) {
            $filters['enabled'] = $providedFilters['enabled'];
        }
        if (isset($providedFilters['projects'])) {
            $filters['projects.id'] = $providedFilters['projects'];
        }
        if (isset($providedFilters['userType'])) {
            $filters['author.userType.id'] = $providedFilters['userType'];
        }
        if (isset($providedFilters['author'])) {
            $filters['author.id'] = GlobalIdResolver::getDecodedId($providedFilters['author'])[
                'id'
            ];
        }
        if (isset($providedFilters['status']) && null !== $providedFilters['status']) {
            $filters['eventStatus'] = $providedFilters['status'];
        }

        return $filters;
    }
}

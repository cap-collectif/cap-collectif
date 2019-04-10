<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\EventRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;

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

    private const OLD = false;
    private const LAST = true;

    private $eventRepository;

    public function __construct(Index $index, EventRepository $eventRepository)
    {
        parent::__construct($index);
        $this->eventRepository = $eventRepository;
        $this->type = 'event';
    }

    public function searchEvents(
        int $offset,
        int $limit,
        ?string $order,
        $terms,
        array $providedFilters
    ): array {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            self::SEARCH_FIELDS,
            $terms,
            'phrase_prefix'
        );

        if (isset($providedFilters['isFuture'])) {
            switch ($providedFilters['isFuture']) {
                // PASSED only
                case self::OLD:
                    $dateBoolQuery = new Query\BoolQuery();
                    $endDateIsNullQuery = new Query\BoolQuery();
                    $dateBoolQuery->addShould(new Query\Range('endAt', ['lt' => 'now/d']));
                    $endDateIsNullQuery->addMustNot(new Query\Exists('endAt'));
                    $dateBoolQuery->addShould($endDateIsNullQuery);
                    $boolQuery->addMust($dateBoolQuery);
                    $boolQuery->addMust(new Query\Range('startAt', ['lt' => 'now/d']));

                    break;
                // FUTURE and current
                case self::LAST:
                    $dateBoolQuery = new Query\BoolQuery();
                    $dateBoolQuery->addShould(new Query\Range('startAt', ['gt' => 'now/d']));
                    $dateBoolQuery->addShould(new Query\Range('endAt', ['gt' => 'now/d']));
                    $boolQuery->addMust($dateBoolQuery);

                    break;
                // FUTURE and PASSED
                default:
                    break;
            }
        }

        $filters = $this->getFilters($providedFilters);

        foreach ($filters as $key => $value) {
            $boolQuery->addMust(new Term([$key => ['value' => $value]]));
        }
        $boolQuery->addMust(new Exists('id'));

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery);
        } else {
            $query = new Query($boolQuery);
            if (null !== $order) {
                $query->setSort($this->getSort($order));
            }
        }

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);

        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());

        return [
            'events' => $this->getHydratedResults($ids),
            'count' => $resultSet->getTotalHits(),
            'order' => $order,
        ];
    }

    public function getAllAuthorOfEvent($terms): array
    {
        $boolQuery = new Query\BoolQuery();
        $boolQuery = $this->searchTermsInMultipleFields(
            $boolQuery,
            ['author.username', 'author.username.std'],
            $terms,
            'phrase_prefix'
        );

        $query = new Query($boolQuery);
        $resultSet = $this->index->getType($this->type)->search($query);

        $authorIds = array_map(function (Result $result) {
            return $result->getData()['author']['id'];
        }, $resultSet->getResults());

        return array_unique($authorIds);
    }

    public function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $events = $this->eventRepository->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($events, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $events;
    }

    private function getSort($order): array
    {
        switch ($order) {
            case self::OLD:
                $sortField = 'endAt';
                $sortOrder = 'desc';

                break;
            case self::LAST:
                $sortField = 'startAt';
                $sortOrder = 'asc';

                break;
            case 'slug':
                $sortField = 'slug';
                $sortOrder = 'desc';

                break;
            default:
                throw new \RuntimeException("Unknow order: ${order}");

                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];

        if (isset($providedFilters['themes'])) {
            $filters['themes.id'] = $providedFilters['themes'];
        }
        if (isset($providedFilters['isRegistrable'])) {
            $filters['isRegistrable'] = $providedFilters['isRegistrable'];
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

        return $filters;
    }
}

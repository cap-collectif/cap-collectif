<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Repository\EventRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;
use Capco\AppBundle\Entity\Event;

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
                    $dateBoolQuery->addShould(new Query\Range('startAt', ['gte' => 'now/d']));
                    $dateBoolQuery->addShould(new Query\Range('endAt', ['gte' => 'now/d']));
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

        $events = $this->getHydratedResults(
            array_map(function (Result $result) {
                return $result->getData()['id'];
            }, $resultSet->getResults())
        );

        return [
            'events' => $events,
            'count' => $resultSet->getTotalHits(),
            'order' => $order,
        ];
    }

    public function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order of ids
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(
            array_filter(
                array_map(function (string $id) {
                    return $this->eventRepository->findOneBy(['id' => $id, 'enabled' => true]);
                }, $ids),
                function (?Event $event) {
                    return null !== $event;
                }
            )
        );
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
        if (isset($providedFilters['author'])) {
            $filters['author.id'] = $providedFilters['author'];
        }
        if (isset($providedFilters['projects'])) {
            $filters['projects.id'] = $providedFilters['projects'];
        }

        return $filters;
    }
}

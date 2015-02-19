<?php

namespace Capco\AppBundle\Manager;


use Capco\AppBundle\Repository\EventRepository;

class EventResolver
{
    protected $repository;

    public function __construct(EventRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param $theme
     * @param $term
     * @return array
     */
    public function getEventsGroupedByYearAndMonth($theme, $term) {

        $results = $this->repository->getSearchResults($theme, $term);

        if (!empty($results)) {

            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }

            return $events;
        }

    }

    /**
     * @param $theme
     * @param $term
     * @return array
     */
    public function getEventsArchivedGroupedByYearAndMonth($theme, $term) {

        $results = $this->repository->getSearchResultsArchived($theme, $term);

        if (!empty($results)) {

            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }

            return $events;
        }

    }
}

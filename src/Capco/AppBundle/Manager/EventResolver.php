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
     * @param $consultation
     * @param $term
     * @return array
     */
    public function getEventsGroupedByYearAndMonth($theme, $consultation, $term)
    {

        $results = $this->repository->getSearchResults($theme, $consultation, $term);

        if (!empty($results)) {

            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }

            return $events;
        }

    }

    /**
     * @param $theme
     * @param $consultation
     * @param $term
     * @return array
     */
    public function getEventsArchivedGroupedByYearAndMonth($theme, $consultation, $term)
    {

        $results = $this->repository->getSearchResultsArchived($theme, $consultation, $term);

        if (!empty($results)) {

            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }

            return $events;
        }

    }
}

<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Repository\EventRepository;

class EventResolver
{
    protected $repository;

    public function __construct(EventRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param $themeSlug
     * @param $consultationSlug
     * @param $term
     *
     * @return array
     */
    public function countEvents($themeSlug, $consultationSlug, $term)
    {
        return $this->repository->countSearchResults($themeSlug, $consultationSlug, $term);
    }

    /**
     * @param $themeSlug
     * @param $consultationSlug
     * @param $term
     *
     * @return array
     */
    public function getEventsGroupedByYearAndMonth($themeSlug, $consultationSlug, $term)
    {
        $results = $this->repository->getSearchResults($themeSlug, $consultationSlug, $term);

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
     *
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

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
     * @param $archived
     * @param $themeSlug
     * @param $projectSlug
     * @param $term
     *
     * @return array
     */
    public function countEvents($archived, $themeSlug, $projectSlug, $term)
    {
        return $this->repository->countSearchResults($archived, $themeSlug, $projectSlug, $term);
    }

    /**
     * @param $archived
     * @param $themeSlug
     * @param $projectSlug
     * @param $term
     *
     * @return array
     */
    public function getEventsGroupedByYearAndMonth($archived, $themeSlug, $projectSlug, $term)
    {
        $results = $this->repository->getSearchResults($archived, $themeSlug, $projectSlug, $term);
        $events = [];

        if (!empty($results)) {
            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }
        }

        return $events;
    }

    public function getLastByProject($projectSlug, $limit = null)
    {
        $events = $this->repository->getSearchResults(null, null, $projectSlug, null, $limit);

        return $events;
    }
}

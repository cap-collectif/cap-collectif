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
     * @param $consultationSlug
     * @param $term
     *
     * @return array
     */
    public function countEvents($archived, $themeSlug, $consultationSlug, $term)
    {
        return $this->repository->countSearchResults($archived, $themeSlug, $consultationSlug, $term);
    }

    /**
     * @param $archived
     * @param $themeSlug
     * @param $consultationSlug
     * @param $term
     *
     * @return array
     */
    public function getEventsGroupedByYearAndMonth($archived, $themeSlug, $consultationSlug, $term)
    {
        $results = $this->repository->getSearchResults($archived, $themeSlug, $consultationSlug, $term);

        if (!empty($results)) {
            foreach ($results as $e) {
                $events[$e->getStartYear()][$e->getStartMonth()][] = $e;
            }

            return $events;
        }
    }

    public function getLastByConsultation($consultationSlug, $limit)
    {
        $events = $this->repository->getLastByConsultation(false, $consultationSlug, $limit);
        $left = $limit - count($events);
        if ($left > 0) {
            $events = array_merge($events, $this->repository->getLastByConsultation(true, $consultationSlug, $limit));
        }

        return $events;
    }
}

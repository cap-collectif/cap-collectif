<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\DTO\Analytics\AnalyticsContributor;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\ResultSet;

class AnalyticsTopContributors
{
    private UserRepository $repository;
    private iterable $contributors = [];

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getContributors(): iterable
    {
        return $this->contributors;
    }

    public function fromEs(ResultSet $set): self
    {
        $contributions = array_map(
            static fn (array $bucket) => [
                'contributorId' => $bucket['key'],
                'contributions' => $bucket['objectType']['buckets'],
            ],
            $set->getAggregation('author')['buckets']
        );
        $ids = array_map(
            static fn (array $contribution) => $contribution['contributorId'],
            $contributions
        );
        $users = $this->repository->hydrateFromIdsOrdered($ids);

        $this->contributors = array_map(
            static function (array $contribution, int $i) use ($users) {
                return (new AnalyticsContributor($users[$i]))->fromEs(
                    $contribution['contributions']
                );
            },
            $contributions,
            array_keys($contributions)
        );

        return $this;
    }
}

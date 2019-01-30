<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Elastica\Result;

class UserSearch extends Search
{
    const SEARCH_FIELDS = ['username', 'username.std'];

    private $userRepo;

    public function __construct(Index $index, UserRepository $userRepo)
    {
        parent::__construct($index);
        $this->userRepo = $userRepo;
        $this->type = 'user';
    }

    public function searchAllUsers($terms = null, $notInIds = [], $onlyUsers = false): array
    {
        $query = new Query\BoolQuery();

        if ($terms) {
            $query = $this->searchTermsInMultipleFields(
                $query,
                self::SEARCH_FIELDS,
                $terms,
                'phrase_prefix'
            );
        }
        if (\count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $resultSet = $this->index->getType($this->type)->search($query);

        if ($onlyUsers) {
            return $this->getHydratedResults($resultSet->getResults());
        }

        return [
            'users' => $this->getHydratedResults($resultSet->getResults()),
            'count' => $resultSet->getTotalHits(),
        ];
    }

    public function getContributorByProject(Project $project, int $offset, int $limit): array
    {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('contributionsCountByProject');

        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(
            new Term(['contributionsCountByProject.project.id' => $project->getId()])
        );
        $boolQuery->addMust(new Range('contributionsCountByProject.count', ['gt' => 0]));

        $nestedQuery->setQuery($boolQuery);

        $query = new Query($nestedQuery);
        $query->setSort([
            'contributionsCountByProject.count' => [
                'order' => 'desc',
                'nested_filter' => [
                    'term' => ['contributionsCountByProject.project.id' => $project->getId()],
                ],
            ],
        ]);

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType('user')->search($query);

        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());

        return [
            'results' => $this->getHydratedResults($ids),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    public function getContributorByStep(AbstractStep $step, int $offset, int $limit): array
    {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('contributionsCountByStep');

        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(new Term(['contributionsCountByStep.step.id' => $step->getId()]));
        $boolQuery->addMust(new Range('contributionsCountByStep.count', ['gt' => 0]));

        $nestedQuery->setQuery($boolQuery);

        $query = new Query($nestedQuery);
        $query->setSort([
            'contributionsCountByStep.count' => [
                'order' => 'desc',
                'nested_filter' => [
                    'term' => ['contributionsCountByStep.step.id' => $step->getId()],
                ],
            ],
        ]);

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType('user')->search($query);

        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());

        return [
            'results' => $this->getHydratedResults($ids),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    private function getHydratedResults(array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $users = $this->userRepo->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($users, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $users;
    }
}

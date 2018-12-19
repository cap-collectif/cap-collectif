<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
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

    public function searchAllUsers($terms = null, $notInIds = []): array
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

        return [
            'results' => $this->getHydratedResults($resultSet->getResults()),
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

        return [
            'results' => $this->getHydratedResults($resultSet->getResults()),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    private function getHydratedResults(array $results): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(
            array_filter(
                array_map(function (Result $result) {
                    return $this->userRepo->findOneBy(['id' => $result->getData()['id']]);
                }, $results),
                function (?User $user) {
                    return null !== $user;
                }
            )
        );
    }
}

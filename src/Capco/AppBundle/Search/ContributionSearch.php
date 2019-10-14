<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\UserBundle\Entity\User;
use Elastica\Aggregation\Terms;
use Elastica\Query;
use Elastica\ResultSet;

class ContributionSearch extends Search
{
    public function countByAuthorAndProject(User $user, string $projectId): int
    {
        $response = $this->index->search(
            $this->createCountByAuthorAndProjectQuery($user, $projectId)
        );

        return $response->getTotalHits();
    }

    public function countByAuthorAndStep(User $user, string $stepId): int
    {
        $response = $this->index->search($this->createCountByAuthorAndStepQuery($user, $stepId));

        return $response->getTotalHits();
    }

    public function countByAuthorAndConsultation(User $user, string $consultationId): int
    {
        $response = $this->index->search(
            $this->createCountByAuthorAndConsultationQuery($user, $consultationId)
        );

        return $response->getTotalHits();
    }

    public function countByAuthor(User $user): int
    {
        $response = $this->index->search($this->createCountByAuthorQuery($user));

        return $response->getTotalHits();
    }

    public function getContributionsByAuthor(User $user): ResultSet
    {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $query->setSize(0);
        $query->addAggregation(
            (new Terms('projects'))
                ->setField('project.id')
                ->addAggregation(
                    (new Terms('steps'))
                        ->setField('step.id')
                        ->addAggregation((new Terms('consultations'))->setField('consultation.id'))
                )
        );

        return $this->index->search($query);
    }

    public function getContributionsByAuthorAndTypes(
        User $user,
        array $contributionTypes = null
    ): ResultSet {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );
        $this->applyContributionsFilters($boolQuery, $contributionTypes);

        $query = new Query($boolQuery);
        $query->setSize(0);
        foreach ($contributionTypes as $type) {
            $query->addAggregation((new Terms($type))->setField('id'));
        }

        return $this->index->search($query);
    }

    private function createCountByAuthorQuery(User $user): Query
    {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function createCountByAuthorAndProjectQuery(User $user, string $projectId): Query
    {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['project.id' => ['value' => $projectId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]));
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function createCountByAuthorAndStepQuery(User $user, string $stepId): Query
    {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['step.id' => ['value' => $stepId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]));
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function applyContributionsFilters(
        Query\BoolQuery $query,
        array $contributionTypes = null
    ): void {
        $query
            ->addFilter(
                new Query\Terms(
                    '_type',
                    $contributionTypes ?: $this->getContributionElasticsearchTypes()
                )
            )
            ->addMustNot([
                new Query\Term(['published' => ['value' => false]]),
                new Query\Exists('comment'),
                new Query\Term(['draft' => ['value' => true]]),
                new Query\Term(['trashed' => ['value' => true]])
            ]);
    }

    private function createCountByAuthorAndConsultationQuery(
        User $user,
        string $consultationId
    ): Query {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['published' => ['value' => true]]))
            ->addFilter(new Query\Term(['consultation.id' => ['value' => $consultationId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]))
            ->addFilter(
                new Query\Terms('_type', $this->getConsultationContributionElasticsearchTypes())
            )
            ->addMustNot([new Query\Exists('comment')]);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    /**
     * @param query $query
     *
     * Group each result by its type
     */
    private function addAggregationOnTypes(Query $query): void
    {
        $query->setSize(0);
        $agg = new Terms('types');
        $agg->setField('_type');
        $query->addAggregation($agg);
    }

    private function getContributionElasticsearchTypes(): array
    {
        return [
            Opinion::getElasticsearchTypeName(),
            OpinionVersion::getElasticsearchTypeName(),
            Argument::getElasticsearchTypeName(),
            Source::getElasticsearchTypeName(),
            Proposal::getElasticsearchTypeName(),
            AbstractVote::getElasticsearchTypeName(),
            Reply::getElasticsearchTypeName()
        ];
    }

    private function getConsultationContributionElasticsearchTypes(): array
    {
        return [
            Opinion::getElasticsearchTypeName(),
            OpinionVersion::getElasticsearchTypeName(),
            Argument::getElasticsearchTypeName(),
            Source::getElasticsearchTypeName(),
            AbstractVote::getElasticsearchTypeName()
        ];
    }
}

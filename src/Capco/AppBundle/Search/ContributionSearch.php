<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use Elastica\Aggregation\Terms;
use Elastica\Query;

class ContributionSearch extends Search
{
    public function countByAuthorAndProject(User $user, Project $project): int
    {
        $response = $this->index->search(
            $this->createCountByAuthorAndProjectQuery($user, $project)
        );

        return $response->getTotalHits();
    }

    public function countByAuthorAndStep(User $user, AbstractStep $step): int
    {
        // TODO: Implements this method.
    }

    private function createCountByAuthorAndProjectQuery(User $user, Project $project): Query
    {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['published' => ['value' => true]]))
            ->addFilter(new Query\Term(['project.id' => ['value' => $project->getId()]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]))
            ->addFilter(new Query\Terms('_type', $this->getContributionElasticsearchTypes()))
            ->addMustNot([
                new Query\Exists('comment'),
                new Query\Term(['draft' => ['value' => true]]),
                new Query\Term(['trashed' => ['value' => true]])
            ]);

        $query = new Query($boolQuery);
        $query->setSize(0);
        $agg = new Terms('types');
        $agg->setField('_type');
        $query->addAggregation($agg);

        return $query;
    }

    private function createCountByAuthorAndStepQuery(User $user, AbstractStep $step): Query
    {
        // TODO: Implements this method.
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
}

<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * A like on an argument in a debate.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class DebateArgumentVote extends AbstractVote implements EntityInterface
{
    use AuthorInformationTrait;
    use ContributionOriginTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\DebateArgument", inversedBy="votes")
     * @ORM\JoinColumn(name="debate_argument_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private DebateArgument $debateArgument;

    public function getRelated(): DebateArgument
    {
        return $this->debateArgument;
    }

    public function getDebateArgument(): DebateArgument
    {
        return $this->debateArgument;
    }

    public function setDebateArgument(DebateArgument $debateArgument): self
    {
        $this->debateArgument = $debateArgument;

        return $this;
    }

    public function getStep(): ?DebateStep
    {
        return $this->debateArgument->getDebate()->getStep();
    }

    public function getProject(): ?Project
    {
        return $this->getStep() ? $this->getStep()->getProject() : null;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchVoteNestedDebateArgument',
        ]);
    }
}

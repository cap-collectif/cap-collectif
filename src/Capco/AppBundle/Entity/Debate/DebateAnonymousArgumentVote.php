<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * A like on an anonymous argument in a debate.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class DebateAnonymousArgumentVote extends AbstractVote
{
    use AuthorInformationTrait;
    use ContributionOriginTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\DebateAnonymousArgument", inversedBy="votes")
     * @ORM\JoinColumn(name="debate_anonymous_argument_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private DebateAnonymousArgument $debateAnonymousArgument;

    public function getRelated(): DebateAnonymousArgument
    {
        return $this->debateAnonymousArgument;
    }

    public function getDebateArgument(): DebateAnonymousArgument
    {
        return $this->debateAnonymousArgument;
    }

    public function setDebateArgument(DebateAnonymousArgument $debateArgument): self
    {
        $this->debateAnonymousArgument = $debateArgument;

        return $this;
    }

    public function getStep(): ?DebateStep
    {
        return $this->getDebateArgument()
            ->getDebate()
            ->getStep()
        ;
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

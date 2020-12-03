<?php

namespace Capco\AppBundle\Entity\Debate;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\DebateStep;

/**
 * A like on an argument in a debate.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class DebateArgumentVote extends AbstractVote
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\DebateArgument", inversedBy="votes")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $debateArgument;

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

    // TODO not enable for now.
    public function isIndexable(): bool
    {
        return false;
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [];
    }
}

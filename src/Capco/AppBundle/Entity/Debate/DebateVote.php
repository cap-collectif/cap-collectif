<?php

namespace Capco\AppBundle\Entity\Debate;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * A vote on a debate.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class DebateVote extends AbstractVote
{
    use DebatableTrait;
    public const VOTE_OK = 0;
    public const VOTE_NOK = 1;

    /**
     * This is not nullable, but because of single table inheritance,
     * we can not use "nullable=false", here.
     *
     * @Assert\Choice(choices={0, 1})
     * @ORM\Column(name="yes_no_value", type="integer")
     */
    private $yesNoValue;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $debate;

    public function getRelated(): Debate
    {
        return $this->getDebate();
    }

    public function getStep(): ?DebateStep
    {
        return $this->getDebate()->getStep();
    }

    public function getValue(): int
    {
        return $this->yesNoValue;
    }

    public function setValue(int $yesNoValue): self
    {
        $this->yesNoValue = $yesNoValue;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->getDebate()->getProject();
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

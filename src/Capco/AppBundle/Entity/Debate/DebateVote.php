<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Entity\Steps\DebateStep;

/**
 * A vote on a debate.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class DebateVote extends AbstractVote
{
    use AuthorInformationTrait;
    use ContributionOriginTrait;
    use DebatableTrait;
    use ForAgainstTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Debate $debate;

    public function getStep(): ?DebateStep
    {
        return $this->getDebate()->getStep();
    }

    public function getProject(): ?Project
    {
        return $this->getDebate()
            ->getStep()
            ->getProject();
    }

    public function isIndexable(): bool
    {
        return true;
    }
}

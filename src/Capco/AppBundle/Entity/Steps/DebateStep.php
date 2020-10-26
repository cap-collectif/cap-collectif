<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateStepRepository")
 */
class DebateStep extends AbstractStep implements ParticipativeStepInterface
{
    use TimelessStepTrait;

    public const TYPE = 'debate';

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate", mappedBy="step", cascade={"persist"})
     */
    private $debate;

    /**
     * When we create a debate step, we also create a debate.
     */
    public function __construct(Debate $debate)
    {
        parent::__construct();
        $this->debate = $debate;
        $debate->setStep($this);
    }

    public function getDebate(): Debate
    {
        return $this->debate;
    }

    public function getType(): string
    {
        return self::TYPE;
    }

    public function isParticipative(): bool
    {
        // TODO enable this for step exports.
        return false;
    }

    public function isVotable(): bool
    {
        // TODO enable this for "votes" counter.
        return false;
    }
}

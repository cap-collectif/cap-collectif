<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\Common\Collections\Collection;
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
     * @ORM\Column(name="is_anonymous_participation_allowed", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $isAnonymousParticipationAllowed = false;

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

    /**
     * @return Collection|DebateArticle[]
     */
    public function getArticles(): Collection
    {
        return $this->getDebate()->getArticles();
    }

    public function addArticle(DebateArticle $article): self
    {
        $this->getDebate()->addArticle($article);

        return $this;
    }

    public function removeArticle(DebateArticle $article): self
    {
        $this->getDebate()->removeArticle($article);

        return $this;
    }

    public function isDebateStep(): bool
    {
        return true;
    }

    public function isParticipative(): bool
    {
        // TODO enable this for step exports.
        return false;
    }

    public function isVotable(): bool
    {
        return true;
    }

    public function isAnonymousParticipationAllowed(): bool
    {
        return $this->isAnonymousParticipationAllowed;
    }

    public function setIsAnonymousParticipationAllowed(bool $isAnonymousParticipationAllowed): self
    {
        $this->isAnonymousParticipationAllowed = $isAnonymousParticipationAllowed;

        return $this;
    }
}

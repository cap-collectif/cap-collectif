<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * A debate.
 *
 * @ORM\Table(
 *     name="debate",
 *     uniqueConstraints={}
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateRepository")
 */
class Debate implements EntityInterface
{
    use UuidTrait;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Debate\DebateOpinion", mappedBy="debate", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected Collection $opinions;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Debate\DebateArgument", mappedBy="debate",  cascade={"remove"}, orphanRemoval=true)
     */
    protected Collection $arguments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Debate\DebateAnonymousArgument", mappedBy="debate",  cascade={"remove"}, orphanRemoval=true)
     */
    protected Collection $anonymousArguments;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\DebateStep", inversedBy="debate", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $step;

    /**
     * @ORM\OneToMany(targetEntity=DebateArticle::class, mappedBy="debate", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private Collection $articles;

    public function __construct()
    {
        $this->opinions = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->anonymousArguments = new ArrayCollection();
        $this->articles = new ArrayCollection();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;

            $originalArticles = $this->articles;
            $this->articles = new ArrayCollection();
            foreach ($originalArticles as $article) {
                $clonedArticle = clone $article;
                $this->addArticle($clonedArticle);
                $clonedArticle->setDebate($this);
            }

            $originalOpinions = $this->opinions;
            $this->opinions = new ArrayCollection();
            foreach ($originalOpinions as $opinion) {
                $clonedOpinion = clone $opinion;
                $this->addOpinion($clonedOpinion);
                $clonedOpinion->setDebate($this);
            }

            $this->arguments = new ArrayCollection();
            $this->anonymousArguments = new ArrayCollection();
        }
    }

    public function viewerCanParticipate(?User $viewer = null): bool
    {
        $step = $this->getStep();
        $project = $step->getProject();
        if ($project && !$project->viewerCanSee($viewer)) {
            return false;
        }

        return $step->canContribute($viewer);
    }

    public function getProject(): ?Project
    {
        return $this->getStep() ? $this->getStep()->getProject() : null;
    }

    public function getStep(): ?DebateStep
    {
        return $this->step;
    }

    public function setStep(DebateStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getOpinions(): Collection
    {
        return $this->opinions;
    }

    public function getForOpinion(): ?DebateOpinion
    {
        foreach ($this->opinions as $opinion) {
            if ($opinion->isFor()) {
                return $opinion;
            }
        }

        return null;
    }

    public function getAgainstOpinion(): ?DebateOpinion
    {
        foreach ($this->opinions as $opinion) {
            if ($opinion->isAgainst()) {
                return $opinion;
            }
        }

        return null;
    }

    public function addOpinion(DebateOpinion $opinion): self
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions[] = $opinion;
        }

        return $this;
    }

    public function removeOpinion(DebateOpinion $opinion): self
    {
        $this->opinions->removeElement($opinion);

        return $this;
    }

    public function getArguments(): Collection
    {
        return $this->arguments;
    }

    public function addArgument(DebateArgument $argument): self
    {
        if (!$this->arguments->contains($argument)) {
            $this->arguments[] = $argument;
        }

        return $this;
    }

    public function removeArgument(DebateArgument $argument): self
    {
        $this->arguments->removeElement($argument);

        return $this;
    }

    public function getAnonymousArguments(): Collection
    {
        return $this->anonymousArguments;
    }

    public function addAnonymousArgument(DebateAnonymousArgument $argument): self
    {
        if (!$this->anonymousArguments->contains($argument)) {
            $this->anonymousArguments[] = $argument;
        }

        return $this;
    }

    public function removeAnonymousArgument(DebateAnonymousArgument $argument): self
    {
        $this->anonymousArguments->removeElement($argument);

        return $this;
    }

    /**
     * @return Collection|DebateArticle[]
     */
    public function getArticles(): Collection
    {
        return $this->articles;
    }

    public function addArticle(DebateArticle $article): self
    {
        if (!$this->articles->contains($article)) {
            $this->articles[] = $article;
            $article->setDebate($this);
        }

        return $this;
    }

    public function removeArticle(DebateArticle $article): self
    {
        if ($this->articles->contains($article)) {
            $this->articles->removeElement($article);
            // set the owning side to null (unless already changed)
            if ($article->getDebate() === $this) {
                $article->setDebate(null);
            }
        }

        return $this;
    }
}

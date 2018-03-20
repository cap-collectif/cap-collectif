<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Interfaces\SelfLinkableInterface;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\AnswerableTrait;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\PinnableTrait;
use Capco\AppBundle\Traits\SelfLinkableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\ValidableTrait;
use Capco\AppBundle\Traits\VotableOkNokMitigeTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="opinion", indexes={@ORM\Index(name="idx_enabled", columns={"id", "enabled"})})
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\AppendicesCorrespondToOpinionType()
 */
class Opinion implements OpinionContributionInterface, SelfLinkableInterface
{
    use UuidTrait;
    use TrashableTrait;
    use SluggableTitleTrait;
    use VotableOkNokMitigeTrait;
    use ValidableTrait;
    use SelfLinkableTrait;
    use AnswerableTrait;
    use PinnableTrait;
    use ExpirableTrait;
    use TextableTrait;
    use ModerableTrait;

    public static $sortCriterias = [
        'positions' => 'opinion.sort.positions',
        'random' => 'opinion.sort.random',
        'last' => 'opinion.sort.last',
        'old' => 'opinion.sort.old',
        'favorable' => 'opinion.sort.favorable',
        'votes' => 'opinion.sort.votes',
        'comments' => 'opinion.sort.comments',
    ];

    /**
     * @ORM\Column(name="enabled", type="boolean")
     */
    protected $isEnabled = true;

    /**
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body", "appendices"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="position", type="integer", nullable=true)
     */
    protected $position = null;

    /**
     * @ORM\Column(name="versions_count", type="integer")
     */
    protected $versionsCount = 0;

    /**
     * @ORM\Column(name="sources_count", type="integer")
     */
    protected $sourcesCount = 0;

    /**
     * @ORM\Column(name="arguments_count", type="integer")
     */
    protected $argumentsCount = 0;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="opinions")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $Author;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Source", mappedBy="Opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"updatedAt" = "DESC"})
     */
    protected $Sources;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Argument", mappedBy="opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"updatedAt" = "DESC"})
     */
    protected $arguments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionModal", mappedBy="opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $modals;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Opinion", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $Reports;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionAppendix", mappedBy="opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $appendices;

    /**
     * @ORM\Column(name="ranking", type="integer", nullable=true)
     */
    protected $ranking = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="Opinions", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id", nullable=false)
     */
    private $OpinionType;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep", inversedBy="opinions", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id")
     * @Assert\NotNull()
     */
    private $step;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionVersion", mappedBy="parent", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"updatedAt" = "DESC"})
     */
    private $versions;

    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->Sources = new ArrayCollection();
        $this->versions = new ArrayCollection();
        $this->appendices = new ArrayCollection();
        $this->childConnections = new ArrayCollection();
        $this->parentConnections = new ArrayCollection();

        $this->updatedAt = new \Datetime();
        $this->createdAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New opinion';
    }

    public function getKind(): string
    {
        return 'opinion';
    }

    public function getRelated()
    {
        return null;
    }

    public function isIndexable()
    {
        return $this->getIsEnabled() && !$this->isExpired();
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position = null): self
    {
        $this->position = $position;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function getVersionsCount(): int
    {
        return $this->versionsCount;
    }

    public function setVersionsCount(int $versionsCount): self
    {
        $this->versionsCount = $versionsCount;

        return $this;
    }

    public function getSourcesCount(): int
    {
        return $this->sourcesCount;
    }

    public function setSourcesCount(int $sourcesCount): self
    {
        $this->sourcesCount = $sourcesCount;

        return $this;
    }

    public function incrementSourcesCount(): self
    {
        ++$this->sourcesCount;

        return $this;
    }

    public function decrementSourcesCount(): self
    {
        --$this->sourcesCount;

        return $this;
    }

    public function getArgumentsCount(): int
    {
        return $this->argumentsCount;
    }

    public function setArgumentsCount(int $argumentsCount): self
    {
        $this->argumentsCount = $argumentsCount;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->Author;
    }

    public function setAuthor(User $Author): self
    {
        $this->Author = $Author;

        return $this;
    }

    public function getOpinionType(): ?OpinionType
    {
        return $this->OpinionType;
    }

    public function setOpinionType(OpinionType $OpinionType): self
    {
        $this->OpinionType = $OpinionType;

        return $this;
    }

    public function getProject()
    {
        return $this->step->getProject();
    }

    public function getStep(): ?ConsultationStep
    {
        return $this->step;
    }

    public function setStep(ConsultationStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getSources(): Collection
    {
        return $this->Sources;
    }

    public function setSources(Collection $sources)
    {
        $this->Sources = $sources;

        return $this;
    }

    public function addSource(Source $source): self
    {
        if (!$this->Sources->contains($source)) {
            $this->Sources->add($source);
        }

        return $this;
    }

    public function removeSource(Source $source): self
    {
        $this->Sources->removeElement($source);

        return $this;
    }

    public function getArguments(): Collection
    {
        return $this->arguments;
    }

    public function setArguments(Collection $arguments): self
    {
        $this->arguments = $arguments;

        return $this;
    }

    public function addArgument(Argument $argument): self
    {
        if (!$this->arguments->contains($argument)) {
            $this->arguments->add($argument);
        }

        return $this;
    }

    public function removeArgument(Argument $argument): self
    {
        $this->arguments->removeElement($argument);

        return $this;
    }

    public function getModals(): Collection
    {
        return $this->modals;
    }

    public function addModal(OpinionModal $modal): self
    {
        if (!$this->modals->contains($modal)) {
            $this->modals->add($modal);
        }

        return $this;
    }

    public function removeModal(OpinionModal $modal): self
    {
        $this->modals->removeElement($modal);

        return $this;
    }

    public function getReports(): Collection
    {
        return $this->Reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    public function getVersions(): Collection
    {
        return $this->versions;
    }

    public function addVersion(OpinionVersion $version): self
    {
        if (!$this->versions->contains($version)) {
            $this->versions->add($version);
        }

        return $this;
    }

    public function removeVersion(OpinionVersion $version): self
    {
        $this->versions->removeElement($version);

        return $this;
    }

    public function getAppendices(): Collection
    {
        return $this->appendices;
    }

    public function setAppendices(Collection $appendices): self
    {
        $this->appendices = $appendices;

        return $this;
    }

    public function addAppendice(OpinionAppendix $appendix): self
    {
        if (!$this->appendices->contains($appendix)) {
            $appendix->setOpinion($this);
            $this->appendices->add($appendix);
        }

        return $this;
    }

    public function removeAppendice(OpinionAppendix $appendix): self
    {
        $this->appendices->removeElement($appendix);

        return $this;
    }

    public function getRanking()
    {
        return $this->ranking;
    }

    public function setRanking($ranking)
    {
        $this->ranking = $ranking;

        return $this;
    }

    // ******************************* Custom methods **************************************

    public function userHasReport(User $user): bool
    {
        foreach ($this->Reports as $report) {
            if ($report->getReporter() === $user) {
                return true;
            }
        }

        return false;
    }

    public function getArgumentForCount(): int
    {
        $i = 0;
        foreach ($this->arguments as $argument) {
            if (Argument::TYPE_FOR === $argument->getType()) {
                ++$i;
            }
        }

        return $i;
    }

    public function getArgumentAgainstCount(): int
    {
        $i = 0;
        foreach ($this->arguments as $argument) {
            if (Argument::TYPE_AGAINST === $argument->getType()) {
                ++$i;
            }
        }

        return $i;
    }

    public function getArgumentsCountByType($type): int
    {
        $count = 0;
        foreach ($this->arguments as $arg) {
            if (Argument::$argumentTypes[$arg->getType()] === $type) {
                ++$count;
            }
        }

        return $count;
    }

    public function canDisplay(): bool
    {
        return $this->getIsEnabled() && $this->getStep() && $this->getStep()->canDisplay();
    }

    public function canContribute(): bool
    {
        return $this->isActive() && $this->getStep()->canContribute();
    }

    public function isActive(): bool
    {
        return $this->getIsEnabled() && !$this->isTrashed();
    }

    public function canBeDeleted(): bool
    {
        return $this->isActive() && $this->getStep()->isActive();
    }

    public function isPublished(): bool
    {
        return $this->isEnabled && !$this->isTrashed;
    }

    public function getSortedAppendices()
    {
        $iterator = $this->appendices->getIterator();
        $iterator->uasort(function ($a, $b) {
            return ($this->getPositionForAppendixType($a->getAppendixType()) < $this->getPositionForAppendixType($b->getAppendixType())) ? -1 : 1;
        });

        return iterator_to_array($iterator);
    }

    public function getPositionForAppendixType($at)
    {
        foreach ($this->getOpinionType()->getAppendixTypes() as $otat) {
            if ($otat->getAppendixType()->getId() === $at->getId()) {
                return $otat->getPosition();
            }
        }

        return 0;
    }

    public function canAddVersions(): bool
    {
        if ($this->getOpinionType()) {
            return $this->getOpinionType()->isVersionable();
        }

        return false;
    }

    public function canAddSources(): bool
    {
        if ($this->getOpinionType()) {
            return $this->getOpinionType()->isSourceable();
        }

        return false;
    }

    public function getCommentSystem()
    {
        if ($this->getOpinionType()) {
            return $this->getOpinionType()->getCommentSystem();
        }
    }

    public function canAddComments(): bool
    {
        $cs = $this->getCommentSystem();

        return 1 === $cs || 2 === $cs;
    }

    public function increaseArgumentsCount(): self
    {
        ++$this->argumentsCount;

        return $this;
    }

    public function decreaseArgumentsCount(): self
    {
        --$this->argumentsCount;

        return $this;
    }

    // ******************* Lifecycle *********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteOpinion()
    {
        if (null !== $this->step) {
            $this->step->removeOpinion($this);
        }
        if (null !== $this->OpinionType) {
            $this->OpinionType->removeOpinion($this);
        }
    }

    public function getConnections($filter = 'last')
    {
        $connections = array_merge(
            $this->childConnections->toArray(),
            $this->parentConnections->toArray()
        );

        if ('old' === $filter) {
            usort($connections, function ($a, $b) {
                return $a->getCreatedAt() > $b->getCreatedAt() ? 1 : -1;
            });
        } elseif ('last' === $filter) {
            usort($connections, function ($a, $b) {
                return $a->getCreatedAt() < $b->getCreatedAt() ? 1 : -1;
            });
        }

        return $connections;
    }
}

<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Interfaces\SelfLinkableInterface;
use Capco\AppBundle\Traits\AnswerableTrait;
use Capco\AppBundle\Traits\ExpirableTrait;
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
     * @var \DateTime
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    /**
     * @var \DateTime
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

    /**
     * Get position.
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param int $position
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt.
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return mixed
     */
    public function getVersionsCount()
    {
        return $this->versionsCount;
    }

    /**
     * @param mixed $versionsCount
     */
    public function setVersionsCount($versionsCount)
    {
        $this->versionsCount = $versionsCount;
    }

    /**
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
    }

    /**
     * @param int $sourcesCount
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;

        return $this;
    }

    public function incrementSourcesCount()
    {
        ++$this->sourcesCount;

        return $this;
    }

    public function decrementSourcesCount()
    {
        --$this->sourcesCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getArgumentsCount()
    {
        return $this->argumentsCount;
    }

    /**
     * @param int $argumentsCount
     */
    public function setArgumentsCount($argumentsCount)
    {
        $this->argumentsCount = $argumentsCount;

        return $this;
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param string $Author
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getOpinionType()
    {
        return $this->OpinionType;
    }

    /**
     * @param mixed $OpinionType
     */
    public function setOpinionType(OpinionType $OpinionType)
    {
        $this->OpinionType = $OpinionType;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * @param mixed $step
     */
    public function setStep($step)
    {
        $this->step = $step;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSources()
    {
        return $this->Sources;
    }

    public function setSources($sources)
    {
        $this->sources = $sources;

        return $this;
    }

    public function addSource($source): self
    {
        if (!$this->Sources->contains($source)) {
            $this->Sources->add($source);
        }

        return $this;
    }

    /**
     * @param $source
     *
     * @return $this
     */
    public function removeSource($source)
    {
        $this->Sources->removeElement($source);

        return $this;
    }

    /**
     * Get arguments.
     *
     * @return ArrayCollection
     */
    public function getArguments()
    {
        return $this->arguments;
    }

    public function setArguments($arguments)
    {
        $this->arguments = $arguments;

        return $this;
    }

    /**
     * @param $argument
     *
     * @return $this
     */
    public function addArgument(Argument $argument)
    {
        if (!$this->arguments->contains($argument)) {
            $this->arguments->add($argument);
        }

        return $this;
    }

    /**
     * @param Argument $argument
     *
     * @return $this
     */
    public function removeArgument(Argument $argument)
    {
        $this->arguments->removeElement($argument);

        return $this;
    }

    public function getModals()
    {
        return $this->modals;
    }

    public function addModal(OpinionModal $modal)
    {
        if (!$this->modals->contains($modal)) {
            $this->modals->add($modal);
        }

        return $this;
    }

    public function removeModal(OpinionModal $modal)
    {
        $this->modals->removeElement($modal);

        return $this;
    }

    /**
     * @return string
     */
    public function getReports()
    {
        return $this->Reports;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    public function getVersions()
    {
        return $this->versions;
    }

    public function addVersion(OpinionVersion $version)
    {
        if (!$this->versions->contains($version)) {
            $this->versions->add($version);
        }

        return $this;
    }

    public function removeVersion(OpinionVersion $version)
    {
        $this->versions->removeElement($version);

        return $this;
    }

    public function getAppendices()
    {
        return $this->appendices;
    }

    public function setAppendices(ArrayCollection $appendices)
    {
        $this->appendices = $appendices;

        return $this;
    }

    public function addAppendice(OpinionAppendix $appendix)
    {
        if (!$this->appendices->contains($appendix)) {
            $appendix->setOpinion($this);
            $this->appendices->add($appendix);
        }

        return $this;
    }

    public function removeAppendice(OpinionAppendix $appendix)
    {
        $this->appendices->removeElement($appendix);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRanking()
    {
        return $this->ranking;
    }

    /**
     * @param mixed $ranking
     */
    public function setRanking($ranking)
    {
        $this->ranking = $ranking;

        return $this;
    }

    // ******************************* Custom methods **************************************

    public function userHasReport(User $user)
    {
        foreach ($this->Reports as $report) {
            if ($report->getReporter() === $user) {
                return true;
            }
        }

        return false;
    }

    public function getArgumentForCount()
    {
        $i = 0;
        foreach ($this->arguments as $argument) {
            if ($argument->getType() === Argument::TYPE_FOR) {
                ++$i;
            }
        }

        return $i;
    }

    public function getArgumentAgainstCount()
    {
        $i = 0;
        foreach ($this->arguments as $argument) {
            if ($argument->getType() === Argument::TYPE_AGAINST) {
                ++$i;
            }
        }

        return $i;
    }

    /**
     * @param $type
     *
     * @return int
     */
    public function getArgumentsCountByType($type)
    {
        $count = 0;
        foreach ($this->arguments as $arg) {
            if (Argument::$argumentTypes[$arg->getType()] === $type) {
                ++$count;
            }
        }

        return $count;
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled && $this->step && $this->step->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContribute(): bool
    {
        return $this->isEnabled && !$this->isTrashed && $this->step->canContribute();
    }

    /**
     * @return bool
     */
    public function isPublished()
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

    public function canAddVersions()
    {
        if ($this->getOpinionType()) {
            return $this->getOpinionType()->isVersionable();
        }

        return false;
    }

    public function canAddSources()
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

    public function canAddComments()
    {
        $cs = $this->getCommentSystem();

        return $cs === 1 || $cs === 2;
    }

    public function increaseArgumentsCount()
    {
        ++$this->argumentsCount;

        return $this;
    }

    public function decreaseArgumentsCount()
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
        if ($this->step !== null) {
            $this->step->removeOpinion($this);
        }
        if ($this->OpinionType !== null) {
            $this->OpinionType->removeOpinion($this);
        }
    }

    public function getConnections($filter = 'last')
    {
        $connections = array_merge(
            $this->childConnections->toArray(),
            $this->parentConnections->toArray()
        );

        if ($filter === 'old') {
            usort($connections, function ($a, $b) {
                return $a->getCreatedAt() > $b->getCreatedAt() ? 1 : -1;
            });
        } elseif ($filter === 'last') {
            usort($connections, function ($a, $b) {
                return $a->getCreatedAt() < $b->getCreatedAt() ? 1 : -1;
            });
        }

        return $connections;
    }
}

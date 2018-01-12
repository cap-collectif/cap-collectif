<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * AbstractStep.
 *
 * @ORM\Table(name="step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractStepRepository")
 * @CapcoAssert\EndAfterStart()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "step_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "consultation"  = "ConsultationStep",
 *      "presentation"  = "PresentationStep",
 *      "other"         = "OtherStep",
 *      "collect"       = "CollectStep",
 *      "synthesis"     = "SynthesisStep",
 *      "ranking"       = "RankingStep",
 *      "selection"     = "SelectionStep",
 *      "questionnaire" = "QuestionnaireStep",
 * })
 */
abstract class AbstractStep
{
    use DateHelperTrait, UuidTrait, TextableTrait, MetaDescriptionCustomCodeTrait;

    /**
     * @var array
     */
    public static $stepStatus = [
        'closed' => 'step.status.closed',
        'open' => 'step.status.open',
        'future' => 'step.status.future',
    ];

    /**
     * @var array
     */
    public static $stepTypeLabels = [
        'presentation' => 'step.types.presentation',
        'consultation' => 'step.types.consultation',
        'other' => 'step.types.other',
        'synthesis' => 'step.types.synthesis',
        'ranking' => 'step.types.ranking',
        'selection' => 'step.types.selection',
        'questionnaire' => 'step.types.questionnaire',
        'realisation' => 'step.types.realisation',
    ];

    /**
     * Needed by sonata admin.
     *
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\ProjectAbstractStep", mappedBy="step", orphanRemoval=true, cascade={"persist", "remove"})
     */
    protected $projectAbstractStep;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body = null;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false)
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="start_at", type="datetime", nullable=true)
     */
    private $startAt = null;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt = null;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "startAt", "endAt", "position", "type", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * Used only by CollectStep and SelectionStep but needs to be here for sonata admin :(.
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Status", mappedBy="step", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $statuses;

    /**
     * @var string
     *
     * @ORM\Column(name="label", type="string", length=255, nullable=false)
     * @Assert\NotBlank(message="admin.step.menu_label.error")
     */
    private $label = '';

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->statuses = new ArrayCollection();
        $this->label = '';
    }

    public function __toString()
    {
        if ($this->getId()) {
            if ($this->getProject()) {
                return $this->getProject()->getTitle() . ' - ' . $this->getTitle();
            }

            return $this->getTitle();
        }

        return 'New step';
    }

    abstract public function getType();

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return AbstractStep
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get slug.
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set slug.
     *
     * @param string $slug
     *
     * @return AbstractStep
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

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

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return AbstractStep
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get startAt.
     *
     * @return \DateTime
     */
    public function getStartAt()
    {
        return $this->startAt;
    }

    /**
     * Set startAt.
     *
     * @param \DateTime $startAt
     */
    public function setStartAt($startAt)
    {
        $this->startAt = $startAt;
    }

    /**
     * Get endAt.
     *
     * @return \DateTime
     */
    public function getEndAt()
    {
        return $this->endAt;
    }

    /**
     * Set endAt.
     *
     * @param \DateTime $endAt
     */
    public function setEndAt($endAt)
    {
        $this->endAt = $endAt;
    }

    /**
     * @return ProjectAbstractStep|null
     */
    public function getProjectAbstractStep()
    {
        return $this->projectAbstractStep;
    }

    /**
     * @param mixed $projectAbstractStep
     */
    public function setProjectAbstractStep($projectAbstractStep)
    {
        $this->projectAbstractStep = $projectAbstractStep;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return ArrayCollection
     */
    public function getStatuses()
    {
        return $this->statuses;
    }

    public function addStatus(Status $status)
    {
        if (!$this->statuses->contains($status)) {
            $this->statuses->add($status);
            $status->setStep($this);
        }

        return $this;
    }

    public function removeStatus(Status $status)
    {
        $this->statuses->removeElement($status);

        return $this;
    }

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->label;
    }

    /**
     * @param string $label
     */
    public function setLabel(string $label)
    {
        $this->label = $label;
    }

    // ************************* Custom methods *********************

    /**
     * @return Project
     */
    public function getProject()
    {
        if ($this->projectAbstractStep) {
            return $this->projectAbstractStep->getProject();
        }
    }

    public function getProjectId()
    {
        $project = $this->getProject();

        return $project ? $project->getId() : null;
    }

    public function getPosition()
    {
        if ($this->projectAbstractStep) {
            return $this->projectAbstractStep->getPosition();
        }
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled && $this->getProject()->canDisplay();
    }

    public function canContribute(): bool
    {
        return $this->isActive() && $this->isOpen();
    }

    public function isActive(): bool
    {
        return $this->getProject() && $this->getProject()->canContribute() && $this->getIsEnabled();
    }

    public function isConsultationStep(): bool
    {
        return false;
    }

    public function isPresentationStep(): bool
    {
        return false;
    }

    public function isOtherStep(): bool
    {
        return false;
    }

    public function isSynthesisStep(): bool
    {
        return false;
    }

    public function isRankingStep(): bool
    {
        return false;
    }

    public function isCollectStep(): bool
    {
        return false;
    }

    public function isQuestionnaireStep(): bool
    {
        return false;
    }

    public function isSelectionStep(): bool
    {
        return false;
    }

    public function getRemainingTime()
    {
        $now = new \DateTime();
        if ($this->isOpen()) {
            if ($this->endAt) {
                $time = $this->endAt->diff($now);
            } else {
                $time = $this->startAt ? $this->startAt->diff($now) : null;
            }

            if ($time) {
                return [
                    'days' => (int) $time->format('%a'),
                    'hours' => (int) $time->format('%h'),
                ];
            }
        }
    }

    public function lastOneDay()
    {
        if ($this->endAt && $this->startAt) {
            return $this->isSameDate($this->startAt, $this->endAt);
        }

        return false;
    }

    public function isOpen()
    {
        $now = new \DateTime();

        if (null !== $this->startAt && null !== $this->endAt) {
            return $this->startAt < $now && $this->endAt > $now;
        }

        if ($this->isTimeless()) {
            return true;
        }

        return false;
    }

    public function isClosed()
    {
        $now = new \DateTime();

        if (null === $this->startAt && null === $this->endAt) {
            return !$this->isTimeless();
        }

        if (null === $this->endAt) {
            return null !== $this->startAt && $this->startAt < $now;
        }

        if ($this->endAt < $now) {
            return null === $this->startAt || $this->startAt < $now;
        }

        return false;
    }

    public function isFuture()
    {
        $now = new \DateTime();

        if (null === $this->startAt) {
            return null !== $this->endAt && $this->endAt > $now;
        }
        if ($this->startAt > $now) {
            return null === $this->endAt || $this->endAt > $now;
        }

        return false;
    }

    public function isTimeless()
    {
        if (!property_exists($this, 'timeless')) {
            return false;
        }

        return $this->timeless;
    }

    public function isParticipative()
    {
        return false;
    }
}

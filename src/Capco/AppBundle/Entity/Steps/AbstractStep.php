<?php
namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\RequirementTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
abstract class AbstractStep implements DisplayableInBOInterface
{
    use DateHelperTrait, UuidTrait, TextableTrait, MetaDescriptionCustomCodeTrait, RequirementTrait;

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
    private $body;

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
    private $startAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt;

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
    }

    public function __toString(): string
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(?\DateTime $startAt): self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(?\DateTime $endAt): self
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function getProjectAbstractStep(): ?ProjectAbstractStep
    {
        return $this->projectAbstractStep;
    }

    public function setProjectAbstractStep(?ProjectAbstractStep $projectAbstractStep): self
    {
        $this->projectAbstractStep = $projectAbstractStep;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function getStatuses()
    {
        return $this->statuses;
    }

    public function addStatus(Status $status): self
    {
        if (!$this->statuses->contains($status)) {
            $this->statuses->add($status);
            $status->setStep($this);
        }

        return $this;
    }

    public function removeStatus(Status $status): self
    {
        $this->statuses->removeElement($status);

        return $this;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): self
    {
        $this->label = $label;

        return $this;
    }

    // ************************* Custom methods *********************

    public function getProject(): ?Project
    {
        if ($this->projectAbstractStep) {
            return $this->projectAbstractStep->getProject();
        }

        return null;
    }

    public function getProjectId(): ?string
    {
        /** @var Project $project */
        $project = $this->getProject();

        return $project ? $project->getId() : null;
    }

    public function getPosition(): ?int
    {
        if ($this->projectAbstractStep) {
            return $this->projectAbstractStep->getPosition();
        }
    }

    public function canDisplay($user = null): bool
    {
        return $this->isEnabled && $this->getProject() && $this->getProject()->canDisplay($user);
    }

    public function canDisplayInBO($user = null): bool
    {
        return $this->getProject() ? $this->getProject()->canDisplay($user) : true;
    }

    public function canContribute($user = null): bool
    {
        return $this->isActive($user) && $this->isOpen();
    }

    public function isActive($user = null): bool
    {
        return (
            $this->getProject() &&
            $this->getProject()->canContribute($user) &&
            $this->getIsEnabled()
        );
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
                return ['days' => (int) $time->format('%a'), 'hours' => (int) $time->format('%h')];
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

    public function isOpen(): bool
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

    public function isClosed(): ?bool
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

    public function isFuture(): ?bool
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

    public function isTimeless(): ?bool
    {
        if (!property_exists($this, 'timeless')) {
            return false;
        }

        return $this->timeless;
    }

    public function isParticipative(): bool
    {
        return false;
    }

    public function setStatuses(Collection $value): self
    {
        foreach ($value as $item) {
            $this->addStatus($item);
        }

        return $this;
    }
}

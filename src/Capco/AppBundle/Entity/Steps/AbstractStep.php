<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Capco\AppBundle\Entity\Interfaces\VotableStepInterface;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Enum\ViewConfiguration;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\MetaDescriptionCustomCodeTrait;
use Capco\AppBundle\Traits\RequirementTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimeRangeableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
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
 *      "ranking"       = "RankingStep",
 *      "selection"     = "SelectionStep",
 *      "questionnaire" = "QuestionnaireStep",
 *      "debate" = "DebateStep",
 * })
 */
abstract class AbstractStep implements DisplayableInBOInterface, TimeRangeable
{
    use BodyUsingJoditWysiwygTrait;
    use DateHelperTrait;
    use MetaDescriptionCustomCodeTrait;
    use RequirementTrait;
    use TextableTrait;
    use TimeRangeableTrait;
    use TimestampableTrait;
    use UuidTrait;

    public const STATE_FUTURE = 'FUTURE';
    public const STATE_OPENED = 'OPENED';
    public const STATE_CLOSED = 'CLOSED';

    /**
     * @var array
     */
    public static $stepStates = [
        'closed' => self::STATE_CLOSED,
        'open' => self::STATE_OPENED,
        'future' => self::STATE_FUTURE,
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
     * @ORM\Column(name="main_view", type="string", options={"default": "GRID"}, nullable=true)
     * @Assert\Choice(choices={"GRID", "MAP", "LIST"})
     */
    protected string $mainView = ViewConfiguration::GRID;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     * @Assert\NotNull()
     */
    private $title;

    /**
     * This slug must be unique by project.
     * We could use a validator or custom generator here.
     *
     * It's not updatable to avoid 404s.
     *
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=false)
     * @ORM\Column(length=255, nullable=false, unique=false)
     */
    private $slug;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
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
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Event", mappedBy="steps", cascade={"persist"})
     */
    private $events;

    /**
     * @ORM\OneToMany(targetEntity=ProposalStepPaperVoteCounter::class, mappedBy="step", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private Collection $proposalStepPaperVoteCounters;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->statuses = new ArrayCollection();
        $this->requirements = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->proposalStepPaperVoteCounters = new ArrayCollection();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->slug = 'copy-of-' . $this->getSlug();
            $this->createdAt = new \DateTime('now');
            $this->statuses = new ArrayCollection();
        }
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

    public function getEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

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
        return $this->getProjectAbstractStep()
            ? $this->getProjectAbstractStep()->getPosition()
            : null;
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     *
     * @param null|mixed $user
     */
    public function canDisplay($user = null): bool
    {
        return $this->getProject() && $this->getProject()->canDisplay($user);
    }

    public function viewerCanSeeInBo($user = null): bool
    {
        return $this->getProject() ? $this->getProject()->canDisplay($user) : true;
    }

    public function canContribute($user = null): bool
    {
        return $this->isActive($user) && $this->isOpen();
    }

    public function isActive($user = null): bool
    {
        return $this->getProject()
            && $this->getProject()->canContribute($user)
            && $this->getIsEnabled();
    }

    public function isDebateStep(): bool
    {
        return false;
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

    public function haveAtLeastOneEvent(): bool
    {
        return $this->events->count() > 0;
    }

    public function getEvents(): Collection
    {
        return $this->events;
    }

    public function addEvent(Event $event): self
    {
        if (!$this->events->contains($event)) {
            $this->events->add($event);
        }

        return $this;
    }

    public function removeEvent(Event $event): self
    {
        $this->events->removeElement($event);

        return $this;
    }

    public function getMainView(): string
    {
        return $this->mainView;
    }

    public function setMainView(string $mainView): self
    {
        $this->mainView = $mainView;

        return $this;
    }

    //used in twig to add googlemaps js file
    public function useAddressOrMap(): bool
    {
        return false;
    }

    public function canResolverDisplayBallot($viewer): bool
    {
        if ($this instanceof VotableStepInterface && $this->canDisplayBallot()) {
            return true;
        }

        if (!$viewer instanceof User) {
            return false;
        }

        if ($viewer->isAdmin() || $this->getOwner() === $viewer) {
            return true;
        }

        $project = $this->getProject();
        if ($project->getOwner() instanceof Organization && $viewer->isMemberOfOrganization($project->getOwner())) {
            return true;
        }

        return false;
    }

    public function getOwner(): ?Owner
    {
        return $this->getProject() ? $this->getProject()->getOwner() : null;
    }
}

<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\DBAL\Enum\ProposalRevisionStateType;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Capco\AppBundle\Entity\Interfaces\SelfLinkableInterface;
use Capco\AppBundle\Entity\Interfaces\SoftDeleteable;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Model\ReportableInterface;
use Capco\AppBundle\Traits\AddressableTrait;
use Capco\AppBundle\Traits\CommentableWithoutCounterTrait;
use Capco\AppBundle\Traits\DraftableTrait;
use Capco\AppBundle\Traits\FollowableTrait;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\NullableTextableTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\ReferenceTrait;
use Capco\AppBundle\Traits\SelfLinkableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\SoftDeleteTrait;
use Capco\AppBundle\Traits\SummarizableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="proposal", uniqueConstraints={
 *    @ORM\UniqueConstraint(columns={ "proposal_form_id", "reference"}),
 * }, indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"}),
 *     @ORM\Index(name="idx_slug", columns={"id", "slug", "deleted_at"}),
 *     @ORM\Index(name="idx_proposalform_published", columns={"id", "is_draft", "trashed_at", "published", "proposal_form_id", "deleted_at"}),
 *     @ORM\Index(name="idx_proposal_published", columns={"id", "published", "deleted_at", "is_draft", "trashed_at"}),
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="proposal.missing_required_responses", formField="proposalForm")
 * @CapcoAssert\HasDistrictIfMandatory()
 * @CapcoAssert\HasThemeIfMandatory()
 * @CapcoAssert\HasCategoryIfMandatory()
 * @CapcoAssert\HasAddressIfMandatory()
 */
class Proposal implements
    Publishable,
    Contribution,
    CommentableInterface,
    SelfLinkableInterface,
    SoftDeleteable,
    DisplayableInBOInterface,
    DraftableInterface,
    ReportableInterface
{
    use AddressableTrait;
    use CommentableWithoutCounterTrait;
    use DraftableTrait;
    use FollowableTrait;
    use HasResponsesTrait;
    use ModerableTrait;
    use NullableTextableTrait;
    use PublishableTrait;
    use ReferenceTrait;
    use SelfLinkableTrait;
    use SluggableTitleTrait;
    use SoftDeleteTrait;
    use SummarizableTrait;
    use TimestampableTrait;
    use TrashableTrait;
    use UuidTrait;

    public static $ratings = [1, 2, 3, 4, 5];

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255, nullable=false, unique=true)
     */
    protected $slug;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="proposals")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    protected $author;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="update_author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $updateAuthor;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="proposals")
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    protected ProposalForm $proposalForm;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="proposal", cascade={"persist"}, orphanRemoval=true)
     */
    protected $reports;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\UserBundle\Entity\User", cascade={"persist"})
     * @ORM\JoinTable(name="user_favorite_proposal")
     */
    protected $likers;

    /**
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Group", inversedBy="evaluating", cascade={"persist"})
     * @ORM\JoinTable(name="user_evaluatin_proposal")
     */
    protected $evaluers;

    /**
     * @ORM\Column(name="rating", type="integer", nullable=true)
     */
    private $rating;

    /**
     * @ORM\Column(name="annotation", type="text", nullable=true)
     */
    private $annotation;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="proposals", cascade={"persist"})
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $theme;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District\ProposalDistrict", inversedBy="proposals", cascade={"persist"})
     * @ORM\JoinColumn(name="district_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $district;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"}, inversedBy="proposals")
     * @ORM\JoinColumn(name="status_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $status;

    /**
     * @ORM\Column(name="tipsmeee_id", type="string", nullable=true)
     */
    private $tipsmeeeId;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalCategory", cascade={"persist"}, inversedBy="proposals")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $category;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalComment", mappedBy="proposal", cascade={"persist"})
     */
    private $comments;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse",
     *  mappedBy="proposal",
     *  cascade={"persist"}
     * )
     */
    private $responses;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Selection", mappedBy="proposal", cascade={"persist"}, orphanRemoval=true)
     */
    private $selections;

    /**
     * @ORM\Column(name="estimation", type="float", nullable=true)
     */
    private $estimation;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProgressStep", mappedBy="proposal", cascade={"persist","remove"},  orphanRemoval=true)
     */
    private $progressSteps;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     * @Assert\Valid()
     */
    private $media;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalSelectionVote", mappedBy="proposal", cascade={"persist"})
     */
    private $selectionVotes;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalCollectVote", mappedBy="proposal", cascade={"persist"})
     */
    private $collectVotes;

    /** TODO: To remove for a real dynamic evaluation */

    /**
     * @ORM\Column(name="service_pilote", type="text", nullable=true)
     */
    private $servicePilote;

    /**
     * @ORM\Column(name="domaniality", type="text", nullable=true)
     */
    private $domaniality;

    /**
     * @ORM\Column(name="compatibility", type="text", nullable=true)
     */
    private $compatibility;

    /**
     * @ORM\Column(name="environmental_impact", type="text", nullable=true)
     */
    private $environmentalImpact;

    /**
     * @ORM\Column(name="dimension", type="text", nullable=true)
     */
    private $dimension;

    /**
     * @ORM\Column(name="functioning_impact", type="text", nullable=true)
     */
    private $functioningImpact;

    /**
     * @ORM\Column(name="evaluation", type="text", nullable=true)
     */
    private $evaluation;

    /**
     * @ORM\Column(name="delay", type="text", nullable=true)
     */
    private $delay;

    /**
     * @ORM\Column(name="proposed_answer", type="text", nullable=true)
     */
    private $proposedAnswer;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalEvaluation", mappedBy="proposal", cascade={"persist"})
     */
    private $proposalEvaluation;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Follower", mappedBy="proposal", cascade={"persist"})
     */
    private $followers;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalAssessment", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?ProposalAssessment $assessment;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalSupervisor", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?ProposalSupervisor $supervisor;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalDecision", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?ProposalDecision $decision;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalDecisionMaker", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?ProposalDecisionMaker $decisionMaker;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalAnalyst", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private Collection $proposalAnalysts;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalAnalysis", mappedBy="proposal", orphanRemoval=true)
     */
    private iterable $analyses;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalRevision", mappedBy="proposal", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private Collection $revisions;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\OfficialResponse", mappedBy="proposal", cascade={"persist", "remove"})
     */
    private $officialResponse;

    public function __construct()
    {
        $this->selectionVotes = new ArrayCollection();
        $this->collectVotes = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->updatedAt = null;
        $this->selections = new ArrayCollection();
        $this->likers = new ArrayCollection();
        $this->evaluers = new ArrayCollection();
        $this->followers = new ArrayCollection();
        $this->progressSteps = new ArrayCollection();
        $this->childConnections = new ArrayCollection();
        $this->parentConnections = new ArrayCollection();
        $this->proposalAnalysts = new ArrayCollection();
        $this->analyses = new ArrayCollection();
        $this->revisions = new ArrayCollection();
        $this->assessment = null;
        $this->decision = null;
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New proposal';
    }

    public function getKind(): string
    {
        return 'proposal';
    }

    public function getRelated()
    {
        return null;
    }

    public function hasBeenMerged(): bool
    {
        return \count($this->getParentConnections()) > 0;
    }

    public function getSupervisor(): ?User
    {
        return $this->supervisor ? $this->supervisor->getSupervisor() : null;
    }

    public function setSupervisor(?ProposalSupervisor $proposalSupervisor): self
    {
        $this->supervisor = $proposalSupervisor;

        return $this;
    }

    public function changeSupervisor(User $supervisor, User $viewer): self
    {
        $this->supervisor->setSupervisor($supervisor)->setAssignedBy($viewer);

        return $this;
    }

    public function removeSupervisor(): self
    {
        $this->supervisor = null;

        return $this;
    }

    public function getAssessment(): ?ProposalAssessment
    {
        return $this->assessment;
    }

    public function removeAssessment(): self
    {
        $this->assessment = null;

        return $this;
    }

    public function removeDecision(): self
    {
        $this->decision = null;

        return $this;
    }

    public function removeAnalysis(User $analyst): self
    {
        /** @var ProposalAnalysis $analysis */
        foreach ($this->analyses as $analysis) {
            if ($analysis->getUpdatedBy() === $analyst) {
                $this->analyses->removeElement($analysis);
            }
        }

        return $this;
    }

    public function getDecision(): ?ProposalDecision
    {
        return $this->decision;
    }

    public function setAssessment(?ProposalAssessment $assessment): self
    {
        $this->assessment = $assessment;

        return $this;
    }

    public function setDecision(?ProposalDecision $decision): self
    {
        $this->decision = $decision;

        return $this;
    }

    public function getDecisionMaker(): ?User
    {
        return $this->decisionMaker ? $this->decisionMaker->getDecisionMaker() : null;
    }

    public function removeDecisionMaker(): self
    {
        $this->decisionMaker = null;

        return $this;
    }

    /**
     * @return Collection|User[]
     */
    public function getAnalysts(): Collection
    {
        // TODO, wtf with this getter ? It just to get user list of analysts
        $analysts = new ArrayCollection();
        if (!empty($this->proposalAnalysts)) {
            /** @var ProposalAnalyst $proposalAnalyst */
            foreach ($this->proposalAnalysts as $proposalAnalyst) {
                $analysts->add($proposalAnalyst->getAnalyst());
            }
        }

        return $analysts;
    }

    public function getAnalystsArray(): array
    {
        return $this->getAnalysts()->toArray();
    }

    public function removeAnalyst(User $analyst): self
    {
        if (!empty($this->proposalAnalysts)) {
            /** @var ProposalAnalyst $proposalAnalyst */
            foreach ($this->proposalAnalysts as $proposalAnalyst) {
                if ($analyst === $proposalAnalyst->getAnalyst()) {
                    $this->getProposalAnalysts()->removeElement($proposalAnalyst);
                }
            }
        }

        return $this;
    }

    public function getProposalAnalysts(): Collection
    {
        return $this->proposalAnalysts;
    }

    public function getProposalAnalystsArray(): array
    {
        return $this->proposalAnalysts ? $this->proposalAnalysts->toArray() : [];
    }

    public function addAnalysts(array $analysts): self
    {
        foreach ($analysts as $analyst) {
            $this->addAnalyst($analyst);
        }

        return $this;
    }

    public function addAnalyst(User $analyst): self
    {
        if (!$this->getAnalysts()->contains($analyst)) {
            $this->addProposalAnalyst(new ProposalAnalyst($this, $analyst));
        }

        return $this;
    }

    public function addProposalAnalyst(ProposalAnalyst $proposalAnalyst): self
    {
        if (!$this->proposalAnalysts->contains($proposalAnalyst)) {
            $proposalAnalyst->setProposal($this);
            $this->proposalAnalysts[] = $proposalAnalyst;
        }

        return $this;
    }

    public function removeProposalAnalyst(ProposalAnalyst $proposalAnalyst): self
    {
        if ($this->proposalAnalysts->contains($proposalAnalyst)) {
            $this->proposalAnalysts->removeElement($proposalAnalyst);
        }

        return $this;
    }

    public function clearProposalAnalysts(): self
    {
        $this->proposalAnalysts->clear();

        return $this;
    }

    public function clearProposalAnalyses(): self
    {
        $this->analyses->clear();

        return $this;
    }

    public function getAnalyses(): iterable
    {
        return $this->analyses;
    }

    public function getAnalysesArray(): array
    {
        return $this->analyses ? $this->analyses->toArray() : [];
    }

    public function addAnalysis(ProposalAnalysis $proposalAnalysis): self
    {
        if (!$this->analyses->contains($proposalAnalysis)) {
            $this->analyses[] = $proposalAnalysis;
            $proposalAnalysis->setProposal($this);
        }

        return $this;
    }

    public function setAnalyses(iterable $analyses): self
    {
        $this->analyses = $analyses;

        return $this;
    }

    public function removeProposalAnalysis(ProposalAnalysis $proposalAnalysis): self
    {
        if ($this->analyses->contains($proposalAnalysis)) {
            $this->analyses->removeElement($proposalAnalysis);
        }

        return $this;
    }

    public function setProposalDecisionMaker(
        ?ProposalDecisionMaker $proposalDecisionMaker = null
    ): self {
        $this->decisionMaker = $proposalDecisionMaker;

        return $this;
    }

    public function getProposalDecisionMaker(): ?ProposalDecisionMaker
    {
        return $this->decisionMaker;
    }

    public function changeDecisionMaker(User $decisionMaker): self
    {
        if ($this->decisionMaker) {
            $this->decisionMaker->setDecisionMaker($decisionMaker);
        }

        return $this;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(?int $rating = null): self
    {
        $this->rating = $rating;

        return $this;
    }

    public function getAnnotation(): ?string
    {
        return $this->annotation;
    }

    public function setAnnotation(?string $annotation = null): self
    {
        $this->annotation = $annotation;

        return $this;
    }

    public function getStatus(): ?Status
    {
        return $this->status;
    }

    public function setStatus(?Status $status = null): self
    {
        $this->status = $status;

        return $this;
    }

    public function getCategory(): ?ProposalCategory
    {
        return $this->category;
    }

    public function setCategory(?ProposalCategory $category = null): self
    {
        $this->category = $category;

        return $this;
    }

    public function getTheme(): ?Theme
    {
        return $this->theme;
    }

    public function setTheme(?Theme $theme = null): self
    {
        $this->theme = $theme;
        if ($theme) {
            $theme->addProposal($this);
        }

        return $this;
    }

    public function getDistrict()
    {
        return $this->district;
    }

    public function setDistrict(?ProposalDistrict $district = null, bool $add = true): self
    {
        $this->district = $district;
        if ($district && $add) {
            $district->addProposal($this);
        }

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getUpdateAuthor(): ?User
    {
        return $this->updateAuthor;
    }

    public function setUpdateAuthor(?User $updateAuthor = null): self
    {
        $this->updateAuthor = $updateAuthor;

        return $this;
    }

    public function getForm(): ProposalForm
    {
        return $this->proposalForm;
    }

    public function getProposalForm(): ProposalForm
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm): self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function getStep(): ?CollectStep
    {
        return $this->proposalForm ? $this->proposalForm->getStep() : null;
    }

    public function getResponsesQuestions(): Collection
    {
        return $this->proposalForm->getRealQuestions();
    }

    public function setResponseOn(AbstractResponse $response): self
    {
        $response->setProposal($this);

        return $this;
    }

    public function getReports(): iterable
    {
        return $this->reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->reports->removeElement($report);

        return $this;
    }

    public function addSelection(Selection $selection): self
    {
        if (!$this->selections->contains($selection)) {
            $this->selections[] = $selection;
            $selection->setProposal($this);
        }

        return $this;
    }

    public function removeSelection(Selection $selection): self
    {
        $this->selections->removeElement($selection);

        return $this;
    }

    public function getSelections(): Collection
    {
        return $this->selections;
    }

    public function getSelectionsArray(): iterable
    {
        return $this->selections->toArray();
    }

    public function getClassName(): string
    {
        return 'Proposal';
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay($user = null): bool
    {
        if ($this->isPublished()) {
            return $this->getStep() ? $this->getStep()->canDisplay($user) : false;
        }

        return $this->getAuthor() === $user;
    }

    /** @var User */
    public function viewerCanSeeInBo($user = null): bool
    {
        return $user && $user->isAdmin();
    }

    public function viewerCanSee(?User $viewer = null): bool
    {
        // Admin and SuperAdmin can access everything
        if ($viewer && $viewer->isAdmin()) {
            return true;
        }
        if ($this->isPrivate() && !$viewer && empty($this->getSelectionSteps())) {
            return false;
        }

        if ($this->isPrivate() && $viewer && empty($this->getSelectionSteps())) {
            if (\in_array($viewer, $this->getAnalystsArray())) {
                return true;
            }
            if (
                $this->getDecisionMaker() &&
                $viewer->getId() === $this->getDecisionMaker()->getId()
            ) {
                return true;
            }
            if ($this->getSupervisor() && $viewer->getId() === $this->getSupervisor()->getId()) {
                return true;
            }

            if ($this->getAuthor() !== $viewer) {
                return false;
            }
        }

        if ($this->isPublished()) {
            if (!$this->isDeleted()) {
                return $this->getStep() ? $this->getStep()->canDisplay($viewer) : false;
            }

            return false;
        }

        return $this->getAuthor() === $viewer;
    }

    public function isPrivate(): bool
    {
        return $this->getProposalForm() && $this->getProposalForm()->getStep()
            ? $this->getProposalForm()
                ->getStep()
                ->isPrivate()
            : false;
    }

    public function isSelected(): bool
    {
        return !$this->getSelections()->isEmpty();
    }

    public function isVisible(): bool
    {
        return !$this->isPrivate() || $this->isSelected();
    }

    public function isInRevision(): bool
    {
        $revisions = $this->getRevisions()->filter(
            fn(ProposalRevision $revision) => ProposalRevisionStateType::PENDING ===
                $revision->getState()
        );

        return $revisions->count() > 0;
    }

    public function canContribute($viewer = null): bool
    {
        $canContribute =
            ($this->isPublished() || $this->isDraft()) &&
            !$this->isTrashed() &&
            $this->getStep() &&
            $this->getStep()->canContribute($viewer);

        return $canContribute || ($viewer === $this->getAuthor() && $this->isInRevision());
    }

    public function acceptNewComments(): bool
    {
        return $this->isPublished() &&
            !$this->isTrashed() &&
            $this->proposalForm &&
            $this->proposalForm->isCommentable() &&
            $this->isCommentable();
    }

    public function userHasReport(User $user): bool
    {
        foreach ($this->reports as $report) {
            if ($report->getReporter() === $user) {
                return true;
            }
        }

        return false;
    }

    public function getEstimation(): ?float
    {
        return $this->estimation;
    }

    public function setEstimation(?float $estimation = null): self
    {
        $this->estimation = $estimation;

        return $this;
    }

    public function getLikers(): iterable
    {
        return $this->likers;
    }

    public function addLiker(User $liker): self
    {
        if (!$this->likers->contains($liker)) {
            $this->likers[] = $liker;
        }

        return $this;
    }

    public function removeLiker(User $liker): self
    {
        $this->likers->removeElement($liker);

        return $this;
    }

    public function getSelectionSteps(): array
    {
        $steps = [];
        foreach ($this->selections as $selection) {
            $steps[] = $selection->getSelectionStep();
        }

        return $steps;
    }

    public function getProject(): ?Project
    {
        if (
            $this->getProposalForm() &&
            $this->getProposalForm()->getStep() &&
            $this->getProposalForm()
                ->getStep()
                ->getProject()
        ) {
            return $this->getProposalForm()
                ->getStep()
                ->getProject();
        }

        return null;
    }

    public function getProjectId(): ?string
    {
        if (
            $this->getProposalForm() &&
            $this->getProposalForm()->getStep() &&
            $this->getProposalForm()
                ->getStep()
                ->getProject()
        ) {
            return $this->getProposalForm()
                ->getStep()
                ->getProjectId();
        }

        return null;
    }

    public function getSelectionStepsIds(): array
    {
        return array_filter(
            array_map(function ($value) {
                return $value->getSelectionStep() ? $value->getSelectionStep()->getId() : null;
            }, $this->getSelections()->getValues()),
            function ($value) {
                return null !== $value;
            }
        );
    }

    public function getProgressSteps(): Collection
    {
        return $this->progressSteps;
    }

    public function setProgressSteps(Collection $progressSteps): self
    {
        $this->progressSteps = $progressSteps;

        return $this;
    }

    public function getSelectionVotes(): Collection
    {
        return $this->selectionVotes;
    }

    public function setSelectionVotes(Collection $votes): self
    {
        $this->selectionVotes = $votes;

        return $this;
    }

    public function getCollectVotes(): Collection
    {
        return $this->collectVotes;
    }

    public function setCollectVotes(Collection $collectVotes): self
    {
        $this->collectVotes = $collectVotes;

        return $this;
    }

    public function addSelectionVote(ProposalSelectionVote $selectionVote): self
    {
        if (!$this->selectionVotes->contains($selectionVote)) {
            $this->selectionVotes->add($selectionVote);
        }

        return $this;
    }

    public function removeSelectionVote(ProposalSelectionVote $vote): self
    {
        if ($this->selectionVotes->contains($vote)) {
            $this->selectionVotes->removeElement($vote);
        }

        return $this;
    }

    public function addCollectVote(ProposalCollectVote $vote): self
    {
        if (!$this->collectVotes->contains($vote)) {
            $this->collectVotes->add($vote);
        }

        return $this;
    }

    public function addProgressStep(ProgressStep $progressStep): self
    {
        if (!$this->progressSteps->contains($progressStep)) {
            $this->progressSteps->add($progressStep);
            $progressStep->setProposal($this);
        }

        return $this;
    }

    public function removeCollectVote(ProposalCollectVote $vote): self
    {
        if ($this->collectVotes->contains($vote)) {
            $this->collectVotes->removeElement($vote);
        }

        return $this;
    }

    public function removeProgressStep(ProgressStep $progressStep): self
    {
        if ($this->progressSteps->contains($progressStep)) {
            $this->progressSteps->removeElement($progressStep);
        }

        return $this;
    }

    public function canHaveProgessSteps(): bool
    {
        if (!$this->getProposalForm()) {
            // for sonata
            return false;
        }

        return $this->getProposalForm() &&
            $this->getProposalForm()->getStep() &&
            $this->getProposalForm()
                ->getStep()
                ->getProject() &&
            $this->getProposalForm()
                ->getStep()
                ->getProject()
                ->getSteps()
                ->exists(function ($key, $step) {
                    return $step->getStep()->isSelectionStep() &&
                        $step->getStep()->isAllowingProgressSteps();
                });
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setMedia(?Media $media = null): self
    {
        $this->media = $media;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getServicePilote(): ?string
    {
        return $this->servicePilote;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setServicePilote(?string $servicePilote = null): self
    {
        $this->servicePilote = $servicePilote;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getDomaniality(): ?string
    {
        return $this->domaniality;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setDomaniality(string $domaniality): self
    {
        $this->domaniality = $domaniality;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getCompatibility(): ?string
    {
        return $this->compatibility;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setCompatibility(?string $compatibility = null): self
    {
        $this->compatibility = $compatibility;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getEnvironmentalImpact(): ?string
    {
        return $this->environmentalImpact;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setEnvironmentalImpact(?string $environmentalImpact = null): self
    {
        $this->environmentalImpact = $environmentalImpact;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getDimension(): ?string
    {
        return $this->dimension;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setDimension(?string $dimension = null): self
    {
        $this->dimension = $dimension;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getFunctioningImpact(): ?string
    {
        return $this->functioningImpact;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setFunctioningImpact(?string $functioningImpact = null): self
    {
        $this->functioningImpact = $functioningImpact;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getEvaluation(): ?string
    {
        return $this->evaluation;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setEvaluation(?string $evaluation = null): self
    {
        $this->evaluation = $evaluation;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getDelay(): ?string
    {
        return $this->delay;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setDelay(?string $delay = null): self
    {
        $this->delay = $delay;

        return $this;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function getProposedAnswer(): ?string
    {
        return $this->proposedAnswer;
    }

    /**
     * @deprecated This was added for fabriquecitoyenne.rennes.fr when we didn't had an evaluation tool.
     */
    public function setProposedAnswer(?string $proposedAnswer = null): self
    {
        $this->proposedAnswer = $proposedAnswer;

        return $this;
    }

    public function getFullReference(): string
    {
        return $this->getProposalForm()->getReference() . '-' . $this->getReference();
    }

    /**
     * Useful for sonata admin.
     */
    public function updatedInfo(): array
    {
        return ['date' => $this->getUpdatedAt(), 'user' => $this->getUpdateAuthor()];
    }

    /**
     * Useful for sonata admin.
     */
    public function titleInfo(): array
    {
        return [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            'summary' => $this->getSummary(),
        ];
    }

    /**
     * Useful for sonata admin and proposal notifier status change.
     */
    public function lastStatus()
    {
        /** @var Selection[] $projectSteps */
        $selections = $this->getSelections()->toArray();

        usort($selections, function ($step, $nextStep) {
            return $nextStep->getStep()->getPosition() <=> $step->getStep()->getPosition();
        });

        $findStatus = null;
        $loop = 0;

        while (null === $findStatus && $loop < \count($selections)) {
            /** @var Selection $selection */
            $selection = $selections[$loop];

            if (null !== $selection->getStatus()) {
                $findStatus = $selection->getStatus();
            }

            ++$loop;
        }

        if (null !== $findStatus) {
            return $findStatus;
        }

        return $this->getStatus();
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function getProposalEvaluation(): ?ProposalEvaluation
    {
        return $this->proposalEvaluation;
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function setProposalEvaluation(ProposalEvaluation $proposalEvaluation): self
    {
        $this->proposalEvaluation = $proposalEvaluation;

        return $this;
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function getEvaluers(): Collection
    {
        return $this->evaluers;
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function setEvaluers(Collection $evaluers): self
    {
        $this->evaluers = $evaluers;

        return $this;
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function addEvaluer(Group $group): self
    {
        if (!$this->evaluers->contains($group)) {
            $this->evaluers->add($group);
        }

        return $this;
    }

    /**
     * @deprecated this is our legacy evaluation tool
     */
    public function removeEvaluer(Group $group): self
    {
        $this->evaluers->removeElement($group);

        return $this;
    }

    public function getTipsmeeeId(): ?string
    {
        return $this->tipsmeeeId;
    }

    public function setTipsmeeeId(?string $tipsmeeeId): self
    {
        $this->tipsmeeeId = $tipsmeeeId;

        return $this;
    }

    public function getGlobalProgressStatus(): string
    {
        if ($decision = $this->getDecision()) {
            if (ProposalStatementState::DONE === $decision->getState()) {
                return $decision->isApproved()
                    ? ProposalStatementState::FAVOURABLE
                    : ProposalStatementState::UNFAVOURABLE;
            }

            return $decision->getState();
        }

        if ($assessment = $this->getAssessment()) {
            return ProposalStatementState::IN_PROGRESS;
        }

        if (($analyses = $this->getAnalyses()) && !empty($analyses)) {
            foreach ($analyses as $analysis) {
                if (ProposalStatementState::TODO !== $analysis->getState()) {
                    return ProposalStatementState::IN_PROGRESS;
                }
            }
        }

        return ProposalStatementState::TODO;
    }

    public function isIndexable(): bool
    {
        return !$this->isDeleted() && $this->getStep();
    }

    public static function getElasticsearchPriority(): int
    {
        return 13;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'proposal';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchProposalNestedStep',
            'ElasticsearchProposalNestedAuthor',
            'ElasticsearchProposalNestedProject',
            'ElasticsearchProposalNestedTheme',
            'ElasticsearchProposalNestedDistrict',
            'ElasticsearchProposal',
        ];
    }

    public function getRevisions(): Collection
    {
        return $this->revisions;
    }

    public function getRevisionsArray(): array
    {
        return $this->revisions ? $this->revisions->toArray() : [];
    }

    public function addRevision(ProposalRevision $revision): self
    {
        if (!$this->revisions->contains($revision)) {
            $this->revisions->add($revision);
            $revision->setProposal($this);
        }

        return $this;
    }

    public function removeRevision(ProposalRevision $revision): self
    {
        if ($this->revisions->contains($revision)) {
            $this->revisions->removeElement($revision);
            if ($revision->getProposal() === $this) {
                $revision->setProposal(null);
            }
        }

        return $this;
    }

    public function getOfficialResponse(): ?OfficialResponse
    {
        return $this->officialResponse;
    }

    public function setOfficialResponse(OfficialResponse $officialResponse): self
    {
        $this->officialResponse = $officialResponse;

        // set the owning side of the relation if necessary
        if ($officialResponse->getProposal() !== $this) {
            $officialResponse->setProposal($this);
        }

        return $this;
    }
}

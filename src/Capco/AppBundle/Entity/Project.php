<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\CreatableInterface;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Interfaces\TimeRangeable;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ProjectHeaderType;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Enum\VoteType;
use Capco\AppBundle\Traits\AddressableTrait;
use Capco\AppBundle\Traits\CreatableTrait;
use Capco\AppBundle\Traits\CustomCodeTrait;
use Capco\AppBundle\Traits\DateHelperTrait;
use Capco\AppBundle\Traits\LocalizableTrait;
use Capco\AppBundle\Traits\Media\CoverTrait;
use Capco\AppBundle\Traits\MetaDescriptionTrait;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\ProjectVisibilityTrait;
use Capco\AppBundle\Traits\TimeRangeableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Project.
 *
 * @ORM\Table(name="project")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasUserGroupIdVisibilityGroup()
 */
class Project implements IndexableInterface, TimeRangeable, Ownerable, CreatableInterface, \Stringable
{
    use AddressableTrait;
    use CoverTrait;
    use CreatableTrait;
    use CustomCodeTrait;
    use DateHelperTrait;
    use LocalizableTrait;
    use MetaDescriptionTrait;
    use OwnerableTrait;
    use ProjectVisibilityTrait;
    use TimeRangeableTrait;
    use UuidTrait;

    final public const FILTER_ALL = 'all';

    final public const SORT_ORDER_PUBLISHED_AT = 0;
    final public const SORT_ORDER_CONTRIBUTIONS_COUNT = 1;

    final public const STATE_FUTURE_WITHOUT_FINISHED_STEPS = 0;
    final public const STATE_OPENED = 1;
    final public const STATE_FUTURE_WITH_FINISHED_STEPS = 1;
    final public const STATE_CLOSED = 2;

    final public const DEFAULT_COVER_FILTER_OPACITY = 50;

    public static array $sortOrder = [
        'date' => self::SORT_ORDER_PUBLISHED_AT,
        'popularity' => self::SORT_ORDER_CONTRIBUTIONS_COUNT,
    ];

    public static array $sortOrderLabels = [
        'date' => 'global.updated.date',
        'popularity' => 'project.sort.contributions_nb',
    ];

    public static array $openingStatuses = [
        'future_witout_finished_steps' => self::STATE_FUTURE_WITHOUT_FINISHED_STEPS,
        'future_with_finished_steps' => self::STATE_FUTURE_WITH_FINISHED_STEPS,
        'opened' => self::STATE_OPENED,
        'closed' => self::STATE_CLOSED,
    ];

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=false)
     * @Assert\NotBlank()
     * @Assert\NotNull()
     */
    private $title;

    /**
     * @ORM\Column(name="external_link", type="text", length=255, nullable=true)
     */
    private $externalLink;

    /**
     * It's not updatable to avoid 404s.
     *
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255, nullable=false, unique=true)
     */
    private $slug;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="published_at", type="datetime", nullable=false)
     * @Assert\NotNull()
     * @Assert\DateTime()
     */
    private $publishedAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "authors", "themes", "steps", "media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProjectAuthor", cascade={"persist", "remove"}, mappedBy="project", orphanRemoval=true)
     */
    private $authors;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Theme", inversedBy="projects", cascade={"persist"})
     * @ORM\JoinTable(name="theme_project")
     */
    private $themes;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Steps\ProjectAbstractStep", mappedBy="project",  cascade={"persist", "remove"}, orphanRemoval = true)
     * @ORM\OrderBy({"position" = "ASC"})
     * @CapcoAssert\HasOnlyOneSelectionStepAllowingProgressSteps()
     */
    private $steps;

    /**
     * @ORM\Column(name="proposal_step_split_view_enabled", type="boolean", options={"default": false})
     */
    private bool $isProposalStepSplitViewEnabled = false;

    /**
     * @ORM\Column(name="video", type="string", nullable = true)
     */
    private $video;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Event", mappedBy="projects", cascade={"persist"})
     */
    private $events;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Post", mappedBy="projects", cascade={"persist"})
     */
    private $posts;

    /**
     * @var int
     *
     * @ORM\Column(name="opinions_ranking_threshold", type="integer", nullable=true)
     */
    private $opinionsRankingThreshold;

    /**
     * @var int
     *
     * @ORM\Column(name="versions_ranking_threshold", type="integer", nullable=true)
     */
    private $versionsRankingThreshold;

    /**
     * TODO: no more used, delete me.
     *
     * @ORM\Column(name="include_author_in_ranking", type="boolean", options={"default": false})
     */
    private $includeAuthorInRanking = false;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProjectType", inversedBy="projects")
     * @ORM\JoinColumn(name="project_type_id", referencedColumnName="id", nullable=true)
     */
    private $projectType;

    /**
     * @ORM\Column(name="visibility", type="integer", nullable=false)
     */
    private $visibility = ProjectVisibilityMode::VISIBILITY_ADMIN;

    /**
     * @ORM\Column(name="opinion_can_be_followed", type="boolean", nullable=false, options={"default": false})
     */
    private $opinionCanBeFollowed = false;

    /**
     * @ORM\JoinTable(name="restricted_viewer_groups")
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Group", inversedBy="projectsVisibleByTheGroup", cascade={"persist"})
     */
    private $restrictedViewerGroups;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrictPositioner", mappedBy="project", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="project_district_positioner_id", referencedColumnName="id", nullable=true)
     */
    private $projectDistrictPositioners;

    /**
     * @ORM\Column(name="header_type", type="string", nullable=false)
     */
    private $headerType = ProjectHeaderType::FULL_WIDTH;

    /**
     * @ORM\Column(name="cover_filter_opacity_percent", type="integer", nullable=false)
     * @Assert\Range(
     *     min = 0,
     *     max = 100,
     *     notInRangeMessage = "The opacity value must be between {{ min }} and {{ max }}.",
     * )
     */
    private $coverFilterOpacityPercent = self::DEFAULT_COVER_FILTER_OPACITY;

    /**
     * @ORM\Column(name="is_external", type="boolean", options={"default": false})
     */
    private $isExternal = false;

    /**
     * @ORM\Column(name="external_participants_count", type="integer", nullable=true)
     */
    private $externalParticipantsCount;

    /**
     * @ORM\Column(name="external_contributions_count", type="integer", nullable=true)
     */
    private $externalContributionsCount;

    /**
     * @ORM\Column(name="external_votes_count", type="integer", nullable=true)
     */
    private $externalVotesCount;

    /**
     * @ORM\Column(name="archived", type="boolean", nullable=false, options={"default" = false})
     */
    private bool $archived = false;

    /**
     * @ORM\OneToMany(targetEntity=EmailingCampaign::class, mappedBy="project", orphanRemoval=true)
     */
    private Collection $emailingCampaigns;

    private ?\DateTime $startAt = null;

    private ?\DateTime $endAt = null;

    public function __construct()
    {
        $this->restrictedViewerGroups = new ArrayCollection();
        $this->themes = new ArrayCollection();
        $this->authors = new ArrayCollection();
        $this->steps = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->posts = new ArrayCollection();
        $this->projectDistrictPositioners = new ArrayCollection();
        $this->updatedAt = new \DateTime();
        $this->publishedAt = new \DateTime();
        $this->emailingCampaigns = new ArrayCollection();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->publishedAt = new \DateTime();
            $this->createdAt = new \DateTime();
            $this->updatedAt = new \DateTime();
            if (!empty($this->projectDistrictPositioners)) {
                $projectDistrictPositioners = new ArrayCollection();
                foreach ($this->projectDistrictPositioners as $districtPositioner) {
                    $clonedProjectDistrictPositioner = clone $districtPositioner;
                    $clonedProjectDistrictPositioner->setProject($this);
                    $projectDistrictPositioners->add($clonedProjectDistrictPositioner);
                }
                $this->setProjectDistrictPositioners($projectDistrictPositioners);
            }
        }
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New project';
    }

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
     * @return Project
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    public function getExternalLink()
    {
        return $this->externalLink;
    }

    public function setExternalLink(?string $link = null): self
    {
        $this->externalLink = $link;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param $slug
     *
     * @return $this
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $value): self
    {
        $this->createdAt = $value;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $value): self
    {
        $this->updatedAt = $value;

        return $this;
    }

    public function getPublishedAt(): ?\DateTime
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(\DateTime $publishedAt): self
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getFirstAuthor(): ?Owner
    {
        if ($this->authors && isset($this->authors[0])) {
            return $this->authors[0]->getAuthor();
        }

        return null;
    }

    public function setAuthors(array $authors): self
    {
        if (empty($authors)) {
            throw new \InvalidArgumentException('Authors array can not be empty.');
        }

        $this->authors = new ArrayCollection($authors);

        return $this;
    }

    public function getUserAuthors(): array
    {
        $authors = [];
        foreach ($this->authors as $projectAuthor) {
            $authors[] = $projectAuthor->getAuthor();
        }

        return $authors;
    }

    public function isAuthor(Author $author): bool
    {
        $authors = $this->getUserAuthors();
        if (\in_array($author, $authors, true)) {
            return true;
        }

        return false;
    }

    public function getAuthors(): Collection
    {
        return $this->authors;
    }

    public function addAuthor(ProjectAuthor $projectAuthor): self
    {
        if (!$this->authors->contains($projectAuthor)) {
            $this->authors->add($projectAuthor);
        }

        return $this;
    }

    public function removeAuthor(ProjectAuthor $projectAuthor): self
    {
        if ($this->authors->contains($projectAuthor)) {
            $this->authors->remove($projectAuthor);
        }

        return $this;
    }

    public function getThemes(): iterable
    {
        $themesArray = $this->themes->toArray();
        usort($themesArray, fn ($a, $b) => $a->getPosition() <=> $b->getPosition());

        return new ArrayCollection($themesArray);
    }

    /**
     * Add theme.
     *
     * @param \Capco\AppBundle\Entity\Theme $theme
     *
     * @return Project
     */
    public function addTheme(Theme $theme)
    {
        if (!$this->themes->contains($theme)) {
            $this->themes->add($theme);
        }
        $theme->addProject($this);

        return $this;
    }

    /**
     * Remove theme.
     *
     * @param \Capco\AppBundle\Entity\Theme $theme
     *
     * @return $this
     */
    public function removeTheme(Theme $theme)
    {
        $this->themes->removeElement($theme);
        $theme->removeProject($this);

        return $this;
    }

    public function getRealSteps(): array
    {
        $steps = [];
        foreach ($this->steps as $qaq) {
            if ($qaq->getStep()) {
                $steps[] = $qaq->getStep();
            }
        }

        return $steps;
    }

    /**
     * Get steps.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSteps()
    {
        return $this->steps;
    }

    /**
     * Reset steps.
     *
     * @return $this
     */
    public function resetSteps()
    {
        $this->steps = new ArrayCollection();

        return $this;
    }

    public function addStep(ProjectAbstractStep $step)
    {
        $step->setProject($this);

        if ($this->steps->contains($step)) {
            return $this;
        }

        $this->steps->add($step);

        return $this;
    }

    /**
     * Remove step.
     *
     * @return $this
     */
    public function removeStep(ProjectAbstractStep $step)
    {
        $this->steps->removeElement($step);

        return $this;
    }

    public function getIsProposalStepSplitViewEnabled(): bool
    {
        return $this->isProposalStepSplitViewEnabled;
    }

    public function setIsProposalStepSplitViewEnabled(bool $isProposalStepSplitViewEnabled): void
    {
        $this->isProposalStepSplitViewEnabled = $isProposalStepSplitViewEnabled;
    }

    /**
     * @return string
     */
    public function getVideo()
    {
        return $this->video;
    }

    /**
     * @param string $video
     */
    public function setVideo($video)
    {
        $this->video = $video;
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getEvents()
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

    /**
     * Get Posts.
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPosts()
    {
        return $this->posts;
    }

    /**
     * Add Post.
     *
     * @return $this
     */
    public function addPost(Post $post)
    {
        if (!$this->posts->contains($post)) {
            $this->posts[] = $post;
        }

        return $this;
    }

    /**
     * Remove post.
     *
     * @return $this
     */
    public function removePost(Post $post)
    {
        $this->posts->removeElement($post);

        return $this;
    }

    /**
     * @return int
     */
    public function getOpinionsRankingThreshold()
    {
        return $this->opinionsRankingThreshold;
    }

    /**
     * @param int $opinionsRankingThreshold
     */
    public function setOpinionsRankingThreshold($opinionsRankingThreshold)
    {
        $this->opinionsRankingThreshold = $opinionsRankingThreshold;
    }

    /**
     * @return int
     */
    public function getVersionsRankingThreshold()
    {
        return $this->versionsRankingThreshold;
    }

    /**
     * @param int $versionsRankingThreshold
     */
    public function setVersionsRankingThreshold($versionsRankingThreshold)
    {
        $this->versionsRankingThreshold = $versionsRankingThreshold;
    }

    /**
     * @return int
     */
    public function getIncludeAuthorInRanking()
    {
        return $this->includeAuthorInRanking;
    }

    /**
     * @param int $includeAuthorInRanking
     */
    public function setIncludeAuthorInRanking($includeAuthorInRanking)
    {
        $this->includeAuthorInRanking = $includeAuthorInRanking;
    }

    // ******************** Custom methods ******************************

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     *
     * @param null|mixed $user
     */
    public function canDisplay($user = null): bool
    {
        return $this->viewerCanSee($user);
    }

    public function canContribute($user = null): bool
    {
        return $this->viewerCanSee($user);
    }

    public function getFirstStep(): ?AbstractStep
    {
        $first = null;
        if (!empty($this->steps)) {
            $first = false !== $this->steps->first() ? $this->steps->first() : null;
            foreach ($this->steps as $step) {
                if (
                    null !== $first
                    && null !== $step
                    && $step->getPosition() < $first->getPosition()
                ) {
                    $first = $step;
                }
            }
        }

        return null !== $first ? $first->getStep() : null;
    }

    public function getStartAt(): ?\DateTime
    {
        $startAt = null;
        /** * @var ProjectAbstractStep $step  */
        foreach ($this->steps as $step) {
            if (!$startAt) {
                $startAt = $step->getStep()->getStartAt();

                continue;
            }
            if ($step->getStep()->getStartAt() < $startAt) {
                $startAt = $step->getStep()->getStartAt();
            }
        }

        return $startAt;
    }

    public function getEndAt(): ?\DateTime
    {
        $endAt = null;
        /** * @var ProjectAbstractStep $step  */
        foreach ($this->steps as $step) {
            if (!$endAt) {
                $endAt = $step->getStep()->getEndAt();

                continue;
            }
            if ($step->getStep()->getEndAt() > $endAt) {
                $endAt = $step->getStep()->getEndAt();
            }
        }

        return $endAt;
    }

    public function isTimeless(): bool
    {
        /** * @var ProjectAbstractStep $pas  */
        foreach ($this->steps as $pas) {
            $isTimeless = $pas->getStep()->isTimeless();
            if ($isTimeless) {
                return true;
            }
        }

        return false;
    }

    public function getCurrentStep(): ?AbstractStep
    {
        $steps = $this->getEnabledStepsExcludingPresentationStep();

        if (empty($steps)) {
            return null;
        }

        foreach ($steps as $step) {
            // we filter out timeless other steps from open steps since they should behave like presentation steps
            if ('other' === $step->getType() && $step->isTimeless()) {
                continue;
            }
            if ($step->isOpen()) {
                return $step;
            }
        }

        foreach ($steps as $step) {
            if ($step->isFuture()) {
                return $step;
            }
        }

        $reversedSteps = array_reverse($steps);
        foreach ($reversedSteps as $step) {
            if ($step->isClosed()) {
                return $step;
            }
        }

        return null;
    }

    public function getCurrentStepState(): int
    {
        $currentStep = $this->getCurrentStep();
        if ($currentStep) {
            if ($currentStep->isClosed()) {
                return self::$openingStatuses['closed'];
            }
            if ($currentStep->isOpen()) {
                return self::$openingStatuses['opened'];
            }
            if ($currentStep->isFuture()) {
                foreach ($this->getRealSteps() as $step) {
                    /** @var AbstractStep $step */
                    if ($step->isClosed()) {
                        return self::$openingStatuses['future_with_finished_steps'];
                    }
                }

                return self::$openingStatuses['future_witout_finished_steps'];
            }
        }

        return -1;
    }

    public function isClosed(): bool
    {
        return $this->getCurrentStep() ? $this->getCurrentStep()->isClosed() : true;
    }

    public function getConsultationStepOpen()
    {
        foreach ($this->steps as $step) {
            if ($step->getStep()->isConsultationStep() && $step->getStep()->isOpen()) {
                return $step->getStep();
            }
        }

        return null;
    }

    public function getFirstCollectStep(): ?CollectStep
    {
        /** @var AbstractStep $step */
        foreach ($this->steps as $step) {
            if ($step->getStep() && $step->getStep()->isCollectStep()) {
                return $step->getStep();
            }
        }

        return null;
    }

    public function getFirstDebateStep(): ?DebateStep
    {
        /** @var AbstractStep $step */
        foreach ($this->steps as $step) {
            if ($step->getStep() && $step->getStep()->isDebateStep()) {
                return $step->getStep();
            }
        }

        return null;
    }

    public function getFirstQuestionnaireStep(): ?QuestionnaireStep
    {
        /** @var ProjectAbstractStep $step */
        foreach ($this->steps as $step) {
            if ($step->getStep() && $step->getStep()->isQuestionnaireStep()) {
                return $step->getStep();
            }
        }

        return null;
    }

    public function getFirstAnalysisStep(): ?AbstractStep
    {
        foreach ($this->getSteps() as $step) {
            if (
                $step->getStep()
                && $step->getStep()->isCollectStep()
                && $step->getStep()->getProposalForm()
                && $step
                    ->getStep()
                    ->getProposalForm()
                    ->getAnalysisConfiguration()
            ) {
                return $step
                    ->getStep()
                    ->getProposalForm()
                    ->getAnalysisConfiguration()
                    ->getAnalysisStep()
                ;
            }
        }

        return null;
    }

    public function getExportableSteps(): array
    {
        $steps = [];

        foreach ($this->steps as $pas) {
            /** @var AbstractStep $step */
            $step = $pas->getStep();
            if (
                $step->isConsultationStep()
                || $step->isCollectStep()
                || $step->isSelectionStep()
                || $step->isQuestionnaireStep()
                || $step->isDebateStep()
            ) {
                $steps[] = $pas;
            }
        }

        return $steps;
    }

    public function canEnableProposalStepSplitView(): bool
    {
        foreach ($this->steps as $pas) {
            /** @var AbstractStep $step */
            $step = $pas->getStep();
            if ((
                $step->isSelectionStep() || $step->isCollectStep()
            )
                && (
                    VoteType::BUDGET === $step->getVoteType()
                    || $step->hasVoteThreshold()
                )
            ) {
                return false;
            }
        }

        return true;
    }

    public function hasParticipativeStep(?string $exceptStepId = null): bool
    {
        if ($this->steps->isEmpty()) {
            return false;
        }

        foreach ($this->steps as $pas) {
            $step = $pas->getStep();
            if ($exceptStepId && $step->getId() === GlobalId::fromGlobalId($exceptStepId)['id']) {
                continue;
            }
            if ($step instanceof ParticipativeStepInterface && $step->isParticipative()) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return null|ProjectType
     */
    public function getProjectType()
    {
        return $this->projectType;
    }

    public function setProjectType(?ProjectType $projectType = null): self
    {
        $this->projectType = $projectType;

        return $this;
    }

    public function getHeaderType(): string
    {
        return $this->headerType;
    }

    public function setHeaderType(string $headerType): self
    {
        if (!\in_array($headerType, ProjectHeaderType::getAvailableTypes(), true)) {
            throw new \InvalidArgumentException('Invalid header type.');
        }
        $this->headerType = $headerType;

        return $this;
    }

    public function getCoverFilterOpacityPercent(): int
    {
        return $this->coverFilterOpacityPercent;
    }

    public function setCoverFilterOpacityPercent(int $coverFilterOpacity): self
    {
        $this->coverFilterOpacityPercent = $coverFilterOpacity;

        return $this;
    }

    // ************************** Lifecycle **************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteProject()
    {
        if ($this->themes->count() > 0) {
            foreach ($this->themes as $theme) {
                $theme->removeProject($this);
            }
        }
    }

    /**
     * @ORM\PreFlush
     */
    public function checkTitleIsNotNullNorEmpty()
    {
        if (empty($this->title) || null === $this->title) {
            throw new \InvalidArgumentException('Title cannot be null nor empty');
        }
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        // Proposals must be indexed before, to calculate a correct `contributionsCount`
        return 13;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'project';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchProject',
            'ElasticsearchProjectNestedProjectType',
            'ElasticsearchProjectNestedTheme',
            'ElasticsearchProjectNestedAuthor',
            'ElasticsearchProjectNestedProjectDistrictPositioner',
        ];
    }

    public function hasVotableStep(): bool
    {
        foreach ($this->steps as $step) {
            if ($step->getStep() instanceof VotableInterface) {
                return true;
            }
        }

        return false;
    }

    public function getVisibility(): int
    {
        return $this->visibility;
    }

    public function setVisibility(int $visibility): self
    {
        $this->visibility = $visibility;

        return $this;
    }

    public function isPublic(): bool
    {
        return ProjectVisibilityMode::VISIBILITY_PUBLIC === $this->getVisibility();
    }

    public function isOpinionCanBeFollowed(): bool
    {
        return $this->opinionCanBeFollowed;
    }

    public function setOpinionCanBeFollowed(bool $opinionCanBeFollowed = false): self
    {
        $this->opinionCanBeFollowed = $opinionCanBeFollowed;

        return $this;
    }

    public function getRestrictedViewerGroups(): Collection
    {
        return $this->restrictedViewerGroups;
    }

    public function setRestrictedViewerGroups($restrictedViewerGroups): self
    {
        if ($restrictedViewerGroups instanceof Collection) {
            $this->restrictedViewerGroups = $restrictedViewerGroups;
        } elseif (\is_array($restrictedViewerGroups)) {
            foreach ($restrictedViewerGroups as $group) {
                $this->addAccessToUserGroup($group);
            }
        }

        return $this;
    }

    public function addAccessToUserGroup(Group $group): self
    {
        $this->restrictedViewerGroups->add($group);

        return $this;
    }

    public function removeAccessToUserGroup(Group $group): self
    {
        if ($this->restrictedViewerGroups->containsKey($group)) {
            $this->restrictedViewerGroups->remove($group);
        }

        return $this;
    }

    public function isVotesCounterDisplayable(): bool
    {
        $steps = $this->getRealSteps();
        foreach ($steps as $step) {
            if (
                $step instanceof ConsultationStep
                || $step instanceof SelectionStep
                || $step instanceof CollectStep
                || $step instanceof DebateStep
            ) {
                if ($step->isVotable()) {
                    return true;
                }
            }
        }

        return false;
    }

    public function isContributionsCounterDisplayable(): bool
    {
        $steps = $this->getRealSteps();
        foreach ($steps as $step) {
            if (
                $step instanceof ConsultationStep
                || $step instanceof QuestionnaireStep
                || $step instanceof CollectStep
                || $step instanceof DebateStep
            ) {
                return true;
            }
        }

        return false;
    }

    public function isParticipantsCounterDisplayable(): bool
    {
        $steps = $this->getRealSteps();
        foreach ($steps as $step) {
            if ($step instanceof SelectionStep) {
                if ($step->isVotable()) {
                    return true;
                }
            }
            if (
                $step instanceof CollectStep
                || $step instanceof ConsultationStep
                || $step instanceof QuestionnaireStep
                || $step instanceof DebateStep
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * If it's an external project we set manually the counter of participant and contributions.
     */
    public function getIsExternal(): bool
    {
        return $this->isExternal;
    }

    public function setIsExternal(bool $isExternal): self
    {
        $this->isExternal = $isExternal;
        if ($isExternal && null === $this->externalParticipantsCount) {
            $this->externalParticipantsCount = 0;
        }
        if ($isExternal && null === $this->externalContributionsCount) {
            $this->externalContributionsCount = 0;
        }
        if ($isExternal && null === $this->externalVotesCount) {
            $this->externalVotesCount = 0;
        }

        return $this;
    }

    public function isExternal(): bool
    {
        return $this->isExternal;
    }

    public function getExternalParticipantsCount(): ?int
    {
        return $this->externalParticipantsCount;
    }

    public function setExternalParticipantsCount(?int $externalParticipantsCount = null): self
    {
        $this->externalParticipantsCount = $externalParticipantsCount;

        return $this;
    }

    public function getExternalContributionsCount(): ?int
    {
        return $this->externalContributionsCount;
    }

    public function setExternalContributionsCount(?int $externalContributionsCount = null): self
    {
        $this->externalContributionsCount = $externalContributionsCount;

        return $this;
    }

    public function getExternalVotesCount(): ?int
    {
        return $this->externalVotesCount;
    }

    public function setExternalVotesCount(?int $externalVotesCount = null): self
    {
        $this->externalVotesCount = $externalVotesCount;

        return $this;
    }

    public function getProjectDistrictPositioners(): iterable
    {
        return $this->projectDistrictPositioners;
    }

    public function getProjectDistrictPositionersIds(): iterable
    {
        return array_map(fn (ProjectDistrictPositioner $district) => $district->getDistrict()->getId(), $this->getProjectDistrictPositioners()->toArray());
    }

    public function setProjectDistrictPositioners(iterable $projectDistrictPositioners): self
    {
        $this->projectDistrictPositioners = $projectDistrictPositioners;

        return $this;
    }

    public function getAnalysts(): array
    {
        $collectStep = $this->getFirstCollectStep();

        if (!$collectStep) {
            return [];
        }

        /** @var ProposalForm $proposalForm */
        $proposalForm = $collectStep->getProposalForm();

        if (!$proposalForm) {
            return [];
        }
        $analysts = [];
        /** @var Proposal $proposal */
        foreach ($proposalForm->getProposals() as $proposal) {
            $analysts += $proposal->getAnalysts()->toArray();
        }

        return array_filter(array_unique($analysts));
    }

    public function getSupervisors(): array
    {
        $collectStep = $this->getFirstCollectStep();

        if (!$collectStep) {
            return [];
        }

        /** @var ProposalForm $proposalForm */
        $proposalForm = $collectStep->getProposalForm();

        if (!$proposalForm) {
            return [];
        }
        $supervisors = [];
        /** @var Proposal $proposal */
        foreach ($proposalForm->getProposals() as $proposal) {
            $supervisors[] = $proposal->getSupervisor();
        }

        return array_filter(array_unique($supervisors));
    }

    public function getDecisionMakers(): array
    {
        $collectStep = $this->getFirstCollectStep();

        if (!$collectStep) {
            return [];
        }

        /** @var ProposalForm $proposalForm */
        $proposalForm = $collectStep->getProposalForm();

        if (!$proposalForm) {
            return [];
        }
        $decisionMakers = [];
        /** @var Proposal $proposal */
        foreach ($proposalForm->getProposals() as $proposal) {
            $decisionMakers[] = $proposal->getDecisionMaker();
        }

        return array_filter(array_unique($decisionMakers));
    }

    public function getCategories(): array
    {
        $collectStep = $this->getFirstCollectStep();

        if (!$collectStep) {
            return [];
        }

        /** @var ProposalForm $proposalForm */
        $proposalForm = $collectStep->getProposalForm();

        if (!$proposalForm) {
            return [];
        }
        $decisionMakers = [];
        /** @var Proposal $proposal */
        foreach ($proposalForm->getProposals() as $proposal) {
            if ($proposal->getCategory()) {
                $decisionMakers[] = $proposal->getCategory();
            }
        }

        return array_filter(array_unique($decisionMakers, \SORT_REGULAR));
    }

    /**
     * check if viewer is allowed the project.
     *
     * @param null|mixed $viewer
     */
    public function viewerCanSee($viewer = null): bool
    {
        if ($this->isPublic()) {
            return true;
        }

        $isOwner = $this->owner && $this->owner === $viewer;
        if (
            $viewer
            && ($viewer->isAdmin() || \in_array($viewer, $this->getUserAuthors()) || $isOwner)
        ) {
            return true;
        }

        /** @var User $viewer */
        if (ProjectVisibilityMode::VISIBILITY_CUSTOM === $this->getVisibility() && $viewer) {
            $viewerGroups = $viewer->getUserGroups()->toArray();
            $allowedGroups = $this->getRestrictedViewerGroups()->toArray();
            foreach ($viewerGroups as $userGroup) {
                if (\in_array($userGroup->getGroup(), $allowedGroups)) {
                    return true;
                }
            }
        }

        if ($viewer && $this->organizationOwner) {
            return $viewer->isMemberOfOrganization($this->organizationOwner);
        }

        $viewerVisibility = $this->getVisibilityForViewer($viewer);

        return \in_array($this->getVisibility(), $viewerVisibility)
            && $this->getVisibility() < ProjectVisibilityMode::VISIBILITY_CUSTOM;
    }

    public function isArchived(): bool
    {
        return $this->archived;
    }

    public function setArchived(bool $archived): self
    {
        $this->archived = $archived;

        return $this;
    }

    public function getEmailingCampaigns(): Collection
    {
        return $this->emailingCampaigns;
    }

    public function setEmailingCampaigns(Collection $emailingCampaigns): self
    {
        $this->emailingCampaigns = $emailingCampaigns;

        return $this;
    }

    private function getEnabledStepsExcludingPresentationStep(): array
    {
        $steps = [];
        foreach ($this->steps as $projectStep) {
            $step = $projectStep->getStep();
            $isEnabled = $step->getEnabled();
            $isPresentationStep = 'presentation' === $step->getType();
            if ($isPresentationStep || !$isEnabled) {
                continue;
            }
            $steps[] = $step;
        }

        return $steps;
    }
}

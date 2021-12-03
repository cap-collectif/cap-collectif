<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\QuestionnableForm;
use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalFormObjectType;
use Capco\AppBundle\Traits\OwnerTrait;
use Capco\AppBundle\Traits\ReferenceTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\UsingSocialNetworksTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\District\ProposalDistrict;

/**
 * @ORM\Table(
 *     name="proposal_form",
 *     uniqueConstraints={
 *        @UniqueConstraint(
 *            name="reference_unique",
 *            columns={"reference"}
 *        )
 *    }
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalFormRepository")
 * @UniqueEntity(
 *   fields={"reference"},
 *   message="proposal_form.reference.not_unique"
 * )
 */
class ProposalForm implements DisplayableInBOInterface, QuestionnableForm
{
    use OwnerTrait;
    use ReferenceTrait;
    use SluggableTitleTrait;
    use TimestampableTrait;
    use UsingSocialNetworksTrait;
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected ?\DateTime $updatedAt = null;

    /**
     * @ORM\Column(name="grid_view_enabled", type="boolean", nullable=false, options={"default": true})
     */
    protected bool $isGridViewEnabled = true;

    /**
     * @ORM\Column(name="list_view_enabled", type="boolean", nullable=false, options={"default": true})
     */
    protected bool $isListViewEnabled = false;

    /**
     * @ORM\Column(name="map_view_enabled", type="boolean", nullable=false, options={"default": false})
     */
    protected bool $isMapViewEnabled = false;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private ?string $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", inversedBy="proposalForm", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?CollectStep $step;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="proposalForm", cascade={"remove"})
     */
    private Collection $proposals;

    /**
     * @ORM\Column(name="commentable", type="boolean", nullable=false, options={"default": true})
     */
    private bool $commentable = true;

    /**
     * @ORM\Column(name="costable", type="boolean", nullable=false, options={"default": true})
     */
    private bool $costable = true;

    /**
     * @Assert\Valid
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private Collection $questions;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalCategory", mappedBy="form", cascade={"persist"}, orphanRemoval=true)
     * @ORM\OrderBy({"name" = "ASC"})
     */
    private Collection $categories;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\ProposalDistrict", mappedBy="form", cascade={"persist"}, orphanRemoval=true)
     * @ORM\OrderBy({"id" = "ASC"})
     */
    private Collection $districts;

    /**
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private ?string $titleHelpText;

    /**
     * @ORM\Column(name="summary_help_text", type="string", length=255, nullable=true)
     */
    private ?string $summaryHelpText;

    /**
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private ?string $descriptionHelpText;

    /**
     * @ORM\Column(name="theme_help_text", type="string", length=255, nullable=true)
     */
    private ?string $themeHelpText;

    /**
     * @ORM\Column(name="district_help_text", type="string", length=255, nullable=true)
     */
    private ?string $districtHelpText;

    /**
     * @ORM\Column(name="category_help_text", type="string", length=255, nullable=true)
     */
    private ?string $categoryHelpText;

    /**
     * @ORM\Column(name="address_help_text", type="string", length=255, nullable=true)
     */
    private ?string $addressHelpText;

    /**
     * @ORM\Column(name="illustration_help_text", type="string", length=255, nullable=true)
     */
    private ?string $illustrationHelpText;

    /**
     * @ORM\Column(name="using_themes", type="boolean", nullable=false)
     */
    private bool $usingThemes = false;

    /**
     * @ORM\Column(name="allow_aknowledge", type="boolean", nullable=false)
     */
    private bool $allowAknowledge = false;

    /**
     * @ORM\Column(name="theme_mandatory", type="boolean", nullable=false)
     */
    private bool $themeMandatory = false;

    /**
     * @ORM\Column(name="using_categories", type="boolean", nullable=false)
     */
    private bool $usingCategories = false;

    /**
     * @ORM\Column(name="category_mandatory", type="boolean", nullable=false)
     */
    private bool $categoryMandatory = false;

    /**
     * @ORM\Column(name="district_mandatory", type="boolean", nullable=false)
     */
    private bool $districtMandatory = false;

    /**
     * @ORM\Column(name="using_district", type="boolean", nullable=false)
     */
    private bool $usingDistrict = false;

    /**
     * @ORM\Column(name="using_tipsmeee", type="boolean", nullable=false, options={"default": false})
     */
    private bool $usingTipsmeee = false;

    /**
     * @ORM\Column(name="tipsmeee_help_text", type="string", length=255, nullable=true)
     */
    private ?string $tipsmeeeHelpText;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration", cascade={"persist", "remove"}, inversedBy="proposalForm")
     * @ORM\JoinColumn(name="notification_configuration_id", referencedColumnName="id", nullable=false)
     */
    private ProposalFormNotificationConfiguration $notificationsConfiguration;

    /**
     * @ORM\Column(name="using_address", nullable=false, type="boolean", options={"default": false})
     */
    private bool $usingAddress = false;

    /**
     * @ORM\Column(name="require_proposal_in_a_zone", nullable=false, type="boolean", options={"default": false})
     */
    private bool $proposalInAZoneRequired = false;

    /**
     * @ORM\Column(name="zoom_map", nullable=true, type="integer")
     */
    private ?int $zoomMap;

    /**
     * @ORM\Column(name="map_center", type="text", nullable=true)
     */
    private ?string $mapCenter;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="proposalForm", cascade={"persist"})
     * @ORM\JoinColumn(name="evaluation_form_id", nullable=true)
     */
    private ?Questionnaire $evaluationForm;

    /**
     * @ORM\Column(name="object_type", nullable=false, type="string", options={"default": "proposal"})
     */
    private string $objectType = ProposalFormObjectType::PROPOSAL;

    /**
     * @ORM\Column(name="using_description", type="boolean", nullable=false)
     */
    private bool $usingDescription = false;

    /**
     * @ORM\Column(name="description_mandatory", type="boolean", nullable=false)
     */
    private bool $descriptionMandatory = false;

    /**
     * @ORM\Column(name="using_summary", type="boolean", nullable=false)
     */
    private bool $usingSummary = false;

    /**
     * @ORM\Column(name="using_illustration", type="boolean", nullable=false)
     */
    private bool $usingIllustration = false;

    /**
     * @ORM\Column(name="suggesting_similar_proposals", type="boolean", nullable=false, options={"default": true})
     */
    private bool $suggestingSimilarProposals = true;

    /**
     * @ORM\Column(name="can_contact", type="boolean", nullable=false)
     */
    private bool $canContact = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\AnalysisConfiguration", mappedBy="proposalForm", cascade={"persist", "remove"})
     * @ORM\JoinColumn(nullable=true, name="analysis_configuration", onDelete="SET NULL")
     */
    private ?AnalysisConfiguration $analysisConfiguration;

    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->categories = new ArrayCollection();
        $this->districts = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->updatedAt = new \DateTime();

        $this->initializeNotificationConfiguration();
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
            $this->step = null;
            $this->reference = null;
            $this->createdAt = new \DateTime();
            $this->updatedAt = new \DateTime();
            $this->proposals = new ArrayCollection();

            if ($this->evaluationForm) {
                /** @var Questionnaire $clonedEvaluationForm */
                $clonedEvaluationForm = clone $this->evaluationForm;
                $clonedEvaluationForm->setProposalForm($this);
                $this->setEvaluationForm($clonedEvaluationForm);
            }

            if ($this->analysisConfiguration) {
                /** @var AnalysisConfiguration $clonedAnalysisConfig */
                $clonedAnalysisConfig = clone $this->analysisConfiguration;
                $clonedAnalysisConfig->setProposalForm($this);
            } else {
                $this->analysisConfiguration = null;
            }

            $questionsClone = $this->cloneProposalFormQuestions();

            $districtsClone = new ArrayCollection();
            foreach ($this->districts as $district) {
                $itemClone = clone $district;
                $itemClone->setForm($this);
                $districtsClone->add($itemClone);
            }

            $categoriesClone = new ArrayCollection();
            foreach ($this->categories as $category) {
                $itemClone = clone $category;
                $itemClone->setForm($this);
                $categoriesClone->add($itemClone);
            }

            $this->questions = $questionsClone;
            $this->categories = $categoriesClone;
            $this->districts = $districtsClone;
            $this->initializeNotificationConfiguration();
        }
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New ProposalForm';
    }

    public function initializeNotificationConfiguration(): void
    {
        $proposalFormNotificationConfiguration = new ProposalFormNotificationConfiguration();
        $proposalFormNotificationConfiguration->setProposalForm($this);

        $this->notificationsConfiguration = $proposalFormNotificationConfiguration;
    }

    public function setProposalInAZoneRequired(bool $proposalInAZoneRequired): self
    {
        $this->proposalInAZoneRequired = $proposalInAZoneRequired;

        return $this;
    }

    public function isProposalInAZoneRequired(): bool
    {
        return $this->proposalInAZoneRequired;
    }

    public function setDescription(?string $description = null): self
    {
        $this->description = $description;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getSummaryHelpText(): ?string
    {
        return $this->summaryHelpText;
    }

    public function setSummaryHelpText(?string $summaryHelpText = null): self
    {
        $this->summaryHelpText = $summaryHelpText;

        return $this;
    }

    public function getProposals(): Collection
    {
        return $this->proposals;
    }

    public function setProposals(ArrayCollection $proposals): self
    {
        $this->proposals = $proposals;

        return $this;
    }

    public function getRealQuestions(): Collection
    {
        return $this->getQuestions()
            ? $this->getQuestions()->map(function (
                QuestionnaireAbstractQuestion $questionnaireAbstractQuestion
            ) {
                return $questionnaireAbstractQuestion->getQuestion();
            })
            : new ArrayCollection();
    }

    public function getQuestionByTitle(string $title): ?AbstractQuestion
    {
        /** @var AbstractQuestion $question */
        foreach ($this->getRealQuestions() as $question) {
            if ($question->getTitle() === $title) {
                return $question;
            }
        }

        return null;
    }

    public function getQuestions(): Collection
    {
        return $this->questions;
    }

    public function getQuestionsArray(): array
    {
        return $this->questions->toArray();
    }

    public function setQuestions(Collection $questions): self
    {
        foreach ($questions as $question) {
            $question->setProposalForm($this);
        }
        $this->questions = $questions;

        return $this;
    }

    public function addQuestion(QuestionnaireAbstractQuestion $question): self
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
        }
        $question->setProposalForm($this);

        return $this;
    }

    public function removeQuestion(QuestionnaireAbstractQuestion $question): self
    {
        $this->questions->removeElement($question);
        $question->setProposalForm();

        return $this;
    }

    public function getStep(): ?CollectStep
    {
        return $this->step;
    }

    public function getProject(): ?Project
    {
        return $this->step ? $this->step->getProject() : null;
    }

    public function setStep(?CollectStep $step = null): self
    {
        $this->step = $step;

        return $this;
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay($user = null): bool
    {
        if ($this->getStep()) {
            return $this->getStep()->canDisplay($user);
        }

        // not linked to a project so we can display it
        return true;
    }

    public function viewerCanSeeInBo($user = null): bool
    {
        if ($this->getStep()) {
            return $this->getStep()->viewerCanSeeInBo($user);
        }

        // not linked to a project so we can display it
        return true;
    }

    public function isContribuable($user = null): bool
    {
        return $this->canContribute($user);
    }

    public function canContribute($user = null): bool
    {
        return $this->getStep() && $this->getStep()->canContribute($user);
    }

    public function getTitleHelpText(): ?string
    {
        return $this->titleHelpText;
    }

    public function setTitleHelpText(?string $titleHelpText = null): self
    {
        $this->titleHelpText = $titleHelpText;

        return $this;
    }

    public function getDescriptionHelpText(): ?string
    {
        return $this->descriptionHelpText;
    }

    public function setDescriptionHelpText(?string $descriptionHelpText = null): self
    {
        $this->descriptionHelpText = $descriptionHelpText;

        return $this;
    }

    public function getThemeHelpText(): ?string
    {
        return $this->themeHelpText;
    }

    public function setThemeHelpText(?string $themeHelpText = null): self
    {
        $this->themeHelpText = $themeHelpText;

        return $this;
    }

    public function getDistrictHelpText(): ?string
    {
        return $this->districtHelpText;
    }

    public function setDistrictHelpText(?string $districtHelpText = null): self
    {
        $this->districtHelpText = $districtHelpText;

        return $this;
    }

    public function getCategories(): Collection
    {
        return $this->categories;
    }

    public function addCategory(ProposalCategory $category): self
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
            $category->setForm($this);
        }

        return $this;
    }

    public function removeCategory(ProposalCategory $category): self
    {
        $this->categories->removeElement($category);

        return $this;
    }

    public function getDistricts()
    {
        return $this->districts;
    }

    public function addDistrict(ProposalDistrict $district): self
    {
        if (!$this->districts->contains($district)) {
            $this->districts->add($district);
            $district->setForm($this);
        }

        return $this;
    }

    public function removeDistrict(ProposalDistrict $district): self
    {
        $this->districts->removeElement($district);

        return $this;
    }

    public function isUsingThemes(): bool
    {
        return $this->usingThemes;
    }

    public function setUsingThemes(bool $usingThemes): self
    {
        $this->usingThemes = $usingThemes;

        return $this;
    }

    public function isThemeMandatory(): bool
    {
        return $this->themeMandatory;
    }

    public function setThemeMandatory(bool $themeMandatory): self
    {
        $this->themeMandatory = $themeMandatory;

        return $this;
    }

    public function isDistrictMandatory(): bool
    {
        return $this->districtMandatory;
    }

    public function isCommentable(): bool
    {
        return $this->commentable;
    }

    public function setCommentable(bool $commentable): self
    {
        $this->commentable = $commentable;

        return $this;
    }

    public function isCostable(): bool
    {
        return $this->costable;
    }

    public function setCostable(bool $costable): self
    {
        $this->costable = $costable;

        return $this;
    }

    public function setDistrictMandatory(bool $districtMandatory): self
    {
        $this->districtMandatory = $districtMandatory;

        return $this;
    }

    public function isUsingDistrict(): bool
    {
        return $this->usingDistrict;
    }

    public function setUsingDistrict(bool $usingDistrict): self
    {
        $this->usingDistrict = $usingDistrict;

        return $this;
    }

    public function isUsingCategories(): bool
    {
        return $this->usingCategories;
    }

    public function setUsingCategories(bool $usingCategories): self
    {
        $this->usingCategories = $usingCategories;

        return $this;
    }

    public function isCategoryMandatory(): bool
    {
        return $this->categoryMandatory;
    }

    public function setCategoryMandatory(bool $categoryMandatory): self
    {
        $this->categoryMandatory = $categoryMandatory;

        return $this;
    }

    public function getCategoryHelpText(): ?string
    {
        return $this->categoryHelpText;
    }

    public function setCategoryHelpText(?string $categoryHelpText = null): self
    {
        $this->categoryHelpText = $categoryHelpText;

        return $this;
    }

    public function getLabelTitle(): string
    {
        $label = $this->getTitle();
        if ($this->getStep()) {
            $label = $this->getStep()->getTitle() . ' - ' . $label;
        }

        return $label;
    }

    public function isNotifyingOnCreate(): bool
    {
        return $this->notificationsConfiguration && $this->notificationsConfiguration->isOnCreate();
    }

    public function isNotifyingCommentOnCreate(): bool
    {
        return $this->notificationsConfiguration &&
            $this->notificationsConfiguration->isOnCommentCreate();
    }

    public function isNotifyingCommentOnUpdate(): bool
    {
        return $this->notificationsConfiguration &&
            $this->notificationsConfiguration->isOnCommentUpdate();
    }

    public function isNotifyingCommentOnDelete(): bool
    {
        return $this->notificationsConfiguration &&
            $this->notificationsConfiguration->isOnCommentDelete();
    }

    public function getNotificationsConfiguration(): ProposalFormNotificationConfiguration
    {
        return $this->notificationsConfiguration;
    }

    public function setNotificationsConfiguration(
        ProposalFormNotificationConfiguration $configuration
    ): self {
        $this->notificationsConfiguration = $configuration;
        $configuration->setProposalForm($this);

        return $this;
    }

    public function getUsingAddress(): bool
    {
        return $this->usingAddress;
    }

    public function setUsingAddress(bool $usingAddress = false): self
    {
        $this->usingAddress = $usingAddress;

        return $this;
    }

    public function getAddressHelpText(): ?string
    {
        return $this->addressHelpText;
    }

    public function setAddressHelpText(?string $addressHelpText = null): self
    {
        $this->addressHelpText = $addressHelpText;

        return $this;
    }

    public function getZoomMap(): ?int
    {
        return $this->zoomMap;
    }

    public function setZoomMap(?int $zoomMap = null): self
    {
        $this->zoomMap = $zoomMap;

        return $this;
    }

    public function getMapCenter(): ?string
    {
        return $this->mapCenter;
    }

    public function setMapCenter(?string $mapCenter): self
    {
        $this->mapCenter = $mapCenter;

        return $this;
    }

    public function getIllustrationHelpText(): ?string
    {
        return $this->illustrationHelpText;
    }

    public function setIllustrationHelpText(?string $illustrationHelpText = null): self
    {
        $this->illustrationHelpText = $illustrationHelpText;

        return $this;
    }

    public function getEvaluationForm(): ?Questionnaire
    {
        return $this->evaluationForm;
    }

    public function setEvaluationForm(?Questionnaire $evaluationForm = null): self
    {
        $this->evaluationForm = $evaluationForm;

        return $this;
    }

    public function isAllowAknowledge(): bool
    {
        return $this->allowAknowledge;
    }

    public function setAllowAknowledge(bool $allowAknowledge): self
    {
        $this->allowAknowledge = $allowAknowledge;

        return $this;
    }

    public function getObjectType(): string
    {
        return $this->objectType;
    }

    public function setObjectType(string $objectType): self
    {
        $this->objectType = $objectType;

        return $this;
    }

    public function isProposalForm(): bool
    {
        return ProposalFormObjectType::PROPOSAL === $this->objectType;
    }

    public function getIsProposalForm(): bool
    {
        return $this->isProposalForm();
    }

    public function getUsingDescription(): bool
    {
        return $this->usingDescription;
    }

    public function setUsingDescription(bool $usingDescription): self
    {
        $this->usingDescription = $usingDescription;

        return $this;
    }

    public function getUsingSummary(): bool
    {
        return $this->usingSummary;
    }

    public function setUsingSummary(bool $usingSummary): self
    {
        $this->usingSummary = $usingSummary;

        return $this;
    }

    public function getSuggestingSimilarProposals(): bool
    {
        return $this->suggestingSimilarProposals;
    }

    public function setSuggestingSimilarProposals(bool $suggestingSimilarProposals): self
    {
        $this->suggestingSimilarProposals = $suggestingSimilarProposals;

        return $this;
    }

    public function getUsingIllustration(): bool
    {
        return $this->usingIllustration;
    }

    public function isUsingIllustration(): bool
    {
        return $this->usingIllustration;
    }

    public function setUsingIllustration(bool $usingIllustration): self
    {
        $this->usingIllustration = $usingIllustration;

        return $this;
    }

    public function getDescriptionMandatory(): bool
    {
        return $this->descriptionMandatory;
    }

    public function setDescriptionMandatory(bool $descriptionMandatory): self
    {
        $this->descriptionMandatory = $descriptionMandatory;

        return $this;
    }

    public function canContact(): bool
    {
        return $this->canContact;
    }

    public function setCanContact(bool $canContact): self
    {
        $this->canContact = $canContact;

        return $this;
    }

    public function setAnalysisConfiguration(
        ?AnalysisConfiguration $analysisConfiguration = null
    ): self {
        $this->analysisConfiguration = $analysisConfiguration;

        return $this;
    }

    public function getAnalysisConfiguration(): ?AnalysisConfiguration
    {
        return $this->analysisConfiguration;
    }

    public function isGridViewEnabled(): bool
    {
        return $this->isGridViewEnabled;
    }

    public function setIsGridViewEnabled(bool $isGridViewEnabled): self
    {
        $this->isGridViewEnabled = $isGridViewEnabled;

        return $this;
    }

    public function isListViewEnabled(): bool
    {
        return $this->isListViewEnabled;
    }

    public function setIsListViewEnabled(bool $isListViewEnabled): self
    {
        $this->isListViewEnabled = $isListViewEnabled;

        return $this;
    }

    public function isMapViewEnabled(): bool
    {
        return $this->isMapViewEnabled;
    }

    public function setIsMapViewEnabled(bool $isMapViewEnabled): self
    {
        $this->isMapViewEnabled = $isMapViewEnabled;

        return $this;
    }

    public function getTipsmeeeHelpText(): ?string
    {
        return $this->tipsmeeeHelpText;
    }

    public function setTipsmeeeHelpText(?string $tipsmeeeHelpText): self
    {
        $this->tipsmeeeHelpText = $tipsmeeeHelpText;

        return $this;
    }

    public function getUsingTipsmee(): bool
    {
        return $this->usingTipsmeee;
    }

    public function isUsingTipsmeee(): bool
    {
        return $this->usingTipsmeee;
    }

    public function setUsingTipsmeee(bool $usingTipsmeee): self
    {
        $this->usingTipsmeee = $usingTipsmeee;

        return $this;
    }

    public function getFieldsUsed(): array
    {
        $fields = ['title', 'author', 'cost'];
        if ($this->usingAddress) {
            $fields = array_merge($fields, ['address']);
        }
        if ($this->usingCategories) {
            $fields = array_merge($fields, ['category']);
        }
        if ($this->usingThemes) {
            $fields = array_merge($fields, ['theme']);
        }
        if ($this->usingDistrict) {
            $fields = array_merge($fields, ['district']);
        }
        if ($this->usingTipsmeee) {
            $fields = array_merge($fields, ['tipsmeee']);
        }
        if ($this->usingIllustration) {
            $fields = array_merge($fields, ['media_url']);
        }
        if ($this->usingDescription) {
            $fields = array_merge($fields, ['body']);
        }
        if ($this->usingSummary) {
            $fields = array_merge($fields, ['summary']);
        }
        if ($this->usingWebPage) {
            $fields = array_merge($fields, ['webPageUrl']);
        }
        if ($this->usingLinkedIn) {
            $fields = array_merge($fields, ['linkedInUrl']);
        }
        if ($this->usingYoutube) {
            $fields = array_merge($fields, ['youtubeUrl']);
        }
        if ($this->usingFacebook) {
            $fields = array_merge($fields, ['facebookUrl']);
        }
        if ($this->usingTwitter) {
            $fields = array_merge($fields, ['twitterUrl']);
        }
        if ($this->usingTwitter) {
            $fields = array_merge($fields, ['instagramUrl']);
        }

        return $fields;
    }

    public function getMandatoryFieldsUsed(): array
    {
        $fields = ['title' => true, 'author' => true];
        if ($this->usingCategories) {
            $fields = array_merge($fields, ['category' => $this->categoryMandatory]);
        }
        if ($this->usingThemes) {
            $fields = array_merge($fields, ['theme' => $this->themeMandatory]);
        }
        if ($this->usingDistrict) {
            $fields = array_merge($fields, ['district' => $this->districtMandatory]);
        }
        if ($this->usingTipsmeee) {
            $fields = array_merge($fields, ['tipsmeee' => $this->themeMandatory]);
        }
        if ($this->usingDescription) {
            $fields = array_merge($fields, ['body' => $this->descriptionMandatory]);
        }
        if (
            $this->getAnalysisConfiguration() &&
            $this->getAnalysisConfiguration()->isCostEstimationEnabled()
        ) {
            $fields = array_merge($fields, ['estimation' => false]);
        }

        foreach ($this->getRealQuestions() as $question) {
            if ($question instanceof SimpleQuestion) {
                $fields = array_merge($fields, [$question->getTitle() => $question->isRequired()]);
            }
        }

        return $fields;
    }

    public function getCustomFields(): array
    {
        $fields = [];
        /** @var AbstractQuestion $question */
        foreach ($this->getRealQuestions() as $question) {
            if (
                !\in_array($question->getTitle(), $fields) &&
                ($question instanceof SimpleQuestion || $question instanceof MediaQuestion)
            ) {
                $fields = array_merge($fields, [$question->getTitle()]);
            }
            if (
                !\in_array($question->getTitle(), $fields) &&
                $question instanceof MultipleChoiceQuestion &&
                \in_array($question->getType(), [
                    AbstractQuestion::QUESTION_TYPE_RADIO,
                    AbstractQuestion::QUESTION_TYPE_SELECT,
                    AbstractQuestion::QUESTION_TYPE_BUTTON,
                    AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION,
                ])
            ) {
                $fields = array_merge($fields, [$question->getTitle()]);
            }
        }

        return $fields;
    }

    public function getFieldsType(Collection $questions, bool $nextChoice = false): array
    {
        $fields = [];
        /** @var AbstractQuestion $question */
        foreach ($questions as $question) {
            if ($question instanceof SimpleQuestion || $question instanceof MediaQuestion) {
                $type = 'texte brut';
                if ($question instanceof MediaQuestion) {
                    $type = 'URL';
                } elseif (
                    $question instanceof SimpleQuestion &&
                    'editor' === $question->getInputType()
                ) {
                    $type = 'texte brut ou html';
                } elseif (
                    $question instanceof SimpleQuestion &&
                    'number' === $question->getInputType()
                ) {
                    $type = 'nombre';
                } elseif (
                    AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION === $question->getType()
                ) {
                    $type = $nextChoice ? 'bien' : 'très bien';
                }

                $fields[$question->getTitle()] = $type;

                continue;
            }
            if (
                $question instanceof MultipleChoiceQuestion &&
                \in_array($question->getType(), [
                    AbstractQuestion::QUESTION_TYPE_RADIO,
                    AbstractQuestion::QUESTION_TYPE_SELECT,
                    AbstractQuestion::QUESTION_TYPE_BUTTON,
                    AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION,
                ])
            ) {
                $choices = $question->getChoices()->toArray();
                $type =
                    $nextChoice && \count($choices) > 1
                        ? $choices[1]->getTitle()
                        : $question
                            ->getChoices()
                            ->first()
                            ->getTitle();

                $fields[$question->getTitle()] = $type;
            }
        }

        return $fields;
    }

    public function isUsingEstimation(): bool
    {
        return $this->getAnalysisConfiguration() &&
            $this->getAnalysisConfiguration()->isCostEstimationEnabled();
    }

    private function getCloneQuestionReference(
        array &$cloneReferences,
        QuestionnaireAbstractQuestion $qaq
    ): QuestionnaireAbstractQuestion {
        $key = $qaq->getQuestion()->getTitle() . $qaq->getQuestion()->getPosition();
        if (\array_key_exists($key, $cloneReferences)) {
            return $cloneReferences[$key];
        }

        $clonedAbstractQaq = clone $qaq;
        $clonedAbstractQaq->setProposalForm($this);
        $cloneReferences[$key] = $clonedAbstractQaq;

        return $clonedAbstractQaq;
    }

    private function findChoiceByTitle(array $array, string $title): ?QuestionChoice
    {
        foreach ($array as $element) {
            if ($title === $element->getTitle()) {
                return $element;
            }
        }

        return null;
    }

    private function cloneProposalFormQuestions(): Collection
    {
        // We create an array that contains all the duplicated questions.
        $cloneReferences = [];
        $questionsClone = new ArrayCollection();

        /** @var QuestionnaireAbstractQuestion $question */
        $toCloneQuestions = $this->questions;
        foreach ($toCloneQuestions as $question) {
            $clonedQuestion = $this->getCloneQuestionReference($cloneReferences, $question);
            if (($aq = $question->getQuestion()) && !empty(($questionJumps = $aq->getJumps()))) {
                $clonedQuestionAq = $clonedQuestion->getQuestion();

                if (
                    $questionAqAlwaysJump = $question
                        ->getQuestion()
                        ->getAlwaysJumpDestinationQuestion()
                ) {
                    if (
                        $cloneReferenceQaq = $this->getCloneQuestionReference(
                            $cloneReferences,
                            $questionAqAlwaysJump->getQuestionnaireAbstractQuestion()
                        )
                    ) {
                        // If the reference exists we use it
                        $clonedQuestionAq->setAlwaysJumpDestinationQuestion(
                            $cloneReferenceQaq->getQuestion()
                        );
                    } else {
                        // Otherwise we duplicate the question, and we add it to the references colleciton.
                        $clonedQuestionAqAlwaysJump = clone $questionAqAlwaysJump;
                        $clonedQuestionAqAlwaysJump->setQuestionnaireAbstractQuestion(
                            $clonedQuestion
                        );
                        $clonedQuestionAq->setAlwaysJumpDestinationQuestion(
                            $clonedQuestionAqAlwaysJump
                        );
                    }
                }

                // For the logic jumps duplication we clone the question
                // from the original jump and we clone it if it does not exist already
                /** @var LogicJump $jump */
                $clonedJumps = new ArrayCollection();
                foreach ($questionJumps as $jump) {
                    $clonedJump = clone $jump;
                    $clonedJump->setConditions(new ArrayCollection());
                    $clonedJump->setOrigin($clonedQuestionAq);
                    if ($jump->getDestination()) {
                        if (
                            $cloneReferenceJumpQaq = $this->getCloneQuestionReference(
                                $cloneReferences,
                                $jump->getDestination()->getQuestionnaireAbstractQuestion()
                            )
                        ) {
                            $clonedJump->setDestination($cloneReferenceJumpQaq->getQuestion());
                        } else {
                            $clonedJumpQaq = clone $jump
                                ->getDestination()
                                ->getQuestionnaireAbstractQuestion();
                            $clonedJumpQaq->setProposalForm($this);
                            $clonedJump->setDestination($clonedJumpQaq->getQuestion());
                            $cloneReferences[
                                $clonedJumpQaq->getQuestion()->getTitle()
                            ] = $clonedJumpQaq;
                        }
                        $clonedJumps->add($clonedJump);
                    }
                    /** @var AbstractLogicJumpCondition $condition */
                    foreach ($jump->getConditions() as $condition) {
                        $clonedCondition = clone $condition;
                        $clonedCondition->setQuestion($clonedQuestionAq);
                        $clonedCondition->setJump($clonedJump);
                        if ($clonedQuestionAq instanceof MultipleChoiceQuestion) {
                            $clonedCondition->setValue(
                                $this->findChoiceByTitle(
                                    $clonedQuestionAq->getChoices()->toArray(),
                                    $condition->getValue()->getTitle()
                                )
                            );
                        }
                        $clonedJump->addCondition($clonedCondition);
                    }
                }
                $clonedQuestionAq->setJumps($clonedJumps);
            }
            $questionsClone->add($clonedQuestion);
        }

        return $questionsClone;
    }
}

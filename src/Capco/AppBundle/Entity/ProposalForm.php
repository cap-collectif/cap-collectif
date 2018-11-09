<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\QuestionnableForm;
use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalFormObjectType;
use Capco\AppBundle\Traits\ReferenceTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

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
    use UuidTrait;
    use ReferenceTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    // Sonata always triggering _clone so we had to do this :/
    //@todo change this https://github.com/cap-collectif/platform/issues/5700
    protected $cloneEnable = false;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", inversedBy="proposalForm", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $step;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="proposalForm")
     */
    private $proposals;

    /**
     * @ORM\Column(name="commentable", type="boolean", nullable=false, options={"default": true})
     */
    private $commentable = true;

    /**
     * @ORM\Column(name="costable", type="boolean", nullable=false, options={"default": true})
     */
    private $costable = true;

    /**
     * @Assert\Valid
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $questions;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalCategory", mappedBy="form", cascade={"persist"}, orphanRemoval=true)
     * @ORM\OrderBy({"name" = "ASC"})
     **/
    private $categories;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District", mappedBy="form", cascade={"persist"}, orphanRemoval=true)
     * @ORM\OrderBy({"name" = "ASC"})
     **/
    private $districts;

    /**
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private $titleHelpText;

    /**
     * @ORM\Column(name="summary_help_text", type="string", length=255, nullable=true)
     */
    private $summaryHelpText;

    /**
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private $descriptionHelpText;

    /**
     * @ORM\Column(name="theme_help_text", type="string", length=255, nullable=true)
     */
    private $themeHelpText;

    /**
     * @ORM\Column(name="district_help_text", type="string", length=255, nullable=true)
     */
    private $districtHelpText;

    /**
     * @ORM\Column(name="category_help_text", type="string", length=255, nullable=true)
     */
    private $categoryHelpText;

    /**
     * @ORM\Column(name="address_help_text", type="string", length=255, nullable=true)
     */
    private $addressHelpText;

    /**
     * @ORM\Column(name="illustration_help_text", type="string", length=255, nullable=true)
     */
    private $illustrationHelpText;

    /**
     * @ORM\Column(name="using_themes", type="boolean", nullable=false)
     */
    private $usingThemes = false;

    /**
     * @ORM\Column(name="allow_aknowledge", type="boolean", nullable=false)
     */
    private $allowAknowledge = false;

    /**
     * @ORM\Column(name="theme_mandatory", type="boolean", nullable=false)
     */
    private $themeMandatory = false;

    /**
     * @ORM\Column(name="using_categories", type="boolean", nullable=false)
     */
    private $usingCategories = false;

    /**
     * @ORM\Column(name="category_mandatory", type="boolean", nullable=false)
     */
    private $categoryMandatory = false;

    /**
     * @ORM\Column(name="district_mandatory", type="boolean", nullable=false)
     */
    private $districtMandatory = false;

    /**
     * @ORM\Column(name="using_district", type="boolean", nullable=false)
     */
    private $usingDistrict = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration", cascade={"persist", "remove"}, inversedBy="proposalForm")
     * @ORM\JoinColumn(name="notification_configuration_id", referencedColumnName="id", nullable=false)
     */
    private $notificationsConfiguration;

    /**
     * @ORM\Column(name="using_address", nullable=false, type="boolean")
     */
    private $usingAddress = false;

    /**
     * @ORM\Column(name="require_proposal_in_a_zone", nullable=false, type="boolean")
     */
    private $proposalInAZoneRequired = false;

    /**
     * @ORM\Column(name="zoom_map", nullable=true, type="integer")
     */
    private $zoomMap;

    /**
     * @ORM\Column(name="lat_map", nullable=true, type="float")
     */
    private $latMap;

    /**
     * @ORM\Column(name="lng_map", nullable=true, type="float")
     */
    private $lngMap;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="proposalForm", cascade={"persist"})
     * @ORM\JoinColumn(name="evaluation_form_id", nullable=true)
     */
    private $evaluationForm;

    /**
     * @ORM\Column(name="object_type", nullable=false, type="string")
     */
    private $objectType = ProposalFormObjectType::PROPOSAL;

    /**
     * @ORM\Column(name="using_description", type="boolean", nullable=false)
     */
    private $usingDescription = false;

    /**
     * @ORM\Column(name="description_mandatory", type="boolean", nullable=false)
     */
    private $descriptionMandatory = false;

    /**
     * @ORM\Column(name="using_summary", type="boolean", nullable=false)
     */
    private $usingSummary = false;

    /**
     * @ORM\Column(name="summary_mandatory", type="boolean", nullable=false)
     */
    private $summaryMandatory = false;

    /**
     * @ORM\Column(name="using_illustration", type="boolean", nullable=false)
     */
    private $usingIllustration = false;

    /**
     * @ORM\Column(name="illustration_mandatory", type="boolean", nullable=false)
     */
    private $illustrationMandatory = false;

    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->categories = new ArrayCollection();
        $this->districts = new ArrayCollection();
        $this->proposals = new ArrayCollection();

        $this->initializeNotificationConfiguration();
    }

    public function __clone()
    {
        if ($this->cloneEnable) {
            if ($this->id) {
                $this->id = null;
                $this->evaluationForm = $this->evaluationForm ? clone $this->evaluationForm : null;
                $this->step = null;
                $this->reference = null;
                $this->createdAt = new \DateTime();
                $this->updatedAt = null;
                $this->proposals = new ArrayCollection();

                $questionsClone = new ArrayCollection();
                foreach ($this->questions as $question) {
                    $itemClone = clone $question;
                    $itemClone->setProposalForm($this);
                    $questionsClone->add($itemClone);
                }

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
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New ProposalForm';
    }

    public function isCloneEnable(): bool
    {
        return $this->cloneEnable;
    }

    public function setCloneEnable(bool $value): self
    {
        $this->cloneEnable = $value;

        return $this;
    }

    public function initializeNotificationConfiguration()
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

    public function setDescription(string $description = null): self
    {
        $this->description = $description;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getSummaryHelpText()
    {
        return $this->summaryHelpText;
    }

    public function setSummaryHelpText(string $summaryHelpText = null): self
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
            ? $this->getQuestions()->map(
                function (
                    QuestionnaireAbstractQuestion $questionnaireAbstractQuestion
                ) {
                    return $questionnaireAbstractQuestion->getQuestion();
                }
            )
            : new ArrayCollection();
    }

    public function getQuestions(): Collection
    {
        return $this->questions;
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

    public function setStep(CollectStep $step = null): self
    {
        $this->step = $step;

        return $this;
    }

    public function canDisplay($user = null): bool
    {
        if ($this->getStep()) {
            return $this->getStep()->canDisplay($user);
        }

        // not linked to a project so we can display it
        return true;
    }

    public function canDisplayInBo($user = null): bool
    {
        if ($this->getStep()) {
            return $this->getStep()->canDisplayInBO($user);
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

    public function getTitleHelpText()
    {
        return $this->titleHelpText;
    }

    public function setTitleHelpText(string $titleHelpText = null): self
    {
        $this->titleHelpText = $titleHelpText;

        return $this;
    }

    public function getDescriptionHelpText()
    {
        return $this->descriptionHelpText;
    }

    public function setDescriptionHelpText(string $descriptionHelpText = null): self
    {
        $this->descriptionHelpText = $descriptionHelpText;

        return $this;
    }

    public function getThemeHelpText()
    {
        return $this->themeHelpText;
    }

    public function setThemeHelpText(string $themeHelpText = null): self
    {
        $this->themeHelpText = $themeHelpText;

        return $this;
    }

    public function getDistrictHelpText()
    {
        return $this->districtHelpText;
    }

    public function setDistrictHelpText(string $districtHelpText = null): self
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

    public function addDistrict(District $district): self
    {
        if (!$this->districts->contains($district)) {
            $this->districts->add($district);
            $district->setForm($this);
        }

        return $this;
    }

    public function removeDistrict(District $district): self
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

    public function getCategoryHelpText()
    {
        return $this->categoryHelpText;
    }

    public function setCategoryHelpText(string $categoryHelpText = null): self
    {
        $this->categoryHelpText = $categoryHelpText;

        return $this;
    }

    public function getLabelTitle(): string
    {
        $label = $this->getTitle();
        if ($this->getStep()) {
            $label = $this->getStep()->getTitle().' - '.$label;
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

    public function getAddressHelpText()
    {
        return $this->addressHelpText;
    }

    public function setAddressHelpText(string $addressHelpText = null): self
    {
        $this->addressHelpText = $addressHelpText;

        return $this;
    }

    public function getZoomMap()
    {
        return $this->zoomMap;
    }

    public function setZoomMap(int $zoomMap = null): self
    {
        $this->zoomMap = $zoomMap;

        return $this;
    }

    public function getLatMap()
    {
        return $this->latMap;
    }

    public function setLatMap(float $latMap = null): self
    {
        $this->latMap = $latMap;

        return $this;
    }

    public function getLngMap()
    {
        return $this->lngMap;
    }

    public function setLngMap(float $lngMap = null): self
    {
        $this->lngMap = $lngMap;

        return $this;
    }

    public function getIllustrationHelpText()
    {
        return $this->illustrationHelpText;
    }

    public function setIllustrationHelpText(string $illustrationHelpText = null): self
    {
        $this->illustrationHelpText = $illustrationHelpText;

        return $this;
    }

    public function getEvaluationForm(): ?Questionnaire
    {
        return $this->evaluationForm;
    }

    public function setEvaluationForm(Questionnaire $evaluationForm = null): self
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

    public function setIsProposal(bool $isProposal): self
    {
        $this->objectType =
            $isProposal === true
                ? ProposalFormObjectType::PROPOSAL
                : ProposalFormObjectType::QUESTION;

        return $this;
    }

    public function isProposal(): bool
    {
        return $this->objectType === ProposalFormObjectType::PROPOSAL;
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

    public function getUsingIllustration(): bool
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

    public function getSummaryMandatory(): bool
    {
        return $this->summaryMandatory;
    }

    public function setSummaryMandatory(bool $summaryMandatory): self
    {
        $this->summaryMandatory = $summaryMandatory;

        return $this;
    }

    public function getIllustrationMandatory(): bool
    {
        return $this->illustrationMandatory;
    }

    public function setIllustrationMandatory(bool $illustrationMandatory): self
    {
        $this->illustrationMandatory = $illustrationMandatory;

        return $this;
    }
}

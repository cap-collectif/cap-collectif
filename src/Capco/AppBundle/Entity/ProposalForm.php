<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * ProposalForm.
 *
 * @ORM\Table(name="proposal_form")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalFormRepository")
 */
class ProposalForm
{
    use IdTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description = null;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", inversedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $step;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="proposalForm")
     */
    private $proposals;

    /**
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
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private $titleHelpText;

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
     * @ORM\Column(name="using_themes", type="boolean")
     */
    private $usingThemes = false;

    /**
     * @ORM\Column(name="theme_mandatory", type="boolean")
     */
    private $themeMandatory = false;

    /**
     * @ORM\Column(name="using_categories", type="boolean")
     */
    private $usingCategories = false;

    /**
     * @ORM\Column(name="category_mandatory", type="boolean")
     */
    private $categoryMandatory = false;

    /**
     * @ORM\Column(name="district_mandatory", type="boolean")
     */
    private $districtMandatory = false;

    /**
     * @ORM\Column(name="using_district", type="boolean")
     */
    private $usingDistrict = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration", cascade={"persist", "remove"}, inversedBy="proposalForm")
     * @ORM\JoinColumn(name="notification_configuration_id", referencedColumnName="id", nullable=true)
     */
    private $notificationsConfiguration;

    /**
     * @ORM\Column(name="using_address", nullable=false, type="boolean")
     */
    private $usingAddress = false;

    /**
     * @ORM\Column(name="require_proposal_in_a_zone", nullable=false, type="boolean")
     */
    private $requireProposalInAZone = false;

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
     * Constructor.
     */
    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->categories = new ArrayCollection();
        $this->notificationsConfiguration = new ProposalFormNotificationConfiguration();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New ProposalForm';
    }

    /**
     * Set description.
     *
     * @param string $description
     *
     * @return ProposalForm
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description.
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return mixed
     */
    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * @param ArrayCollection $proposals
     *
     * @return $this
     */
    public function setProposals(ArrayCollection $proposals)
    {
        $this->proposals = $proposals;

        return $this;
    }

    /**
     * @return array
     */
    public function getRealQuestions()
    {
        $questions = [];
        foreach ($this->questions as $qaq) {
            $questions[] = $qaq->getQuestion();
        }

        return $questions;
    }

    /**
     * @return ArrayCollection
     */
    public function getQuestions()
    {
        return $this->questions;
    }

    /**
     * @param ArrayCollection $questions
     *
     * @return $this
     */
    public function setQuestions($questions)
    {
        foreach ($questions as $question) {
            $question->setProposalForm($this);
        }
        $this->questions = $questions;

        return $this;
    }

    /**
     * Add question.
     *
     * @param QuestionnaireAbstractQuestion $question
     *
     * @return $this
     */
    public function addQuestion(QuestionnaireAbstractQuestion $question)
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
        }
        $question->setProposalForm($this);

        return $this;
    }

    /**
     * Remove question.
     *
     * @param QuestionnaireAbstractQuestion $question
     *
     * @return $this
     */
    public function removeQuestion(QuestionnaireAbstractQuestion $question)
    {
        $this->questions->removeElement($question);
        $question->setProposalForm(null);

        return $this;
    }

    /**
     * @return CollectStep
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * @param CollectStep $step
     *
     * @return $this
     */
    public function setStep(CollectStep $step = null)
    {
        $this->step = $step;

        return $this;
    }

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->getStep()->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->getStep()->canContribute();
    }

    /**
     * @return string
     */
    public function getTitleHelpText()
    {
        return $this->titleHelpText;
    }

    /**
     * @param string $titleHelpText
     *
     * @return $this
     */
    public function setTitleHelpText($titleHelpText)
    {
        $this->titleHelpText = $titleHelpText;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescriptionHelpText()
    {
        return $this->descriptionHelpText;
    }

    /**
     * @param string $descriptionHelpText
     *
     * @return $this
     */
    public function setDescriptionHelpText($descriptionHelpText)
    {
        $this->descriptionHelpText = $descriptionHelpText;

        return $this;
    }

    /**
     * @return string
     */
    public function getThemeHelpText()
    {
        return $this->themeHelpText;
    }

    /**
     * @param string $themeHelpText
     *
     * @return $this
     */
    public function setThemeHelpText($themeHelpText)
    {
        $this->themeHelpText = $themeHelpText;

        return $this;
    }

    /**
     * @return string
     */
    public function getDistrictHelpText()
    {
        return $this->districtHelpText;
    }

    /**
     * @param string $districtHelpText
     *
     * @return $this
     */
    public function setDistrictHelpText($districtHelpText)
    {
        $this->districtHelpText = $districtHelpText;

        return $this;
    }

    public function getCategories()
    {
        return $this->categories;
    }

    public function addCategory(ProposalCategory $category)
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
            $category->setForm($this);
        }

        return $this;
    }

    public function removeCategory(ProposalCategory $category)
    {
        $this->categories->removeElement($category);

        return $this;
    }

    /**
     * @return bool
     */
    public function isUsingThemes()
    {
        return $this->usingThemes;
    }

    /**
     * @param bool $usingThemes
     *
     * @return $this
     */
    public function setUsingThemes($usingThemes)
    {
        $this->usingThemes = $usingThemes;

        return $this;
    }

    /**
     * @return bool
     */
    public function isThemeMandatory()
    {
        return $this->themeMandatory;
    }

    /**
     * @param bool $themeMandatory
     *
     * @return $this
     */
    public function setThemeMandatory($themeMandatory)
    {
        $this->themeMandatory = $themeMandatory;

        return $this;
    }

    public function isDistrictMandatory(): bool
    {
        return $this->districtMandatory;
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

    /**
     * @return bool
     */
    public function isUsingCategories()
    {
        return $this->usingCategories;
    }

    /**
     * @param bool $usingCategories
     *
     * @return $this
     */
    public function setUsingCategories($usingCategories)
    {
        $this->usingCategories = $usingCategories;

        return $this;
    }

    /**
     * @return bool
     */
    public function isCategoryMandatory()
    {
        return $this->categoryMandatory;
    }

    /**
     * @param bool $categoryMandatory
     *
     * @return $this
     */
    public function setCategoryMandatory($categoryMandatory)
    {
        $this->categoryMandatory = $categoryMandatory;

        return $this;
    }

    /**
     * @return string
     */
    public function getCategoryHelpText()
    {
        return $this->categoryHelpText;
    }

    /**
     * @param string $categoryHelpText
     *
     * @return $this
     */
    public function setCategoryHelpText($categoryHelpText)
    {
        $this->categoryHelpText = $categoryHelpText;

        return $this;
    }

    public function getLabelTitle()
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

    public function getNotificationsConfiguration()
    {
        return $this->notificationsConfiguration;
    }

    public function setNotificationsConfiguration(ProposalFormNotificationConfiguration $configuration): self
    {
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
}

<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Steps\CollectStep;
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
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text")
     */
    private $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\CollectStep", inversedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $step;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="proposalForm")
     */
    private $proposals;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="proposalForm", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $questions;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var string
     * @ORM\Column(name="title_help_text", type="string", length=255, nullable=true)
     */
    private $titleHelpText;

    /**
     * @var string
     * @ORM\Column(name="description_help_text", type="string", length=255, nullable=true)
     */
    private $descriptionHelpText;

    /**
     * @var string
     * @ORM\Column(name="theme_help_text", type="string", length=255, nullable=true)
     */
    private $themeHelpText;

    /**
     * @var string
     * @ORM\Column(name="district_help_text", type="string", length=255, nullable=true)
     */
    private $districtHelpText;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->getId()) {
            return $this->getTitle();
        }

        return 'New ProposalForm';
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
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
     * @return ArrayCollection
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
}

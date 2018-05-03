<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="questionnaire")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionnaireRepository")
 */
class Questionnaire
{
    use UuidTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\QuestionnaireStep", inversedBy="questionnaire", cascade={"persist"})
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $step;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reply", mappedBy="questionnaire")
     */
    private $replies;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="questionnaire", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $questions;

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
     * @var bool
     * @ORM\Column(name="multiple_replies_allowed", type="boolean", nullable=true)
     */
    private $multipleRepliesAllowed;

    /**
     * @var bool
     * @ORM\Column(name="anonymous_allowed", type="boolean", nullable=false)
     */
    private $anonymousAllowed = false;

    /**
     * @var bool
     * @ORM\Column(name="acknowledge_replies", type="boolean", nullable=false)
     */
    private $acknowledgeReplies = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="evaluationForm", cascade={"persist"})
     */
    private $proposalForm;

    /**
     * @var bool
     * @ORM\Column(name="phone_confirmation", type="boolean", nullable=false)
     */
    protected $phoneConfirmation = false;

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
        return $this->getId() ? $this->getTitle() : 'New Questionnaire';
    }

    /**
     * Set description.
     *
     * @param string $description
     *
     * @return Questionnaire
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

    public function isFullyPrivate(): bool
    {
        foreach ($this->getRealQuestions() as $question) {
            if (!$question->isPrivate()) {
                return false;
            }
        }

        return true;
    }

    public function getRealQuestions(): Collection
    {
        $questions = new ArrayCollection();
        foreach ($this->questions as $qaq) {
            $questions->add($qaq->getQuestion());
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
        $question->setQuestionnaire($this);

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
        $question->setQuestionnaire(null);

        return $this;
    }

    /**
     * Reset questions.
     *
     * @return $this
     */
    public function resetQuestions()
    {
        $this->questions = new ArrayCollection();

        return $this;
    }

    /**
     * @return QuestionnaireStep
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * @param QuestionnaireStep $step
     *
     * @return $this
     */
    public function setStep(QuestionnaireStep $step = null)
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
        return $this->getStep() && $this->getStep()->canContribute();
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

    /**
     * @return ArrayCollection
     */
    public function getReplies()
    {
        return $this->replies;
    }

    /**
     * @param ArrayCollection $replies
     *
     * @return $this
     */
    public function setReplies($replies)
    {
        $this->replies = $replies;

        return $this;
    }

    /**
     * Add reply.
     *
     * @param Reply $reply
     *
     * @return $this
     */
    public function addReply(Reply $reply)
    {
        if (!$this->replies->contains($reply)) {
            $this->replies->add($reply);
        }
        $reply->setQuestionnaire($this);

        return $this;
    }

    /**
     * Remove reply.
     *
     * @param Reply $reply
     *
     * @return $this
     */
    public function removeReply(Reply $reply)
    {
        $this->replies->removeElement($reply);
        $reply->setQuestionnaire(null);

        return $this;
    }

    /**
     * @return bool
     */
    public function isMultipleRepliesAllowed()
    {
        return $this->multipleRepliesAllowed;
    }

    /**
     * @param bool $multipleRepliesAllowed
     *
     * @return $this
     */
    public function setMultipleRepliesAllowed($multipleRepliesAllowed)
    {
        $this->multipleRepliesAllowed = $multipleRepliesAllowed;

        return $this;
    }

    public function isPhoneConfirmationRequired()
    {
        return $this->step && $this->step->isPhoneConfirmationRequired();
    }

    /**
     * @return bool
     */
    public function isAnonymousAllowed()
    {
        return $this->anonymousAllowed;
    }

    /**
     * @param bool $anonymousAllowed
     *
     * @return $this
     */
    public function setAnonymousAllowed($anonymousAllowed)
    {
        $this->anonymousAllowed = $anonymousAllowed;

        return $this;
    }

    /**
     * @return bool
     */
    public function isAcknowledgeReplies()
    {
        return $this->acknowledgeReplies;
    }

    /**
     * @param bool $acknowledgeReplies
     *
     * @return $this
     */
    public function setAcknowledgeReplies($acknowledgeReplies)
    {
        $this->acknowledgeReplies = $acknowledgeReplies;

        return $this;
    }

    public function getProposalForm()
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm): self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function isPhoneConfirmation(): bool
    {
        return $this->phoneConfirmation;
    }

    public function setPhoneConfirmation(bool $phoneConfirmation):self
    {
        $this->phoneConfirmation = $phoneConfirmation;

        return $this;
    }
}

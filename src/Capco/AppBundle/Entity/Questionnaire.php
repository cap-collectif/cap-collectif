<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Questionnaire.
 *
 * @ORM\Table(name="questionnaire")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionnaireRepository")
 */
class Questionnaire
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
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\QuestionnaireStep", inversedBy="questionnaire", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $step;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reply", mappedBy="questionnaire")
     */
    private $replies;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion", mappedBy="questionnaire", cascade={"persist", "remove"}, orphanRemoval=true)
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
     * @ORM\Column(name="modify_allowed", type="boolean", nullable=true)
     */
    private $modifyAllowed;

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

        return 'New Questionnaire';
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

    /**
     * @return bool
     */
    public function isModifyAllowed()
    {
        return $this->modifyAllowed;
    }

    /**
     * @param bool $modifyAllowed
     *
     * @return $this
     */
    public function setModifyAllowed($modifyAllowed)
    {
        $this->modifyAllowed = $modifyAllowed;

        return $this;
    }
}

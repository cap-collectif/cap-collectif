<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\QuestionChoice;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestionValidationRule;

/**
 * MultipleChoiceQuestion.
 *
 * @ORM\Table(name="multiple_choice_question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MultipleChoiceQuestionRepository")
 */
class MultipleChoiceQuestion extends AbstractQuestion
{
    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $questionChoices;

    /**
     * @var bool
     *
     * @ORM\Column(name="random_question_choices", type="boolean", nullable=false)
     */
    protected $randomQuestionChoices = false;

    /** @var bool
     * @ORM\Column(name="other_allowed", type="boolean", nullable=false)
     */
    protected $otherAllowed = false;

    /**
     * @var MultipleChoiceQuestionValidationRule
     * @ORM\Embedded(class="MultipleChoiceQuestionValidationRule", columnPrefix="validation_")
     */
    protected $validationRule;

    /**
     * @var bool
     * @ORM\Column(type="boolean", name="has_validation_rule")
     * Used to handle case where validationRule VO is null (meaning that all its fields are set to null)
     */
    protected $hasValidationRule = false;

    public static $questionTypesLabels = [
        self::QUESTION_TYPE_RADIO => 'question.types.radio',
        self::QUESTION_TYPE_SELECT => 'question.types.select',
        self::QUESTION_TYPE_CHECKBOX => 'question.types.checkbox',
        self::QUESTION_TYPE_RANKING => 'question.types.ranking',
    ];

    public function __construct()
    {
        $this->questionChoices = new ArrayCollection();
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_SIMPLE_TEXT]);
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_MULTILINE_TEXT]);
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_EDITOR]);
    }

    /**
     * @return ArrayCollection
     */
    public function getQuestionChoices()
    {
        return $this->questionChoices;
    }

    /**
     * @param ArrayCollection $questionChoices
     *
     * @return $this
     */
    public function setQuestionChoices($questionChoices)
    {
        $this->questionChoices = $questionChoices;

        return $this;
    }

    /**
     * Add questionChoice.
     *
     * @param QuestionChoice $questionChoice
     *
     * @return $this
     */
    public function addQuestionChoice(QuestionChoice $questionChoice)
    {
        if (!$this->questionChoices->contains($questionChoice)) {
            $this->questionChoices->add($questionChoice);
        }
        $questionChoice->setQuestion($this);

        return $this;
    }

    /**
     * Remove questionChoice.
     *
     * @param QuestionChoice $questionChoice
     *
     * @return $this
     */
    public function removeQuestionChoice(QuestionChoice $questionChoice)
    {
        $this->questionChoices->removeElement($questionChoice);
        $questionChoice->setQuestion(null);

        return $this;
    }

    /**
     * Reset questionChoice.
     *
     * @return $this
     */
    public function resetQuestionChoices()
    {
        $this->questionChoices = new ArrayCollection();

        return $this;
    }

    /**
     * @return bool
     */
    public function isMultipleChoiceQuestion()
    {
        return true;
    }

    /**
     * @return bool
     */
    public function isRandomQuestionChoices()
    {
        return $this->randomQuestionChoices;
    }

    /**
     * @param bool $randomQuestionChoices
     *
     * @return $this
     */
    public function setRandomQuestionChoices($randomQuestionChoices)
    {
        $this->randomQuestionChoices = $randomQuestionChoices;

        return $this;
    }

    /**
     * @return bool
     */
    public function isOtherAllowed()
    {
        return $this->otherAllowed;
    }

    /**
     * @param bool $otherAllowed
     *
     * @return $this
     */
    public function setOtherAllowed($otherAllowed)
    {
        $this->otherAllowed = $otherAllowed;

        return $this;
    }

    /**
     * @return MultipleChoiceQuestionValidationRule
     */
    public function getValidationRule()
    {
        return $this->hasValidationRule ? $this->validationRule : null;
    }

    /**
     * @param MultipleChoiceQuestionValidationRule $validationRule
     * @return $this
     */
    public function setValidationRule(MultipleChoiceQuestionValidationRule $validationRule = null)
    {
        if (!$validationRule || !$validationRule->getType() || !$validationRule->getNumber()) {
            $validationRule = null;
        }
        $this->validationRule = $validationRule;
        $this->hasValidationRule = $validationRule !== null;

        return $this;
    }
}

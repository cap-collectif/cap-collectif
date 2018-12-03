<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\QuestionChoice;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MultipleChoiceQuestionRepository")
 */
class MultipleChoiceQuestion extends AbstractQuestion
{
    public static $questionTypesLabels = [
        'question.types.button' => self::QUESTION_TYPE_BUTTON,
        'question.types.radio' => self::QUESTION_TYPE_RADIO,
        'question.types.select' => self::QUESTION_TYPE_SELECT,
        'question.types.checkbox' => self::QUESTION_TYPE_CHECKBOX,
        'question.types.ranking' => self::QUESTION_TYPE_RANKING,
    ];

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question", cascade={"remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $choices;

    /**
     * @ORM\Column(name="random_question_choices", type="boolean", nullable=false)
     */
    protected $randomQuestionChoices = false;

    /**
     * @ORM\Column(name="other_allowed", type="boolean", nullable=false)
     */
    protected $otherAllowed = false;

    /**
     * @ORM\Embedded(class="MultipleChoiceQuestionValidationRule", columnPrefix="validation_")
     */
    protected $validationRule;

    /**
     * @ORM\Column(type="boolean", name="has_validation_rule")
     * Used to handle case where validationRule VO is null (meaning that all its fields are set to null)
     */
    protected $hasValidationRule = false;

    public function __construct()
    {
        parent::__construct();
        $this->choices = new ArrayCollection();
    }

    public function getChoices(): Collection
    {
        return $this->choices instanceof Collection
            ? $this->choices
            : new ArrayCollection($this->choices);
    }

    public function setChoices(Collection $choices): self
    {
        foreach ($choices as $qc) {
            $qc->setQuestion($this);
        }
        $this->choices = $choices;

        return $this;
    }

    public function addQuestionChoice(QuestionChoice $questionChoice): self
    {
        if (!$this->getChoices()->contains($questionChoice)) {
            $this->getChoices()->add($questionChoice);
        }
        $questionChoice->setQuestion($this);

        return $this;
    }

    public function removeQuestionChoice(QuestionChoice $questionChoice): self
    {
        $this->getChoices()->removeElement($questionChoice);
        $questionChoice->setQuestion(null);

        return $this;
    }

    public function isMultipleChoiceQuestion(): bool
    {
        return true;
    }

    public function isRandomQuestionChoices(): bool
    {
        return $this->randomQuestionChoices;
    }

    public function setRandomQuestionChoices(bool $randomQuestionChoices): self
    {
        $this->randomQuestionChoices = $randomQuestionChoices;

        return $this;
    }

    public function isOtherAllowed(): bool
    {
        return $this->otherAllowed;
    }

    public function setOtherAllowed(bool $otherAllowed): self
    {
        $this->otherAllowed = $otherAllowed;

        return $this;
    }

    public function getValidationRule(): ?MultipleChoiceQuestionValidationRule
    {
        return $this->hasValidationRule ? $this->validationRule : null;
    }

    public function setValidationRule(
        MultipleChoiceQuestionValidationRule $validationRule = null
    ): self {
        if (!$validationRule || !$validationRule->getType() || !$validationRule->getNumber()) {
            $validationRule = null;
        }
        $this->validationRule = $validationRule;
        $this->hasValidationRule = null !== $validationRule;

        return $this;
    }
}

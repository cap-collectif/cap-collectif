<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\QuestionChoice;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="multiple_choice_question")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MultipleChoiceQuestionRepository")
 */
class MultipleChoiceQuestion extends AbstractQuestion
{
    public static $questionTypesLabels = [
        self::QUESTION_TYPE_BUTTON => 'question.types.button',
        self::QUESTION_TYPE_RADIO => 'question.types.radio',
        self::QUESTION_TYPE_SELECT => 'question.types.select',
        self::QUESTION_TYPE_CHECKBOX => 'question.types.checkbox',
        self::QUESTION_TYPE_RANKING => 'question.types.ranking',
    ];

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    protected $questionChoices;

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

    /**
     * @ORM\Column(type="text", name="description")
     */
    protected $description;

    public function __construct()
    {
        $this->questionChoices = new ArrayCollection();
        unset(
            self::$questionTypesInputs[self::QUESTION_TYPE_SIMPLE_TEXT],
            self::$questionTypesInputs[self::QUESTION_TYPE_MULTILINE_TEXT],
            self::$questionTypesInputs[self::QUESTION_TYPE_EDITOR],
            self::$questionTypesInputs[self::QUESTION_TYPE_MEDIAS]
        );
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description = null): self
    {
        $this->description = $description;

        return $this;
    }

    public function getQuestionChoices(): Collection
    {
        return $this->questionChoices;
    }

    public function setQuestionChoices(Collection $questionChoices): self
    {
        $this->questionChoices = $questionChoices;

        return $this;
    }

    public function addQuestionChoice(QuestionChoice $questionChoice): self
    {
        if (!$this->questionChoices->contains($questionChoice)) {
            $this->questionChoices->add($questionChoice);
        }
        $questionChoice->setQuestion($this);

        return $this;
    }

    public function removeQuestionChoice(QuestionChoice $questionChoice): self
    {
        $this->questionChoices->removeElement($questionChoice);
        $questionChoice->setQuestion(null);

        return $this;
    }

    public function resetQuestionChoices(): self
    {
        foreach ($this->questionChoices as $choice) {
            $choice->setQuestion(null);
        }
        $this->questionChoices = new ArrayCollection();

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

    public function getValidationRule(): ? MultipleChoiceQuestionValidationRule
    {
        return $this->hasValidationRule ? $this->validationRule : null;
    }

    public function setValidationRule(MultipleChoiceQuestionValidationRule $validationRule = null): self
    {
        if (!$validationRule || !$validationRule->getType() || !$validationRule->getNumber()) {
            $validationRule = null;
        }
        $this->validationRule = $validationRule;
        $this->hasValidationRule = null !== $validationRule;

        return $this;
    }
}

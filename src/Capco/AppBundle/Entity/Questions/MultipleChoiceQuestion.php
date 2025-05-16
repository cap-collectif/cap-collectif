<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MultipleChoiceQuestionRepository")
 */
class MultipleChoiceQuestion extends AbstractQuestion implements EntityInterface
{
    public static $questionTypesLabels = [
        'question.types.button' => self::QUESTION_TYPE_BUTTON,
        'question.types.radio' => self::QUESTION_TYPE_RADIO,
        'question.types.select' => self::QUESTION_TYPE_SELECT,
        'question.types.checkbox' => self::QUESTION_TYPE_CHECKBOX,
        'question.types.ranking' => self::QUESTION_TYPE_RANKING,
    ];

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\QuestionChoice", mappedBy="question", cascade={"remove", "persist"}, orphanRemoval=true, fetch="EAGER")
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

    /**
     * @ORM\Column(type="boolean", name="response_colors_disabled", nullable=false, options={"default":"0"})
     */
    protected bool $responseColorsDisabled = false;

    /**
     * @ORM\Column(type="boolean", name="grouped_responses_enabled", nullable=false, options={"default":"0"})
     */
    protected bool $groupedResponsesEnabled = false;

    public function __construct()
    {
        parent::__construct();
        $this->choices = new ArrayCollection();
    }

    public function __clone()
    {
        parent::__clone();
        $clonedChoices = new ArrayCollection();
        foreach ($this->choices as $choice) {
            $clonedChoice = clone $choice;
            $clonedChoice->setQuestion($this);
            $clonedChoices->add($clonedChoice);
        }
        $this->choices = $clonedChoices;
    }

    public function getChoices(): Collection
    {
        // This handle case when we are creating a Question
        // Symfony form doesn't call constructor.
        return $this->choices instanceof Collection
            ? $this->choices
            : new ArrayCollection($this->choices);
    }

    public function isChoiceValid(string $choiceToFind): bool
    {
        if ($this->getChoices()) {
            foreach ($this->getChoices() as $choice) {
                if ($choice->getTitle() === $choiceToFind) {
                    return true;
                }
            }
        }

        return false;
    }

    public function setChoices(Collection $choices): self
    {
        /** @var QuestionChoice $qc */
        foreach ($choices as $qc) {
            $qc->setQuestion($this);
        }
        $this->choices = $choices;

        return $this;
    }

    public function addChoice(QuestionChoice $questionChoice): self
    {
        if (!$this->getChoices()->contains($questionChoice)) {
            $this->getChoices()->add($questionChoice);
        }
        $questionChoice->setQuestion($this);

        return $this;
    }

    public function removeChoice(QuestionChoice $questionChoice): self
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
        ?MultipleChoiceQuestionValidationRule $validationRule = null
    ): self {
        if (!$validationRule || !$validationRule->getType() || !$validationRule->getNumber()) {
            $validationRule = null;
        }
        $this->validationRule = $validationRule;
        $this->hasValidationRule = null !== $validationRule;

        return $this;
    }

    public function isResponseColorsDisabled(): bool
    {
        return $this->responseColorsDisabled;
    }

    public function setResponseColorsDisabled(bool $responseColorsDisabled): self
    {
        $this->responseColorsDisabled = $responseColorsDisabled;

        return $this;
    }

    public function isGroupedResponsesEnabled(): bool
    {
        return $this->groupedResponsesEnabled;
    }

    public function setGroupedResponsesEnabled(bool $groupedResponsesEnabled): self
    {
        $this->groupedResponsesEnabled = $groupedResponsesEnabled;

        return $this;
    }
}

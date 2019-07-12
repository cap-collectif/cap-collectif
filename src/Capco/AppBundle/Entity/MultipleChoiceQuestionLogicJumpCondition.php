<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MultipleChoiceQuestionLogicJumpConditionRepository")
 */
class MultipleChoiceQuestionLogicJumpCondition extends AbstractLogicJumpCondition
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\QuestionChoice")
     */
    protected $value;

    public function getValue(): ?QuestionChoice
    {
        return $this->value;
    }

    public function setValue(?QuestionChoice $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getConditionType(): string
    {
        return 'multiple_choice';
    }
}

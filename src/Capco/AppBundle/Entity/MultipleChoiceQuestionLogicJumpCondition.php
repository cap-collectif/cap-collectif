<?php
namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Enum\LogicJumpConditionOperatorEnum;
use Capco\AppBundle\Traits\UuidTrait;
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

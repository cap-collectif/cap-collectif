<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="logic_jump_condition")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\AbstractLogicJumpConditionRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "condition_type", type = "string")
 * @ORM\DiscriminatorMap({
 *      "multiple_choice" = "MultipleChoiceQuestionLogicJumpCondition",
 * })
 */
abstract class AbstractLogicJumpCondition
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=10)
     */
    protected $operator;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $question;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\LogicJump", inversedBy="conditions")
     */
    protected $jump;

    public function getOperator(): ?string
    {
        return $this->operator;
    }

    public function setOperator(string $operator): self
    {
        $this->operator = $operator;

        return $this;
    }

    public function getQuestion(): ?MultipleChoiceQuestion
    {
        return $this->question;
    }

    public function setQuestion(?MultipleChoiceQuestion $question): self
    {
        $this->question = $question;

        return $this;
    }

    public function getJump(): ?LogicJump
    {
        return $this->jump;
    }

    public function setJump(?LogicJump $jump): self
    {
        $this->jump = $jump;

        return $this;
    }

    abstract public function getConditionType(): string;
}

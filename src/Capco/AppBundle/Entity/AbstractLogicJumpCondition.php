<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
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
abstract class AbstractLogicJumpCondition implements EntityInterface
{
    use PositionableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=10, nullable=false)
     */
    protected $operator;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\AbstractQuestion")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $question;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\LogicJump", inversedBy="conditions")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $jump;

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getOperator(): ?string
    {
        return $this->operator;
    }

    public function setOperator(?string $operator): self
    {
        $this->operator = $operator;

        return $this;
    }

    /**
     * I don't know why it's nullable, we should investigate this.
     */
    public function getQuestion(): ?AbstractQuestion
    {
        return $this->question;
    }

    public function setQuestion(AbstractQuestion $question): self
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

<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\AppBundle\Enum\MultipleChoiceQuestionValidationRules;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Embeddable
 *
 * Make all fields nullable is currently the only way to make the VO nullable
 */
final class MultipleChoiceQuestionValidationRule
{
    public static $typeLabels = [
        'questionnaire.validation.type.min' => MultipleChoiceQuestionValidationRules::MIN,
        'questionnaire.validation.type.equal' => MultipleChoiceQuestionValidationRules::EQUAL,
        'questionnaire.validation.type.max' => MultipleChoiceQuestionValidationRules::MAX
    ];

    /**
     * @ORM\Column(type="string", nullable=true)
     * @Assert\Choice(choices={"min", "max", "equal"})
     */
    private $type;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Assert\Range(min=1)
     */
    private $number;

    // Private constructor to ensure objects immutability
    private function __construct()
    {
    }

    public static function create(string $type = null, int $number = null): self
    {
        $rule = new self();
        $rule->type = $type;
        $rule->number = $number;

        return $rule;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function getNumber(): ?int
    {
        return $this->number;
    }
}

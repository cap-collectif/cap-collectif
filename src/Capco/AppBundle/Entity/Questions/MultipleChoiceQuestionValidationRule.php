<?php

namespace Capco\AppBundle\Entity\Questions;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * MultipleChoiceQuestionValidationRule
 *
 * @ORM\Embeddable
 *
 * Make all fields nullable is currently the only way to make the VO nullable
 */
final class MultipleChoiceQuestionValidationRule
{
    public static $typeLabels = [
        'min' => 'questionnaire.validation.type.min',
        'equal' => 'questionnaire.validation.type.equal',
        'max' => 'questionnaire.validation.type.max',
    ];

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     * @Assert\Choice(choices={"min", "max", "equal"})
     */
    private $type;

    /**
     * @var string
     * @ORM\Column(type="integer", nullable=true)
     * @Assert\Range(min=1)
     */
    private $number;

    // Private constructor to ensure objects immutability
    private function __construct() {}

    public static function create($type, $number)
    {
        $rule = new MultipleChoiceQuestionValidationRule();
        $rule->type = $type;
        $rule->number = $number;
        return $rule;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getNumber()
    {
        return $this->number;
    }
}

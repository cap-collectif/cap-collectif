<?php

namespace Capco\AppBundle\Entity\Questions;

use Doctrine\ORM\Mapping as ORM;

/**
 * MultipleChoiceQuestionValidationRule
 *
 * @ORM\Embeddable
 */
final class MultipleChoiceQuestionValidationRule
{
    /**
     * @var string
     * @ORM\Column(type="string", nullable=true)
     */
    private $type;

    /**
     * @var string
     * @ORM\Column(type="integer", nullable=true)
     */
    private $number;

    private function __construct() {}

    public static function create($type, $number)
    {
        $rule = new QuestionChoiceValidationRule();
        $rule->type = $type;
        $rule->number = $number;
        return $rule;
    }
}

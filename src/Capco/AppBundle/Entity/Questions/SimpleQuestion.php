<?php

namespace Capco\AppBundle\Entity\Questions;

use Doctrine\ORM\Mapping as ORM;

/**
 * SimpleQuestion.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SimpleQuestionRepository")
 */
class SimpleQuestion extends AbstractQuestion
{
    public static $questionTypesLabels = [
        self::QUESTION_TYPE_SIMPLE_TEXT => 'question.types.text',
        self::QUESTION_TYPE_MULTILINE_TEXT => 'question.types.textarea',
        self::QUESTION_TYPE_EDITOR => 'question.types.editor',
    ];

    public function __construct()
    {
        // Simple questions can't be of those types, we unset them
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_RADIO]);
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_SELECT]);
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_CHECKBOX]);
        unset(self::$questionTypesInputs[self::QUESTION_TYPE_MEDIAS]);
    }

    /**
     * @return bool
     */
    public function isSimpleQuestion()
    {
        return true;
    }
}

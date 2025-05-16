<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SimpleQuestionRepository")
 */
class SimpleQuestion extends AbstractQuestion implements EntityInterface
{
    public static $questionTypesLabels = [
        'question.types.text' => self::QUESTION_TYPE_SIMPLE_TEXT,
        'question.types.textarea' => self::QUESTION_TYPE_MULTILINE_TEXT,
        'question.types.editor' => self::QUESTION_TYPE_EDITOR,
    ];

    /**
     * @ORM\Column(name="is_range_between", type="boolean", nullable=false, options={"default": false})
     */
    protected bool $isRangeBetween = false;

    /**
     * @ORM\Column(name="range_min", type="integer", nullable=true)
     */
    protected ?int $rangeMin = null;

    /**
     * @ORM\Column(name="range_max", type="integer", nullable=true)
     */
    protected ?int $rangeMax = null;

    public function __construct()
    {
        parent::__construct();
        // Simple questions can't be of those types, we unset them
        unset(
            self::$questionTypesInputs[self::QUESTION_TYPE_RADIO],
            self::$questionTypesInputs[self::QUESTION_TYPE_SELECT],
            self::$questionTypesInputs[self::QUESTION_TYPE_CHECKBOX],
            self::$questionTypesInputs[self::QUESTION_TYPE_MEDIAS]
        );
    }

    public function isSimpleQuestion(): bool
    {
        return true;
    }

    public function isRangeBetween(): bool
    {
        return $this->isRangeBetween;
    }

    public function setIsRangeBetween(bool $isRangeBetween): self
    {
        $this->isRangeBetween = $isRangeBetween;

        return $this;
    }

    public function getRangeMin(): ?int
    {
        return $this->rangeMin;
    }

    public function setRangeMin(?int $rangeMin): self
    {
        $this->rangeMin = $rangeMin;

        return $this;
    }

    public function getRangeMax(): ?int
    {
        return $this->rangeMax;
    }

    public function setRangeMax(?int $rangeMax): self
    {
        $this->rangeMax = $rangeMax;

        return $this;
    }
}

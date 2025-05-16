<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class SectionQuestion extends AbstractQuestion implements EntityInterface
{
    /**
     * @var int
     * @ORM\Column(name="level", type="integer", nullable=false)
     */
    protected $level;

    public function __construct()
    {
        parent::__construct();
        $this->type = self::QUESTION_TYPE_SECTION;
    }

    public function getLevel(): int
    {
        if (!$this->level) {
            return 0;
        }

        return $this->level;
    }

    public function setLevel(int $level): self
    {
        $this->level = $level;

        return $this;
    }
}

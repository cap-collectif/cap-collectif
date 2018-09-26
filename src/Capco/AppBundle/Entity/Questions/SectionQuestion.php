<?php

namespace Capco\AppBundle\Entity\Questions;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 */
class SectionQuestion extends AbstractQuestion
{
    public function __construct()
    {
        $this->type = self::QUESTION_TYPE_SECTION;
    }
}

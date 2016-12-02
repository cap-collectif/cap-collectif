<?php

namespace Capco\AppBundle\Entity\Questions;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MediaQuestionRepository")
 */
class MediaQuestion extends AbstractQuestion
{
    public function __construct()
    {
        $this->type = 7;
    }

    public function isMediaQuestion(): bool
    {
        return true;
    }
}

<?php

namespace Capco\AppBundle\Entity\Questions;

use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MediaQuestionRepository")
 */
class MediaQuestion extends AbstractQuestion implements EntityInterface
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::QUESTION_TYPE_MEDIAS;
    }

    public function isMediaQuestion(): bool
    {
        return true;
    }
}

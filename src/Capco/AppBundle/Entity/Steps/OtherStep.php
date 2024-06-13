<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Traits\TimelessStepTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class OtherStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OtherStepRepository")
 */
class OtherStep extends AbstractStep
{
    use TimelessStepTrait;

    public const TYPE = 'other';

    public function getType()
    {
        return self::TYPE;
    }

    public function isOtherStep(): bool
    {
        return true;
    }
}

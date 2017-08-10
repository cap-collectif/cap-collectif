<?php

namespace Capco\AppBundle\Entity\Steps;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class OtherStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OtherStepRepository")
 */
class OtherStep extends AbstractStep
{
    public function getType()
    {
        return 'other';
    }

    public function isOtherStep(): bool
    {
        return true;
    }
}

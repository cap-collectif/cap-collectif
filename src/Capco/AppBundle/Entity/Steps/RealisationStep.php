<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Status;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\RealisationStepRepository")
 */
class RealisationStep extends AbstractStep
{
    public function getType() : string
    {
        return 'realisation';
    }

    public function isRealisationStep() : bool
    {
        return true;
    }
}

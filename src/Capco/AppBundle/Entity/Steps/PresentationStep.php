<?php

namespace Capco\AppBundle\Entity\Steps;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class PresentationStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PresentationStepRepository")
 */
class PresentationStep extends AbstractStep
{
    public const TYPE = 'presentation';

    public function getType()
    {
        return self::TYPE;
    }

    public function isPresentationStep(): bool
    {
        return true;
    }
}

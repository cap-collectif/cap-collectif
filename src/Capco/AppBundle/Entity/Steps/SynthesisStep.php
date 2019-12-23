<?php

namespace Capco\AppBundle\Entity\Steps;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class SynthesisStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SynthesisStepRepository")
 */
class SynthesisStep extends AbstractStep
{
    public const TYPE = 'synthesis';

    /**
     * @var
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Synthesis\Synthesis", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="synthesis_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $synthesis = null;

    /**
     * @return mixed
     */
    public function getSynthesis()
    {
        return $this->synthesis;
    }

    /**
     * @param mixed $synthesis
     */
    public function setSynthesis($synthesis)
    {
        $this->synthesis = $synthesis;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return self::TYPE;
    }

    public function isSynthesisStep(): bool
    {
        return true;
    }
}

<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Status;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * Class RealisationStep.
 *
 * @ORM\Table(name="collect_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\RealisationStepRepository")
 * @Serializer\ExclusionPolicy("all")
 */
class RealisationStep extends AbstractStep
{
    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\Column(name="default_status_id", nullable=true)
     */
    private $defaultStatus = null;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @return mixed
     */
    public function getDefaultStatus()
    {
        return $this->defaultStatus;
    }

    public function setDefaultStatus(Status $defaultStatus = null) : self
    {
        $this->defaultStatus = $defaultStatus;

        return $this;
    }

    public function getType() : string
    {
        return 'realisation';
    }
}

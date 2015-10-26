<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use Capco\AppBundle\Entity\ProposalForm;

/**
 * Class CollectStep.
 *
 * @ORM\Table(name="collect_step")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CollectStepRepository")
 * @Serializer\ExclusionPolicy("all")
 */
class CollectStep extends AbstractStep
{

    /**
     * @var
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="step", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $proposalForm;


    public function __construct()
    {
        parent::__construct();
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'collect';
    }

    public function isCollectStep()
    {
        return true;
    }

    /**
     * @return ArrayCollection
     */
    public function getProposalForm()
    {
        return $this->proposalForm;
    }

}

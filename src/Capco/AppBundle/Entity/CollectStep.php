<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
use Doctrine\Common\Collections\ArrayCollection;

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
     * @var ProposalForm
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="steps", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="proposal_form_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $proposalForm;

    /**
     * @var ArrayCollection
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Status")
     * @ORM\JoinTable(
     *     name="collect_step_statuses",
     *     joinColumns={@ORM\JoinColumn(name="collect_step_id", referencedColumnName="id")},
     *     inverseJoinColumns={@ORM\JoinColumn(name="status_id", referencedColumnName="id")}
     * )
     **/
    private $statuses;


    public function __construct()
    {
        parent::__construct();
        $this->statuses = new ArrayCollection();
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

    /**
     * @param ProposalForm $proposalForm
     * @return ArrayCollection
     */
    public function setProposalForm(ProposalForm $proposalForm)
    {
        $this->proposalForm = $proposalForm;
        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getStatuses()
    {
        return $this->statuses;
    }

}

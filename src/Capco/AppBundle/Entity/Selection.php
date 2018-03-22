<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SelectionRepository")
 * @ORM\Table(name="selection")
 * @ORM\HasLifecycleCallbacks
 * @CapcoAssert\StatusBelongsToSelectionStep()
 */
class Selection
{
    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Steps\SelectionStep", inversedBy="selections", cascade={"persist"})
     * @ORM\JoinColumn(name="selection_step_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     **/
    protected $selectionStep;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="selections", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     **/
    protected $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Status", cascade={"persist"})
     * @ORM\JoinColumn(name="status_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    protected $status;

    public function getId() // for elasticsearch
    {
        return [
          'selectionStep' => $this->selectionStep->getId(),
          'proposal' => $this->proposal->getId(),
       ];
    }

    public function getStep(): SelectionStep
    {
        return $this->selectionStep;
    }

    public function getSelectionStep()
    {
        return $this->selectionStep;
    }

    public function setSelectionStep(SelectionStep $selectionStep): self
    {
        $this->selectionStep = $selectionStep;

        return $this;
    }

    /**
     * @return null|Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function setStatus(Status $status = null)
    {
        $this->status = $status;

        return $this;
    }

    // ********************* Lifecycle ***************************************

    /**
     * @ORM\PreRemove
     */
    public function preRemove()
    {
        if ($this->getProposal()) {
            $this->getProposal()->removeSelection($this);
        }
    }
}

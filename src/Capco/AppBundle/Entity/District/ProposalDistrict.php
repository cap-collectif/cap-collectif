<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Proposal;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalDistrictRepository")
 */
class ProposalDistrict extends AbstractDistrict implements IndexableInterface
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="districts")
     * @ORM\JoinColumn(name="form_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $form;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Proposal",
     *  mappedBy="district"
     *  )
     */
    private $proposals;

    public function __construct()
    {
        parent::__construct();
        $this->proposals = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getForm()
    {
        return $this->form;
    }

    public function setForm(ProposalForm $form): self
    {
        $this->form = $form;

        return $this;
    }

    public function getProposals()
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }
}

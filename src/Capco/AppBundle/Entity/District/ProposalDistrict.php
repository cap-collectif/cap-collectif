<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Traits\TranslatableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalDistrictRepository")
 */
class ProposalDistrict extends AbstractDistrict
{
    use TranslatableTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", inversedBy="districts")
     * @ORM\JoinColumn(name="form_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?ProposalForm $form = null;

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
            foreach ($this->translations as $translation) {
                $clonedTranslation = clone $translation;
                $this->addTranslation($clonedTranslation);
            }
        }
    }

    public function getForm(): ProposalForm
    {
        return $this->form;
    }

    public function setForm(ProposalForm $form): self
    {
        $this->form = $form;

        return $this;
    }

    public function getProposals(): ArrayCollection
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

    public static function getTranslationEntityClass(): string
    {
        return DistrictTranslation::class;
    }
}

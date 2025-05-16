<?php

namespace Capco\AppBundle\Entity;

use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="proposal_social_networks")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSocialNetworksRepository")
 */
class ProposalSocialNetworks extends AbstractSocialNetworks implements EntityInterface
{
    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="proposalSocialNetworks")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Proposal $proposal;

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }
}

<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Entity\AbstractSocialNetworks;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="organization_social_networks")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSocialNetworksRepository")
 */
class OrganizationSocialNetworks extends AbstractSocialNetworks implements EntityInterface
{
    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization", inversedBy="organizationSocialNetworks")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Organization $organization;

    public function getOrganization(): Organization
    {
        return $this->organization;
    }

    public function setOrganization(Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }
}

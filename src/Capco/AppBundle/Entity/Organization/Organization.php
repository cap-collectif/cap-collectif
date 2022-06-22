<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(
 *     name="organization"
 * )*
 * @ORM\Entity(repositoryClass=OrganizationRepository::class)
 */
class Organization
{
    use SluggableTitleTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="text", nullable=true, name="body")
     */
    private ?string $body;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="logo_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $logo;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="banner_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $banner;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Organization\OrganizationSocialNetworks", mappedBy="organization", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private ?OrganizationSocialNetworks $organizationSocialNetworks;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Organization\OrganizationMember", mappedBy="organization", cascade={"persist"}, orphanRemoval=true)
     */
    private $members;

    public function __construct()
    {
        $this->members = new ArrayCollection();
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body): self
    {
        $this->body = $body;

        return $this;
    }

    public function getOrganizationSocialNetworks(): ?OrganizationSocialNetworks
    {
        return $this->organizationSocialNetworks;
    }

    public function setOrganizationSocialNetworks(
        ?OrganizationSocialNetworks $organizationSocialNetworks
    ): void {
        $this->organizationSocialNetworks = $organizationSocialNetworks;
    }

    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function setMembers(Collection $members): self
    {
        $this->members = $members;

        return $this;
    }

    public function addMember(OrganizationMember $member): self
    {
        if (!$this->members->contains($member)) {
            $this->members[] = $member;
        }

        return $this;
    }

    public function removeMember(OrganizationMember $member): self
    {
        $this->members->removeElement($member);

        return $this;
    }

    public function countMembers()
    {
        return $this->members->count();
    }

    public function hasMembers(): bool
    {
        return !$this->members->isEmpty();
    }

    public function getLogo(): ?Media
    {
        return $this->logo;
    }

    public function setLogo(?Media $logo): self
    {
        $this->logo = $logo;

        return $this;
    }

    public function getBanner(): ?Media
    {
        return $this->banner;
    }

    public function setBanner(?Media $banner): self
    {
        $this->banner = $banner;

        return $this;
    }

    public function getWebPageUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getWebPageUrl()
            : null;
    }

    public function getTwitterUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getTwitterUrl()
            : null;
    }

    public function getFacebookUrl(): ?string
    {
        return $this->organizationSocialNetworks
            ? $this->organizationSocialNetworks->getFacebookUrl()
            : null;
    }
}

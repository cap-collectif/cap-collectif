<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Repository\Organization\OrganizationMemberRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;

/**
 * @ORM\Table(name="organization_member",
 *   uniqueConstraints={
 *      @UniqueConstraint(name="member_unique_organization",columns={"user_id", "organization_id"}),
 *    }
 *  )
 * @ORM\Entity(repositoryClass=OrganizationMemberRepository::class)
 */
class OrganizationMember
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization", inversedBy="members")
     * @ORM\JoinColumn(name="organization_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private Organization $organization;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="memberOfOrganizations")
     * @ORM\JoinColumn(name="user_id", nullable=false, referencedColumnName="id", onDelete="CASCADE")
     */
    private User $user;

    /**
     * @ORM\Column(name="role", type="enum_organization_member_role_type", nullable=false, options={"default" = "user"})
     */
    private string $role = OrganizationMemberRoleType::USER;

    public function setOrganization(?Organization $organization = null): self
    {
        $this->organization = $organization;
        $this->organization->addMember($this);

        return $this;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        $user->addMemberOfOrganization($this);

        return $this;
    }

    public function getOrganization(): Organization
    {
        return $this->organization;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): void
    {
        $this->role = $role;
    }
}

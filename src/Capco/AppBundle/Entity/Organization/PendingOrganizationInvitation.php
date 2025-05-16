<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Entity\Interfaces\DateTime\Expirable;
use Capco\AppBundle\Entity\Interfaces\Invitation;
use Capco\AppBundle\Traits\DateTime\ExpirableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="pending_organization_invitation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="token_unique",
 *      columns={"token"}
 *    )
 * })
 * @CapcoAssert\PendingOrganizationInvitation
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository")
 */
class PendingOrganizationInvitation implements EntityInterface, Expirable, Invitation
{
    use ExpirableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", nullable=true, referencedColumnName="id")
     */
    protected ?User $user = null;

    /**
     * @ORM\Column(type="string", nullable=true, name="email")
     */
    protected ?string $email = null;

    /**
     * @ORM\Column(type="string", nullable=false, name="token")
     */
    protected string $token;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization")
     * @ORM\JoinColumn(name="organization_id", nullable=false, referencedColumnName="id")
     */
    protected Organization $organization;

    /**
     * @ORM\Column(name="role", type="enum_organization_member_role_type", nullable=false, options={"default" = "user"})
     */
    protected string $role;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="creator_id", nullable=false, referencedColumnName="id")
     */
    protected User $creator;

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getOrganization(): Organization
    {
        return $this->organization;
    }

    public function setOrganization(Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): self
    {
        $this->role = $role;

        return $this;
    }

    public function getCreator(): User
    {
        return $this->creator;
    }

    public function setCreator(User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    public function getInvitationEmail(): string
    {
        return $this->getEmail() ?? $this->getUser()->getEmail();
    }

    public static function create(
        Organization $organization,
        string $role,
        string $token,
        User $creator
    ): self {
        $now = new \DateTime();

        return (new self())
            ->setOrganization($organization)
            ->setRole($role)
            ->setToken($token)
            ->setCreatedAt($now)
            ->setExpiresAt($now->modify(Expirable::EXPIRES_AT_PERIOD))
            ->setCreator($creator)
        ;
    }

    public static function makeInvitation(
        Organization $organization,
        string $role,
        string $token,
        User $creator,
        ?User $user,
        ?string $email
    ): self {
        return static::create($organization, $role, $token, $creator)
            ->setUser($user)
            ->setEmail($email)
        ;
    }
}

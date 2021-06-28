<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UserInviteRepository::class)
 * @ORM\EntityListeners({"Capco\AppBundle\EventListener\UserInviteListener"})
 * @ORM\Table(name="user_invite")
 */
class UserInvite
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255, unique=true)
     */
    private string $email;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $token;

    /**
     * @ORM\Column(name="expires_at", type="datetime")
     */
    private \DateTimeInterface $expiresAt;

    /**
     * @ORM\Column(name="is_admin", type="boolean")
     */
    private bool $isAdmin;

    /**
     * @ORM\Column(name="is_project_admin", type="boolean", options={"default": false})
     */
    private bool $isProjectAdmin = false;

    /**
     * @ORM\ManyToMany(targetEntity=Group::class, inversedBy="userInvites")
     * @ORM\JoinTable(name="user_invite_groups",
     *  joinColumns={@ORM\JoinColumn(name="user_invite_id", referencedColumnName="id", onDelete="CASCADE")},
     *  inverseJoinColumns={@ORM\JoinColumn(name="group_id", referencedColumnName="id", onDelete="CASCADE")}
     * )
     */
    private $groups;

    public function __construct()
    {
        $this->groups = new ArrayCollection();
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeInterface $expiresAt): self
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function isAdmin(): ?bool
    {
        return $this->isAdmin;
    }

    public function setIsAdmin(bool $isAdmin): self
    {
        $this->isAdmin = $isAdmin;

        return $this;
    }

    public function isProjectAdmin(): ?bool
    {
        return $this->isProjectAdmin;
    }

    public function setIsProjectAdmin(bool $isProjectAdmin): self
    {
        $this->isProjectAdmin = $isProjectAdmin;

        return $this;
    }

    public function hasExpired(): bool
    {
        return $this->expiresAt < new \DateTimeImmutable();
    }

    /**
     * @return Collection|Group[]
     */
    public function getGroups(): Collection
    {
        return $this->groups;
    }

    public function addGroup(Group $group): self
    {
        if (!$this->groups->contains($group)) {
            $this->groups[] = $group;
        }

        return $this;
    }

    public function removeGroup(Group $group): self
    {
        $this->groups->removeElement($group);

        return $this;
    }

    public function setGroups(ArrayCollection $groups): self
    {
        $this->groups = $groups;

        return $this;
    }
}

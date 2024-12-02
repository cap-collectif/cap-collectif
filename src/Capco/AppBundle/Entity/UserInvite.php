<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DateTime\Expirable;
use Capco\AppBundle\Entity\Interfaces\Invitation;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Traits\DateTime\ExpirableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=UserInviteRepository::class)
 * @ORM\Table(name="user_invite")
 */
class UserInvite implements Expirable, Invitation
{
    use ExpirableTrait;
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

    /**
     * @ORM\Column(type="string", length=500 ,nullable=true, name="message")
     */
    private ?string $message = null;

    /**
     * @ORM\Column(type="string", length=255, nullable=true, name="redirection_url")
     */
    private ?string $redirectionUrl = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\UserInviteEmailMessage", mappedBy="invitation", cascade={"persist"})
     */
    private Collection $emailMessages;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization")
     * @ORM\JoinColumn(name="organization_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?Organization $organization = null;

    public function __construct()
    {
        $this->groups = new ArrayCollection();
        $this->emailMessages = new ArrayCollection();
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

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): self
    {
        $this->message = $message;

        return $this;
    }

    public function getRedirectionUrl(): ?string
    {
        return $this->redirectionUrl;
    }

    public function setRedirectionUrl(?string $redirectionUrl): self
    {
        $this->redirectionUrl = $redirectionUrl;

        return $this;
    }

    public function getEmailMessages(): Collection
    {
        return $this->emailMessages;
    }

    public function getRelaunchCount(): int
    {
        // We do not count the first email message as its count for
        // the first message sent when the invitation is created
        return $this->getEmailMessages()->count() - 1;
    }

    public function addEmailMessage(UserInviteEmailMessage $emailMessage): self
    {
        if (!$this->emailMessages->contains($emailMessage)) {
            $this->emailMessages->add($emailMessage);
        }

        return $this;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    public function getInvitationEmail(): string
    {
        return $this->getEmail();
    }

    public static function invite(
        string $email,
        bool $isAdmin,
        bool $isProjectAdmin,
        string $token,
        ?string $message = null,
        ?string $redirectionUrl = null
    ): self {
        return (new self())
            ->setEmail($email)
            ->setIsAdmin($isAdmin)
            ->setIsProjectAdmin($isProjectAdmin)
            ->setToken($token)
            ->setMessage($message)
            ->setRedirectionUrl($redirectionUrl)
            ->setExpiresAt((new \DateTimeImmutable())->modify(Expirable::EXPIRES_AT_PERIOD))
        ;
    }
}

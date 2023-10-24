<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="participant")
 * @ORM\Entity(repositoryClass=ParticipantRepository::class)
 */
class Participant
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $email = null;

    /**
     * @ORM\Column(name="lastname", type="string", length=255, nullable=true)
     */
    private ?string $lastName = null;

    /**
     * @ORM\Column(name="firstname", type="string", length=255, nullable=true)
     */
    private ?string $firstName = null;

    /**
     * @ORM\Column(name="phone", type="string", length=255, nullable=true)
     */
    private ?string $phone = null;

    /**
     * @ORM\Column(name="address", type="string", length=255, nullable=true)
     */
    private ?string $address = null;

    /**
     * @ORM\Column(name="zip_code", type="string", length=255, nullable=true)
     */
    private ?string $zipCode = null;

    /**
     * @ORM\Column(name="date_of_birth", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $dateOfBirth = null;

    /**
     * @ORM\Column(name="identification_code", type="string", length=255, nullable=true)
     */
    private ?string $identificationCode = null;

    /**
     * @ORM\Column(name="phone_confirmed", type="boolean")
     */
    private bool $phoneConfirmed = false;

    /**
     * @ORM\Column(name="token", type="string", length=255)
     */
    private string $token;

    /**
     * @ORM\OneToMany(targetEntity=Reply::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $replies;

    /**
     * @ORM\OneToMany(targetEntity=Proposal::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $proposals;

    /**
     * @ORM\OneToMany(targetEntity=AbstractVote::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $votes;

    /**
     * @ORM\OneToOne(targetEntity=User::class, mappedBy="participant", cascade={"persist"})
     */
    private ?User $user = null;

    public function __construct()
    {
        $this->replies = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->votes = new ArrayCollection();
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

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): self
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): self
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): self
    {
        $this->address = $address;

        return $this;
    }

    public function getZipCode(): ?string
    {
        return $this->zipCode;
    }

    public function setZipCode(?string $zipCode): self
    {
        $this->zipCode = $zipCode;

        return $this;
    }

    public function getDateOfBirth(): ?\DateTimeInterface
    {
        return $this->dateOfBirth;
    }

    public function setDateOfBirth(?\DateTimeInterface $dateOfBirth): self
    {
        $this->dateOfBirth = $dateOfBirth;

        return $this;
    }

    public function getIdentificationCode(): ?string
    {
        return $this->identificationCode;
    }

    public function setIdentificationCode(?string $identificationCode): self
    {
        $this->identificationCode = $identificationCode;

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

    /**
     * @return Collection<int, Reply>
     */
    public function getReplies(): Collection
    {
        return $this->replies;
    }

    public function addReply(Reply $reply): self
    {
        if (!$this->replies->contains($reply)) {
            $this->replies[] = $reply;
            $reply->setParticipant($this);
        }

        return $this;
    }

    public function removeReply(Reply $reply): self
    {
        if ($this->replies->removeElement($reply) && $reply->getParticipant() === $this) {
            $reply->setParticipant(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, Proposal>
     */
    public function getProposals(): Collection
    {
        return $this->proposals;
    }

    public function addProposal(Proposal $proposal): self
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
            $proposal->setParticipant($this);
        }

        return $this;
    }

    public function removeProposal(Proposal $proposal): self
    {
        if ($this->proposals->removeElement($proposal) && $proposal->getParticipant() === $this) {
            $proposal->setParticipant(null);
        }

        return $this;
    }

    /**
     * @return Collection<int, AbstractVote>
     */
    public function getVotes(): Collection
    {
        return $this->votes;
    }

    public function addVote(AbstractVote $vote): self
    {
        if (!$this->votes->contains($vote)) {
            $this->votes[] = $vote;
            $vote->setParticipant($this);
        }

        return $this;
    }

    public function removeVote(AbstractVote $vote): self
    {
        if ($this->votes->removeElement($vote) && $vote->getParticipant() === $this) {
            $vote->setParticipant(null);
        }

        return $this;
    }

    public function isPhoneConfirmed(): bool
    {
        return $this->phoneConfirmed;
    }

    public function setPhoneConfirmed(bool $phoneConfirmed): self
    {
        $this->phoneConfirmed = $phoneConfirmed;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }
}

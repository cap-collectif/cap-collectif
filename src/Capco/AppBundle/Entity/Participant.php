<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Traits\ContributorTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="participant")
 * @ORM\Entity(repositoryClass=ParticipantRepository::class)
 */
class Participant implements EntityInterface, ContributorInterface
{
    use ContributorTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $email = null;

    /**
     * @ORM\Column(name="token", type="string", length=255)
     */
    private string $token;

    private ?string $locale = null;

    /**
     * @ORM\OneToMany(targetEntity=Reply::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $replies;

    /**
     * @ORM\OneToMany(targetEntity=ProposalSelectionVote::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $votes;

    /**
     * @ORM\OneToOne(targetEntity=User::class, inversedBy="participant", cascade={"persist"})
     */
    private ?User $user = null;

    /**
     * @ORM\OneToOne(targetEntity=UserIdentificationCode::class)
     * @ORM\JoinColumn(name="user_identification_code", referencedColumnName="identification_code", onDelete="SET NULL")
     */
    private ?UserIdentificationCode $userIdentificationCode = null;

    /**
     * @ORM\OneToMany(targetEntity=MediatorParticipantStep::class, mappedBy="participant", orphanRemoval=true)
     */
    private Collection $mediatorParticipantSteps;

    public function __construct()
    {
        $this->replies = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->mediatorParticipantSteps = new ArrayCollection();
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail($email): self
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
     * @return Collection<int, ProposalSelectionVote>
     */
    public function getVotes(): Collection
    {
        return $this->votes;
    }

    public function addVote(ProposalSelectionVote $vote): self
    {
        if (!$this->votes->contains($vote)) {
            $this->votes[] = $vote;
            $vote->setParticipant($this);
        }

        return $this;
    }

    public function removeVote(ProposalSelectionVote $vote): self
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

    public function getUserIdentificationCode(): ?UserIdentificationCode
    {
        return $this->userIdentificationCode;
    }

    public function setUserIdentificationCode(?UserIdentificationCode $userIdentificationCode): self
    {
        $this->userIdentificationCode = $userIdentificationCode;

        return $this;
    }

    public function getUserIdentificationCodeValue(): ?string
    {
        return $this->userIdentificationCode
            ? $this->userIdentificationCode->getIdentificationCode()
            : null;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    public function setLocale(?string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function getShowName(): ?string
    {
        return $this->getFirstname();
    }

    /**
     * @return Collection<int, MediatorParticipantStep>
     */
    public function getMediatorParticipantSteps(): Collection
    {
        return $this->mediatorParticipantSteps;
    }

    public function addMediatorParticipantStep(MediatorParticipantStep $mediatorParticipantStep): self
    {
        if (!$this->mediatorParticipantSteps->contains($mediatorParticipantStep)) {
            $this->mediatorParticipantSteps[] = $mediatorParticipantStep;
            $mediatorParticipantStep->setParticipant($this);
        }

        return $this;
    }

    public function removeMediatorParticipantStep(MediatorParticipantStep $mediatorParticipantStep): self
    {
        if ($this->mediatorParticipantSteps->removeElement($mediatorParticipantStep)) {
            // set the owning side to null (unless already changed)
            if ($mediatorParticipantStep->getParticipant() === $this) {
                $mediatorParticipantStep->setParticipant(null);
            }
        }

        return $this;
    }
}

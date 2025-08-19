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
class Participant implements EntityInterface, ContributorInterface, \Stringable
{
    use ContributorTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="zip_code", type="string", length=10, nullable=true)
     */
    protected ?string $zipCode = null;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $email = null;

    /**
     * @ORM\Column(name="email_confirmation_sent_at", type="datetime", nullable=true)
     */
    private ?\DateTime $emailConfirmationSentAt = null;

    /**
     * @ORM\Column(name="new_email_to_confirm", type="string", length=255, nullable=true)
     */
    private ?string $newEmailToConfirm = null;

    /**
     * @ORM\Column(name="new_email_confirmation_token", type="string", length=255, nullable=true)
     */
    private ?string $newEmailConfirmationToken = null;

    /**
     * @ORM\Column(name="confirmation_token", type="string", length=255, nullable=true)
     */
    private ?string $confirmationToken = null;

    /**
     * @ORM\Column(name="token", type="string", length=255)
     */
    private string $token;

    /**
     * @ORM\Column(name="username", type="string", length=255, nullable=true)
     */
    private ?string $username = null;

    /**
     * @ORM\OneToMany(targetEntity=Reply::class, mappedBy="participant", cascade={"persist"})
     */
    private Collection $replies;

    /**
     * @var Collection<int, AbstractVote>
     * @ORM\OneToMany(targetEntity=AbstractVote::class, mappedBy="participant", cascade={"persist", "remove"})
     */
    private Collection $votes;

    /**
     * @var Collection<int, ParticipantPhoneVerificationSms>
     * @ORM\OneToMany(targetEntity=ParticipantPhoneVerificationSms::class, mappedBy="participant")
     */
    private Collection $participantPhoneVerificationSms;

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

    /**
     * @ORM\Column(name="consent_sms_communication", type="boolean", options={"default" : 0})
     */
    private bool $consentSmsCommunication = false;

    /**
     * @ORM\Column(name="consent_internal_communication", type="boolean", options={"default" : 0})
     */
    private bool $consentInternalCommunication = false;

    /**
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\Column(name="consent_privacy_policy", type="boolean", options={"default" : 0})
     */
    private bool $consentPrivacyPolicy = false;

    /**
     * @ORM\Column(name="last_contributed_at", type="datetime", nullable=true)
     */
    private ?\Datetime $lastContributedAt = null;

    /**
     * @ORM\OneToMany (targetEntity=EmailingCampaignUser::class, mappedBy="participant")
     */
    private Collection $emailingCampaignUsers;

    public function __construct()
    {
        $this->replies = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->participantPhoneVerificationSms = new ArrayCollection();
        $this->mediatorParticipantSteps = new ArrayCollection();
    }

    public function __toString(): string
    {
        return (string) $this->id;
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

    public function getEmailConfirmationSentAt(): ?\DateTime
    {
        return $this->emailConfirmationSentAt;
    }

    public function setEmailConfirmationSentAt(?\DateTime $emailConfirmationSentAt): void
    {
        $this->emailConfirmationSentAt = $emailConfirmationSentAt;
    }

    public function getNewEmailToConfirm(): ?string
    {
        return $this->newEmailToConfirm;
    }

    public function setNewEmailToConfirm(?string $newEmailToConfirm): self
    {
        $this->newEmailToConfirm = $newEmailToConfirm;

        return $this;
    }

    public function getNewEmailConfirmationToken(): ?string
    {
        return $this->newEmailConfirmationToken;
    }

    public function setNewEmailConfirmationToken(?string $newEmailConfirmationToken): self
    {
        $this->newEmailConfirmationToken = $newEmailConfirmationToken;

        return $this;
    }

    public function isEmailConfirmed(): bool
    {
        return null === $this->confirmationToken;
    }

    public function getConfirmationToken(): ?string
    {
        return $this->confirmationToken;
    }

    public function setConfirmationToken(?string $confirmationToken): self
    {
        $this->confirmationToken = $confirmationToken;

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
        return $this->userIdentificationCode?->getIdentificationCode();
    }

    public function getShowName(): ?string
    {
        return $this->firstname;
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

    /**
     * @return Collection<int, ParticipantPhoneVerificationSms>
     */
    public function getParticipantPhoneVerificationSms(): Collection
    {
        return $this->participantPhoneVerificationSms;
    }

    public function addParticipantPhoneVerificationSms(ParticipantPhoneVerificationSms $participantPhoneVerificationSms): self
    {
        if (!$this->participantPhoneVerificationSms->contains($participantPhoneVerificationSms)) {
            $this->participantPhoneVerificationSms[] = $participantPhoneVerificationSms;
            $participantPhoneVerificationSms->setParticipant($this);
        }

        return $this;
    }

    public function removeParticipantPhoneVerificationSms(ParticipantPhoneVerificationSms $participantPhoneVerificationSms): self
    {
        if ($this->participantPhoneVerificationSms->removeElement($participantPhoneVerificationSms)) {
            // set the owning side to null (unless already changed)
            if ($participantPhoneVerificationSms->getParticipant() === $this) {
                $participantPhoneVerificationSms->setParticipant(null);
            }
        }

        return $this;
    }

    public function setUsername(?string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getConsentSmsCommunication(): bool
    {
        return $this->consentSmsCommunication;
    }

    public function setConsentSmsCommunication(bool $consentSmsCommunication): self
    {
        $this->consentSmsCommunication = $consentSmsCommunication;

        return $this;
    }

    public function isConsentInternalCommunication(): bool
    {
        return $this->consentInternalCommunication;
    }

    public function setConsentInternalCommunication(?bool $consentInternalCommunication): self
    {
        $this->consentInternalCommunication = $consentInternalCommunication;

        return $this;
    }

    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function isConsentPrivacyPolicy(): bool
    {
        return $this->consentPrivacyPolicy;
    }

    public function setConsentPrivacyPolicy(bool $consentPrivacyPolicy): self
    {
        $this->consentPrivacyPolicy = $consentPrivacyPolicy;

        return $this;
    }

    public function getEmailingCampaignUsers(): Collection
    {
        return $this->emailingCampaignUsers;
    }

    public function addEmailingCampaignUser(EmailingCampaignUser $emailingCampaignUser): self
    {
        if (!$this->emailingCampaignUsers->contains($emailingCampaignUser)) {
            $this->emailingCampaignUsers[] = $emailingCampaignUser;
            $emailingCampaignUser->setParticipant($this);
        }

        return $this;
    }

    public function removeEmailingCampaignUser(EmailingCampaignUser $emailingCampaignUser): self
    {
        if ($this->emailingCampaignUsers->removeElement($emailingCampaignUser)) {
            // set the owning side to null (unless already changed)
            if ($emailingCampaignUser->getParticipant() === $this) {
                $emailingCampaignUser->setParticipant(null);
            }
        }

        return $this;
    }

    public function getLastContributedAt(): ?\Datetime
    {
        return $this->lastContributedAt;
    }

    public function setLastContributedAt(?\Datetime $lastContributedAt): self
    {
        $this->lastContributedAt = $lastContributedAt;

        return $this;
    }

    public function getMedia(): ?Media
    {
        // will be fixed when rebasing parcours dépôt
        return null;
    }
}

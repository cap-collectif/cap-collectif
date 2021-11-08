<?php

namespace Capco\UserBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\UserIdentificationCode;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSupervisor;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Traits\User\UserAddressTrait;
use Capco\AppBundle\Traits\User\UserSSOTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Sonata\UserBundle\Entity\BaseUser;
use Sonata\UserBundle\Model\UserInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\UserInterface as RealUserInterface;
use Doctrine\ORM\Mapping as ORM;

class User extends BaseUser implements ProjectOwner, EquatableInterface, IndexableInterface
{
    use UserAddressTrait;
    use UserSSOTrait;

    public const GENDER_OTHER = 'o';
    protected const SORT_ORDER_CREATED_AT = 0;
    protected const SORT_ORDER_CONTRIBUTIONS_COUNT = 1;

    public static $sortOrder = [
        'activity' => self::SORT_ORDER_CONTRIBUTIONS_COUNT,
        'date' => self::SORT_ORDER_CREATED_AT,
    ];
    public static $sortOrderLabels = [
        'activity' => 'user.index.sort.activity',
        'date' => 'opinion.sort.last',
    ];

    // Hack for ParticipantEdge
    public $registeredEvent;

    protected $id;
    protected ?string $slug = null;

    //personal
    protected $gender;
    protected ?Media $media = null;
    protected ?string $birthPlace = null;

    //participations
    protected Collection $opinions;
    protected Collection $opinionVersions;
    protected Collection $comments;
    protected Collection $arguments;
    protected Collection $debateArguments;
    protected Collection $votes;
    protected Collection $sources;
    protected Collection $proposals;
    protected Collection $replies;

    //counters
    protected int $opinionVersionsCount = 0;
    protected int $argumentVotesCount = 0;
    protected int $proposalVotesCount = 0;
    protected int $opinionVersionVotesCount = 0;
    protected int $sourceVotesCount = 0;

    //account rights
    protected bool $locked = false;
    protected ?UserType $userType = null;
    protected bool $vip = false;

    //account security
    protected ?string $newEmailToConfirm = null;
    protected ?string $newEmailConfirmationToken = null;
    protected ?\DateTime $emailConfirmationSentAt = null;
    protected bool $phoneConfirmed = false;
    protected ?string $smsConfirmationCode = null;
    protected ?\DateTime $smsConfirmationSentAt = null;
    protected ?\DateTime $confirmedAccountAt = null;
    protected ?\DateTime $deletedAccountAt = null;
    protected bool $remindedAccountConfirmationAfter1Hour = false;

    //notifications
    protected Collection $followingContributions;
    protected UserNotificationsConfiguration $notificationsConfiguration;
    protected bool $consentExternalCommunication = false;
    protected bool $consentInternalCommunication = false;
    protected bool $subscribedToProposalNews = false;

    protected Collection $archives;
    protected Collection $responses;
    protected bool $profilePageIndexed = false;
    protected ?string $websiteUrl = null;
    private Collection $userGroups;
    private ?string $resetPasswordToken = null;
    private ?UserIdentificationCode $userIdentificationCode = null;
    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\ProposalSupervisor", mappedBy="supervisor")
     */
    private Collection $supervisedProposals;

    public function __construct()
    {
        parent::__construct();
        $this->roles = ['ROLE_USER'];
        $this->opinions = new ArrayCollection();
        $this->opinionVersions = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->debateArguments = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->sources = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->replies = new ArrayCollection();
        $this->userGroups = new ArrayCollection();
        $this->followingContributions = new ArrayCollection();
        $this->notificationsConfiguration = new UserNotificationsConfiguration();
        $this->archives = new ArrayCollection();
        $this->supervisedProposals = new ArrayCollection();
    }

    public function hydrate(array $data): self
    {
        foreach ($data as $key => $value) {
            $setter = 'set' . ucfirst($key);
            if ('id' === $key) {
                $this->id = $value;

                continue;
            }

            if (method_exists($this, $setter) && null !== $value) {
                $this->{$setter}($value);
            }
        }

        return $this;
    }

    public function clearLastLogin(): void
    {
        $this->lastLogin = null;
    }

    // used as a lifecycleCallback
    public function sanitizePhoneNumber(): void
    {
        if ($this->phone) {
            $this->phone = '+' . preg_replace('/\D/', '', $this->phone);
        }
    }

    // http://symfony.com/doc/2.8/security/entity_provider.html#understanding-serialize-and-how-a-user-is-saved-in-the-session
    // We check the account is not deleted in case of the user has multiple accounts sessions and just deleted his account
    public function isEqualTo(RealUserInterface $user): bool
    {
        return $user instanceof self &&
            $this->id === $user->getId() &&
            null === $user->getDeletedAccountAt();
    }

    public function addResponse(AbstractResponse $response): self
    {
        if (!$this->responses->contains($response)) {
            $this->responses[] = $response;
            $response->setUser($this);
        }

        return $this;
    }

    public function removeResponse(AbstractResponse $response): self
    {
        $this->responses->removeElement($response);

        return $this;
    }

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function getResponsesArray(): iterable
    {
        return $this->responses->toArray();
    }

    public function setResponses(Collection $responses): self
    {
        $this->responses = $responses;
        foreach ($responses as $response) {
            $response->setUser($this);
        }

        return $this;
    }

    public function isLocked(): bool
    {
        return $this->locked;
    }

    public function setLocked(bool $value): self
    {
        $this->locked = $value;

        return $this;
    }

    public function getNewEmailToConfirm(): ?string
    {
        return $this->newEmailToConfirm;
    }

    public function setNewEmailToConfirm(?string $email = null): self
    {
        $this->newEmailToConfirm = $email;

        return $this;
    }

    public function getNewEmailConfirmationToken(): ?string
    {
        return $this->newEmailConfirmationToken;
    }

    public function setNewEmailConfirmationToken(?string $token = null): self
    {
        $this->newEmailConfirmationToken = $token;

        return $this;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(?string $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public function getWebsiteUrl(): ?string
    {
        return $this->websiteUrl;
    }

    public function setWebsiteUrl(?string $websiteUrl): self
    {
        $this->websiteUrl = $websiteUrl;

        return $this;
    }

    public function setMedia(?Media $media = null): self
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function getOpinions(): Collection
    {
        return $this->opinions;
    }

    public function getOpinionVersions(): Collection
    {
        return $this->opinionVersions;
    }

    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function getArguments(): Collection
    {
        return $this->arguments;
    }

    public function getDebateArguments(): Collection
    {
        return $this->debateArguments;
    }

    public function getVotes(): Collection
    {
        return $this->votes;
    }

    public function getSources(): Collection
    {
        return $this->sources;
    }

    public function getProposals(): Collection
    {
        return $this->proposals;
    }

    public function getReplies(): Collection
    {
        return $this->replies;
    }

    public function getOpinionVersionsCount(): int
    {
        return $this->opinionVersionsCount;
    }

    public function setOpinionVersionsCount(int $opinionVersionsCount): void
    {
        $this->opinionVersionsCount = $opinionVersionsCount;
    }

    public function getProposalVotesCount(): int
    {
        return $this->proposalVotesCount;
    }

    public function setProposalVotesCount(int $proposalVotesCount): self
    {
        $this->proposalVotesCount = $proposalVotesCount;

        return $this;
    }

    public function getOpinionVersionVotesCount(): int
    {
        return $this->opinionVersionVotesCount;
    }

    public function setOpinionVersionVotesCount(int $opinionVersionVotesCount): void
    {
        $this->opinionVersionVotesCount = $opinionVersionVotesCount;
    }

    public function getSourceVotesCount(): int
    {
        return $this->sourceVotesCount;
    }

    public function setSourceVotesCount(int $sourceVotesCount): void
    {
        $this->sourceVotesCount = $sourceVotesCount;
    }

    public function getArgumentVotesCount(): int
    {
        return $this->argumentVotesCount;
    }

    public function setArgumentVotesCount(int $argumentVotesCount): void
    {
        $this->argumentVotesCount = $argumentVotesCount;
    }

    public function setVotes(Collection $votes): self
    {
        $this->votes = $votes;

        return $this;
    }

    public function setProposals(Collection $proposals): self
    {
        $this->proposals = $proposals;

        return $this;
    }

    public function setOpinions(Collection $opinions): self
    {
        $this->opinions = $opinions;

        return $this;
    }

    public function setOpinionVersions(Collection $versions): self
    {
        $this->opinionVersions = $versions;

        return $this;
    }

    public function setComments(Collection $comments): self
    {
        $this->comments = $comments;

        return $this;
    }

    public function setArguments(Collection $arguments): self
    {
        $this->arguments = $arguments;

        return $this;
    }

    public function setDebateArguments(Collection $debateArguments): self
    {
        $this->debateArguments = $debateArguments;

        return $this;
    }

    public function setSources(Collection $sources): self
    {
        $this->sources = $sources;

        return $this;
    }

    public function setReplies(Collection $replies): self
    {
        $this->replies = $replies;

        return $this;
    }

    public function getUserType(): ?UserType
    {
        return $this->userType;
    }

    public function setUserType(?UserType $userType = null): self
    {
        $this->userType = $userType;

        return $this;
    }

    public function isVip(): bool
    {
        return $this->vip;
    }

    public function setVip(bool $vip): self
    {
        $this->vip = $vip;

        return $this;
    }

    public function getEmailConfirmationSentAt(): ?\DateTime
    {
        return $this->emailConfirmationSentAt;
    }

    public function setEmailConfirmationSentAt(?\DateTime $date = null): self
    {
        $this->emailConfirmationSentAt = $date;

        return $this;
    }

    public function getDeletedAccountAt(): ?\DateTime
    {
        return $this->deletedAccountAt;
    }

    public function setDeletedAccountAt(\DateTime $date): self
    {
        $this->deletedAccountAt = $date;

        return $this;
    }

    public function getConfirmedAccountAt(): ?\DateTime
    {
        return $this->confirmedAccountAt;
    }

    public function setConfirmedAccountAt(?\DateTime $confirmedAccountAt = null): self
    {
        $this->confirmedAccountAt = $confirmedAccountAt;

        return $this;
    }

    public function getSmsConfirmationSentAt(): ?\DateTime
    {
        return $this->smsConfirmationSentAt;
    }

    public function setSmsConfirmationSentAt(?\DateTime $date = null): self
    {
        $this->smsConfirmationSentAt = $date;

        return $this;
    }

    public function getSmsConfirmationCode(): ?string
    {
        return $this->smsConfirmationCode;
    }

    public function setSmsConfirmationCode(?string $code = null): self
    {
        $this->smsConfirmationCode = $code;

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

    public function getSupervisedProposals(): iterable
    {
        return $this->supervisedProposals->map(static function (ProposalSupervisor $supervisor) {
            return $supervisor->getProposal();
        });
    }

    public function getAllowedProposalAsDecisionMaker(): iterable
    {
        return $this->proposals->map(static function (Proposal $proposal) {
            return $proposal->getProposalDecisionMaker();
        });
    }

    public function addSupervisedProposal(ProposalSupervisor $proposalSupervisor): self
    {
        if (!$this->supervisedProposals->contains($proposalSupervisor)) {
            $this->supervisedProposals[] = $proposalSupervisor;
            $proposalSupervisor->setAssignedBy($this);
        }

        return $this;
    }

    public function removeProposalSupervisor(ProposalSupervisor $proposalSupervisor): self
    {
        if ($this->supervisedProposals->contains($proposalSupervisor)) {
            $this->supervisedProposals->removeElement($proposalSupervisor);
            // set the owning side to null (unless already changed)
            if ($proposalSupervisor->getAssignedBy() === $this) {
                $proposalSupervisor->setAssignedBy(null);
            }
        }

        return $this;
    }

    public function clearProposalSupervised(): self
    {
        foreach ($this->getSupervisedProposals() as $supervisedProposal) {
            $this->removeProposalSupervisor($supervisedProposal);
        }

        return $this;
    }

    // ************************* Custom methods *********************************

    public function isEmailConfirmed(): bool
    {
        return null === $this->confirmationToken;
    }

    public function getFullname(): string
    {
        return sprintf('%s %s', $this->getFirstname(), $this->getLastname());
    }

    public static function getGenderList(): array
    {
        return [
            UserInterface::GENDER_FEMALE => 'gender.female',
            UserInterface::GENDER_MALE => 'gender.male',
            self::GENDER_OTHER => 'gender.other',
        ];
    }

    public function getContributions(): array
    {
        $types = [
            $this->getOpinions(),
            $this->getOpinionVersions(),
            $this->getVotes(),
            $this->getComments(),
            $this->getArguments(),
            $this->getDebateArguments(),
            $this->getSources(),
            $this->getProposals(),
            $this->getReplies(),
        ];

        $contributions = [];
        foreach ($types as $type) {
            foreach ($type as $contribution) {
                $contributions[] = $contribution;
            }
        }

        return $contributions;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    // ********************* Methods for synthesis tool **************************

    public function getUniqueIdentifier(): string
    {
        return $this->slug;
    }

    public function getDisplayName(): string
    {
        return $this->username ?: 'Utilisateur sans nom';
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(UserRole::ROLE_SUPER_ADMIN);
    }

    public function isProjectAdmin(): bool
    {
        return $this->hasRole(UserRole::ROLE_PROJECT_ADMIN) || $this->isAdmin();
    }

    /**
     * Tell if user has role admin or super admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ROLE_ADMIN) || $this->hasRole(UserRole::ROLE_SUPER_ADMIN);
    }

    public function isOnlyProjectAdmin(): bool
    {
        return $this->isProjectAdmin() && !$this->isAdmin();
    }

    public function isOnlyUser(): bool
    {
        return !$this->isProjectAdmin();
    }

    public function isEvaluerOnLegacyTool(): bool
    {
        foreach ($this->userGroups as $userGroup) {
            if ($userGroup->getGroup()->isEvaluating()) {
                return true;
            }
        }

        return false;
    }

    public function isProfilePageIndexed(): bool
    {
        return $this->profilePageIndexed;
    }

    public function setProfilePageIndexed(bool $profilePageIndexed): void
    {
        $this->profilePageIndexed = $profilePageIndexed;
    }

    public function getNotificationsConfiguration(): UserNotificationsConfiguration
    {
        return $this->notificationsConfiguration;
    }

    public function setNotificationsConfiguration(
        UserNotificationsConfiguration $notificationsConfiguration
    ): self {
        $this->notificationsConfiguration = $notificationsConfiguration;

        return $this;
    }

    public function getSubscribedToProposalNews(): bool
    {
        return $this->subscribedToProposalNews;
    }

    public function isSubscribedToProposalNews(): bool
    {
        return $this->subscribedToProposalNews;
    }

    public function setSubscribedToProposalNews(bool $subscribedToProposalNews): self
    {
        $this->subscribedToProposalNews = $subscribedToProposalNews;

        return $this;
    }

    public function isConsentExternalCommunication(): bool
    {
        return $this->consentExternalCommunication;
    }

    public function setConsentExternalCommunication(bool $consentExternalCommunication): self
    {
        $this->consentExternalCommunication = $consentExternalCommunication;

        return $this;
    }

    public function isConsentInternalCommunication(): bool
    {
        return $this->consentInternalCommunication;
    }

    public function setConsentInternalCommunication(bool $consentInternalCommunication): self
    {
        $this->consentInternalCommunication = $consentInternalCommunication;

        return $this;
    }

    public function getUserGroups(): Collection
    {
        return $this->userGroups;
    }

    /**
     * https://github.com/cap-collectif/platform/pull/5877#discussion_r213009730.
     */
    public function getUserGroupIds(): array
    {
        $userGroups = $this->getUserGroups()->toArray();
        $userGroupsId = [];

        foreach ($userGroups as $userGroup) {
            $userGroupsId[] = $userGroup->getGroup()->getId();
        }

        return $userGroupsId;
    }

    public function setUserGroups(Collection $userGroups): self
    {
        $this->userGroups = $userGroups;

        return $this;
    }

    public function addUserGroup(UserGroup $userGroup): self
    {
        if (!$this->userGroups->contains($userGroup)) {
            $this->userGroups->add($userGroup);
        }

        return $this;
    }

    public function removeUserGroup(UserGroup $userGroup): self
    {
        $this->userGroups->removeElement($userGroup);

        return $this;
    }

    public function getFollowingContributions(): Collection
    {
        return $this->followingContributions;
    }

    public function addFollowingContribution(Follower $followingContribution): self
    {
        if (!$this->followingContributions->contains($followingContribution)) {
            $this->followingContributions->add($followingContribution);
        }

        return $this;
    }

    public function removeFollowingContribution(Follower $followingContribution): self
    {
        $this->followingContributions->removeElement($followingContribution);

        return $this;
    }

    public function setFollowingContributions(Collection $followingContributions): self
    {
        $this->followingContributions = $followingContributions;

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 100;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'user';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }

    public function addArchive(UserArchive $archive): self
    {
        if (!$this->archives->contains($archive)) {
            $this->archives->add($archive);
        }

        $archive->setUser($this);

        return $this;
    }

    public function getArchives(): Collection
    {
        return $this->archives;
    }

    public function setArchives(Collection $archives): self
    {
        $this->archives = $archives;

        return $this;
    }

    public function removeArchive(UserArchive $archive): self
    {
        $this->archives->removeElement($archive);

        return $this;
    }

    public function getRemindedAccountConfirmationAfter1Hour(): bool
    {
        return $this->remindedAccountConfirmationAfter1Hour;
    }

    public function setRemindedAccountConfirmationAfter1Hour(
        bool $remindedAccountConfirmationAfter1Hour
    ): self {
        $this->remindedAccountConfirmationAfter1Hour = $remindedAccountConfirmationAfter1Hour;

        return $this;
    }

    /**
     * We overide sonata's BaseUser hook.
     *
     * Hook on pre-persist operations.
     */
    public function prePersist(): void
    {
        if (!$this->createdAt) {
            $this->createdAt = new \DateTime();
        }
    }

    public function setResetPasswordToken(?string $token): self
    {
        $this->resetPasswordToken = $token;

        return $this;
    }

    public function getResetPasswordToken(): ?string
    {
        return $this->resetPasswordToken;
    }

    public function getBirthPlace(): ?string
    {
        return $this->birthPlace;
    }

    public function setBirthPlace(?string $birthPlace): self
    {
        $this->birthPlace = $birthPlace;

        return $this;
    }

    public function hasPassword(): bool
    {
        return null !== $this->password;
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
}

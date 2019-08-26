<?php

namespace Capco\UserBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Synthesis\SynthesisUserInterface;
use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\FranceConnect\FranceConnectUserTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use FOS\UserBundle\Util\Canonicalizer;
use Sonata\UserBundle\Entity\BaseUser;
use Sonata\UserBundle\Model\UserInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\UserInterface as RealUserInterface;

class User extends BaseUser implements
    SynthesisUserInterface,
    EquatableInterface,
    IndexableInterface
{
    use FranceConnectUserTrait;

    public const GENDER_OTHER = 'o';
    protected const SORT_ORDER_CREATED_AT = 0;
    protected const SORT_ORDER_CONTRIBUTIONS_COUNT = 1;

    public static $sortOrder = [
        'activity' => self::SORT_ORDER_CONTRIBUTIONS_COUNT,
        'date' => self::SORT_ORDER_CREATED_AT
    ];
    public static $sortOrderLabels = [
        'activity' => 'user.index.sort.activity',
        'date' => 'user.index.sort.date'
    ];

    // Hack for ParticipantEdge
    public $registeredEvent;

    protected $samlId;
    protected $parisId;
    protected $openId;
    protected $openIdAccessToken;
    protected $id;

    protected $locked = false;

    protected $gender;

    protected $facebook_id;

    protected $facebook_access_token;

    protected $facebookUrl;

    protected $websiteUrl;

    protected $google_id;

    protected $google_access_token;

    protected $linkedInUrl;

    protected $credentialsExpireAt;
    protected $credentialsExpired = false;

    protected $twitter_id;

    protected $twitter_access_token;

    protected $twitterUrl;

    protected $media;

    protected $address;

    protected $address2;

    protected $zipCode;

    protected $neighborhood;

    protected $city;

    protected $opinions;

    protected $opinionVersions;

    protected $comments;

    protected $arguments;

    protected $votes;

    protected $sources;

    protected $proposals;

    protected $replies;

    /**
     * @var int
     */
    protected $argumentsCount = 0;

    /**
     * @var int
     */
    protected $opinionVersionsCount = 0;

    // Votes

    /**
     * @var int
     */
    protected $argumentVotesCount = 0;

    /**
     * @var int
     */
    protected $proposalVotesCount = 0;

    /**
     * @var int
     */
    protected $opinionVotesCount = 0;

    /**
     * @var int
     */
    protected $opinionVersionVotesCount = 0;

    /**
     * @var int
     */
    protected $sourceVotesCount = 0;

    protected $userType;

    protected $vip = false;

    protected $newEmailToConfirm;
    protected $newEmailConfirmationToken;

    protected $emailConfirmationSentAt;

    protected $deletedAccountAt;

    protected $smsConfirmationSentAt;
    protected $smsConfirmationCode;
    protected $phoneConfirmed = false;

    protected $remindedAccountConfirmationAfter24Hours = false;

    protected $followingContributions;

    protected $notificationsConfiguration;

    protected $archives;

    /**
     * @var string
     */
    private $slug;

    private $responses;

    private $profilePageIndexed = true;

    private $consentExternalCommunication = false;
    private $consentInternalCommunication = false;

    private $userGroups;

    private $resetPasswordToken;

    public function __construct()
    {
        parent::__construct();
        $this->roles = ['ROLE_USER'];
        $this->opinions = new ArrayCollection();
        $this->opinionVersions = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->sources = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->replies = new ArrayCollection();
        $this->userGroups = new ArrayCollection();
        $this->followingContributions = new ArrayCollection();
        $this->notificationsConfiguration = new UserNotificationsConfiguration();
        $this->archives = new ArrayCollection();
    }

    public function hydrate(array $data)
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

    public function setSamlAttributes(string $idp, array $attributes)
    {
        if ($this->getId()) {
            return;
        }

        if ('oda' === $idp) {
            $this->setUsername($attributes['oda_prenom'][0] . ' ' . $attributes['oda_nom'][0]);
        }
        if ('daher' === $idp) {
            $this->setUsername(
                $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
            );
            $this->setEmail(
                $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
            );
            $this->setEmailCanonical(
                (new Canonicalizer())->canonicalize(
                    $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
                )
            );
        }
        if ('afd-interne' === $idp) {
            $this->setUsername($attributes['cn'][0]);
            $this->setEmail($attributes['mail'][0]);
            $this->setEmailCanonical((new Canonicalizer())->canonicalize($attributes['mail'][0]));
        }

        if ('pole-emploi' === $idp) {
            $this->setUsername($attributes['cn'][0]);
            $this->setEmail($attributes['mail'][0]);
            $this->setEmailCanonical((new Canonicalizer())->canonicalize($attributes['mail'][0]));
        }
    }

    public function setSamlId(string $samlId): self
    {
        $this->samlId = $samlId;

        return $this;
    }

    public function clearLastLogin()
    {
        $this->lastLogin = null;
    }

    public function getSamlId()
    {
        return $this->samlId;
    }

    public function setParisId(string $parisId): self
    {
        $this->parisId = $parisId;

        return $this;
    }

    public function getParisId(): ?string
    {
        return $this->parisId;
    }

    public function setOpenId(?string $openId): self
    {
        $this->openId = $openId;

        return $this;
    }

    public function getOpenId(): ?string
    {
        return $this->openId;
    }

    public function setOpenIdAccessToken(string $accessToken): self
    {
        $this->openIdAccessToken = $accessToken;

        return $this;
    }

    public function getOpenIdAccessToken(): ?string
    {
        return $this->openIdAccessToken;
    }

    // used as a lifecycleCallback
    public function sanitizePhoneNumber()
    {
        if ($this->phone) {
            $this->phone = '+' . preg_replace('/\D/', '', $this->phone);
        }
    }

    // http://symfony.com/doc/2.8/security/entity_provider.html#understanding-serialize-and-how-a-user-is-saved-in-the-session
    // We check the account is not deleted in case of the user has multiple accounts sessions and just deleted his account
    public function isEqualTo(RealUserInterface $user)
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

    public function getNewEmailToConfirm()
    {
        return $this->newEmailToConfirm;
    }

    public function setNewEmailToConfirm(string $email = null): self
    {
        $this->newEmailToConfirm = $email;

        return $this;
    }

    public function getNewEmailConfirmationToken(): ?string
    {
        return $this->newEmailConfirmationToken;
    }

    public function setNewEmailConfirmationToken(string $token = null): self
    {
        $this->newEmailConfirmationToken = $token;

        return $this;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * @return int
     */
    public function getGoogleId()
    {
        return $this->google_id;
    }

    /**
     * @param int $google_id
     */
    public function setGoogleId($google_id)
    {
        $this->google_id = $google_id;
    }

    /**
     * @return int
     */
    public function getFacebookAccessToken()
    {
        return $this->facebook_access_token;
    }

    /**
     * @param int $facebook_access_token
     */
    public function setFacebookAccessToken($facebook_access_token)
    {
        $this->facebook_access_token = $facebook_access_token;
    }

    /**
     * @return int
     */
    public function getFacebookId()
    {
        return $this->facebook_id;
    }

    /**
     * @param int $facebook_id
     */
    public function setFacebookId($facebook_id)
    {
        $this->facebook_id = $facebook_id;
    }

    /**
     * @return int
     */
    public function getGoogleAccessToken()
    {
        return $this->google_access_token;
    }

    /**
     * @param int $google_access_token
     */
    public function setGoogleAccessToken($google_access_token)
    {
        $this->google_access_token = $google_access_token;
    }

    public function setTwitterId($twitter_id)
    {
        $this->twitter_id = $twitter_id;

        return $this;
    }

    public function getTwitterId()
    {
        return $this->twitter_id;
    }

    public function setTwitterAccessToken($twitter_access_token)
    {
        $this->twitter_access_token = $twitter_access_token;
    }

    public function getTwitterAccessToken()
    {
        return $this->twitter_access_token;
    }

    /**
     * @return int
     */
    public function getFacebookUrl()
    {
        return $this->facebookUrl;
    }

    /**
     * @param int $facebookUrl
     */
    public function setFacebookUrl($facebookUrl)
    {
        $this->facebookUrl = $facebookUrl;
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

    public function getLinkedInUrl(): ?string
    {
        return $this->linkedInUrl;
    }

    public function setLinkedInUrl(?string $linkedInUrl): self
    {
        $this->linkedInUrl = $linkedInUrl;

        return $this;
    }

    /**
     * @return string
     */
    public function getTwitterUrl()
    {
        return $this->twitterUrl;
    }

    /**
     * @param string $twitterUrl
     */
    public function setTwitterUrl($twitterUrl)
    {
        $this->twitterUrl = $twitterUrl;
    }

    public function setMedia(Media $media = null): self
    {
        $this->media = $media;

        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
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

    /**
     * @return string
     */
    public function getAddress2()
    {
        return $this->address2;
    }

    /**
     * @param string $address2
     */
    public function setAddress2($address2)
    {
        $this->address2 = $address2;
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

    /**
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * @param string $city
     */
    public function setCity($city)
    {
        $this->city = $city;
    }

    /**
     * @return string
     */
    public function getNeighborhood()
    {
        return $this->neighborhood;
    }

    /**
     * @param string $neighborhood
     */
    public function setNeighborhood($neighborhood)
    {
        $this->neighborhood = $neighborhood;
    }

    public function getOpinions()
    {
        return $this->opinions;
    }

    public function getOpinionVersions()
    {
        return $this->opinionVersions;
    }

    public function getComments()
    {
        return $this->comments;
    }

    public function getArguments()
    {
        return $this->arguments;
    }

    public function getVotes()
    {
        return $this->votes;
    }

    public function getSources()
    {
        return $this->sources;
    }

    public function getProposals()
    {
        return $this->proposals;
    }

    public function getReplies()
    {
        return $this->replies;
    }

    /**
     * Gets the value of argumentsCount.
     *
     * @return int
     */
    public function getArgumentsCount()
    {
        return $this->argumentsCount;
    }

    /**
     * @return int
     */
    public function getOpinionVersionsCount()
    {
        return $this->opinionVersionsCount;
    }

    /**
     * @param int $opinionVersionsCount
     */
    public function setOpinionVersionsCount($opinionVersionsCount)
    {
        $this->opinionVersionsCount = $opinionVersionsCount;
    }

    /**
     * @return int
     */
    public function getProposalVotesCount()
    {
        return $this->proposalVotesCount;
    }

    /**
     * @param int $proposalVotesCount
     *
     * @return $this
     */
    public function setProposalVotesCount($proposalVotesCount)
    {
        $this->proposalVotesCount = $proposalVotesCount;

        return $this;
    }

    /**
     * Sets the value of argumentsCount.
     *
     * @param int $argumentsCount the arguments count
     *
     * @return self
     */
    public function setArgumentsCount($argumentsCount)
    {
        $this->argumentsCount = $argumentsCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getOpinionVotesCount()
    {
        return $this->opinionVotesCount;
    }

    /**
     * @param int $opinionVotesCount
     */
    public function setOpinionVotesCount($opinionVotesCount)
    {
        $this->opinionVotesCount = $opinionVotesCount;
    }

    /**
     * @return int
     */
    public function getOpinionVersionVotesCount()
    {
        return $this->opinionVersionVotesCount;
    }

    /**
     * @param int $opinionVersionVotesCount
     */
    public function setOpinionVersionVotesCount($opinionVersionVotesCount)
    {
        $this->opinionVersionVotesCount = $opinionVersionVotesCount;
    }

    /**
     * @return int
     */
    public function getSourceVotesCount()
    {
        return $this->sourceVotesCount;
    }

    /**
     * @param int $sourceVotesCount
     */
    public function setSourceVotesCount($sourceVotesCount)
    {
        $this->sourceVotesCount = $sourceVotesCount;
    }

    /**
     * @return int
     */
    public function getArgumentVotesCount()
    {
        return $this->argumentVotesCount;
    }

    /**
     * @param int $argumentVotesCount
     */
    public function setArgumentVotesCount($argumentVotesCount)
    {
        $this->argumentVotesCount = $argumentVotesCount;
    }

    /**
     * Sets the value of votes.
     *
     * @param mixed $votes the votes
     *
     * @return self
     */
    public function setVotes($votes)
    {
        $this->votes = $votes;

        return $this;
    }

    public function setProposals($proposals)
    {
        $this->proposals = $proposals;

        return $this;
    }

    public function setOpinions($opinions)
    {
        $this->opinions = $opinions;

        return $this;
    }

    public function setOpinionVersions($versions)
    {
        $this->opinionVersions = $versions;

        return $this;
    }

    public function setComments($comments)
    {
        $this->comments = $comments;

        return $this;
    }

    public function setArguments($arguments)
    {
        $this->arguments = $arguments;

        return $this;
    }

    public function setSources($sources)
    {
        $this->sources = $sources;

        return $this;
    }

    public function setReplies($replies)
    {
        $this->replies = $replies;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getUserType()
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

    public function getEmailConfirmationSentAt()
    {
        return $this->emailConfirmationSentAt;
    }

    public function setEmailConfirmationSentAt(\DateTime $date = null)
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

    public function getSmsConfirmationSentAt()
    {
        return $this->smsConfirmationSentAt;
    }

    public function setSmsConfirmationSentAt(\DateTime $date = null)
    {
        $this->smsConfirmationSentAt = $date;

        return $this;
    }

    public function getSmsConfirmationCode()
    {
        return $this->smsConfirmationCode;
    }

    public function setSmsConfirmationCode($code = null)
    {
        $this->smsConfirmationCode = $code;

        return $this;
    }

    public function isPhoneConfirmed()
    {
        return $this->phoneConfirmed;
    }

    public function setPhoneConfirmed($phoneConfirmed)
    {
        $this->phoneConfirmed = $phoneConfirmed;

        return $this;
    }

    // ************************* Custom methods *********************************

    public function isEmailConfirmed(): bool
    {
        return null === $this->confirmationToken;
    }

    public function getFullname()
    {
        return sprintf('%s %s', $this->getFirstname(), $this->getLastname());
    }

    public static function getGenderList()
    {
        return [
            UserInterface::GENDER_FEMALE => 'gender.female',
            UserInterface::GENDER_MALE => 'gender.male',
            self::GENDER_OTHER => 'gender.other'
        ];
    }

    public function getContributions()
    {
        $types = [
            $this->getOpinions(),
            $this->getOpinionVersions(),
            $this->getVotes(),
            $this->getComments(),
            $this->getArguments(),
            $this->getSources(),
            $this->getProposals(),
            $this->getReplies()
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

    public function isCredentialsExpired(): bool
    {
        return $this->credentialsExpired;
    }

    public function setCredentialsExpired(bool $value): self
    {
        $this->credentialsExpired = $value;

        return $this;
    }

    public function getCredentialsExpireAt(): ?\DateTime
    {
        return $this->credentialsExpireAt;
    }

    public function setCredentialsExpireAt(?\DateTime $value): self
    {
        $this->credentialsExpireAt = $value;

        return $this;
    }

    // ********************* Methods for synthesis tool **************************

    public function getUniqueIdentifier()
    {
        return $this->slug;
    }

    public function getDisplayName()
    {
        return $this->username ?: 'Utilisateur sans nom';
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('ROLE_SUPER_ADMIN');
    }

    /**
     * Tell if user has role admin or super admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('ROLE_ADMIN') || $this->hasRole('ROLE_SUPER_ADMIN');
    }

    public function isEvaluer(): bool
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
        return !$this->profilePageIndexed;
    }

    public function setProfilePageIndexed(bool $profilePageIndexed = true)
    {
        $this->profilePageIndexed = !$profilePageIndexed;
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
        return $this->isEnabled();
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

    public function getRemindedAccountConfirmationAfter24Hours(): bool
    {
        return $this->remindedAccountConfirmationAfter24Hours;
    }

    public function setRemindedAccountConfirmationAfter24Hours(
        bool $remindedAccountConfirmationAfter24Hours
    ): self {
        $this->remindedAccountConfirmationAfter24Hours = $remindedAccountConfirmationAfter24Hours;

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
}

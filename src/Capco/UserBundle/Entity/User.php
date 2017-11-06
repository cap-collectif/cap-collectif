<?php

namespace Capco\UserBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Synthesis\SynthesisUserInterface;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Sonata\UserBundle\Entity\BaseUser;
use Sonata\UserBundle\Model\UserInterface;
use Symfony\Component\Security\Core\Encoder\EncoderAwareInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\UserInterface as RealUserInterface;

class User extends BaseUser implements EncoderAwareInterface, SynthesisUserInterface, EquatableInterface
{
    const SORT_ORDER_CREATED_AT = 0;
    const SORT_ORDER_CONTRIBUTIONS_COUNT = 1;

    public static $sortOrder = [
        'activity' => self::SORT_ORDER_CONTRIBUTIONS_COUNT,
        'date' => self::SORT_ORDER_CREATED_AT,
    ];
    public static $sortOrderLabels = [
        'activity' => 'user.index.sort.activity',
        'date' => 'user.index.sort.date',
    ];

    protected $samlId;

    protected $id;

    /**
     * @var int
     */
    protected $facebook_id;

    /**
     * @var int
     */
    protected $facebook_access_token;

    /**
     * @var int
     */
    protected $facebookUrl;

    /**
     * @var int
     */
    protected $google_id;

    /**
     * @var int
     */
    protected $google_access_token;

    /**
     * @var int
     */
    protected $googleUrl;

    /**
     * @var string
     */
    protected $twitter_id;

    /**
     * @var string
     */
    protected $twitter_access_token;

    /**
     * @var string
     */
    protected $twitterUrl;

    /**
     * @var
     */
    protected $Media;

    /**
     * @var string
     */
    protected $address;

    /**
     * @var string
     */
    protected $address2;

    /**
     * @var int
     */
    protected $zipCode;

    /**
     * @var string
     */
    protected $neighborhood;

    /**
     * @var string
     */
    protected $city;

    /**
     * @var string
     */
    protected $encoder;

    protected $opinions;

    protected $opinionVersions;

    protected $ideas;

    protected $comments;

    protected $arguments;

    protected $votes;

    protected $sources;

    protected $proposals;

    protected $replies;

    /**
     * @var int
     */
    protected $projectsCount = 0;

    /**
     * @var int
     */
    protected $sourcesCount = 0;

    /**
     * @var int
     */
    protected $argumentsCount = 0;

    /**
     * @var int
     */
    protected $ideasCount = 0;

    /**
     * @var int
     */
    protected $proposalsCount = 0;

    /**
     * @var int
     */
    protected $repliesCount = 0;

    /**
     * @var int
     */
    protected $opinionsCount = 0;

    /**
     * @var int
     */
    protected $opinionVersionsCount = 0;

    // Comments

    /**
     * @var int
     */
    protected $ideaCommentsCount = 0;

    /**
     * @var int
     */
    protected $postCommentsCount = 0;

    /**
     * @var int
     */
    protected $eventCommentsCount = 0;

    // Votes

    /**
     * @var int
     */
    protected $ideaVotesCount = 0;

    /**
     * @var int
     */
    protected $argumentVotesCount = 0;

    /**
     * @var int
     */
    protected $commentVotesCount = 0;

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

    protected $newEmailToConfirm = null;
    protected $newEmailConfirmationToken = null;

    protected $emailConfirmationSentAt = null;

    protected $smsConfirmationSentAt = null;
    protected $smsConfirmationCode = null;
    protected $phoneConfirmed = false;

    protected $alertExpirationSent = false;

    /**
     * @var UserNotificationsConfiguration
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\UserNotificationsConfiguration", inversedBy="user", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="notifications_configuration_id", referencedColumnName="id")
     */
    private $notificationsConfiguration;

    /**
     * @var string
     */
    private $slug;

    private $responses;

    private $profilePageIndexed = true;

    private $consentExternalCommunication = false;

    private $userGroups;

    public function __construct($encoder = null)
    {
        parent::__construct();

        $this->encoder = $encoder;
        $this->roles = ['ROLE_USER'];
        $this->opinions = new ArrayCollection();
        $this->opinionVersions = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->ideas = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->sources = new ArrayCollection();
        $this->proposals = new ArrayCollection();
        $this->replies = new ArrayCollection();
        $this->initializeNotificationsConfiguration();
        $this->userGroups = new ArrayCollection();
    }

    public function setSamlAttributes(string $idp, array $attributes)
    {
        if ('oda' === $idp) {
            $this->setUsername($attributes['oda_prenom'][0] . ' ' . $attributes['oda_nom'][0]);
        }
        if ('daher' === $idp) {
            $this->setUsername($attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]);
            $this->setEmail($attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]);
        }
        if ('afd-interne' === $idp) {
            $this->setUsername($attributes['cn'][0]);
            $this->setEmail($attributes['mail'][0]);
        }
    }

    public function setSamlId($id)
    {
        $this->samlId = $id;

        return $this;
    }

    public function getSamlId()
    {
        return $this->samlId;
    }

    // used as a lifecycleCallback
    public function sanitizePhoneNumber()
    {
        if ($this->phone) {
            $this->phone = '+' . preg_replace('/[^0-9]/', '', $this->phone);
        }
    }

    public function isEqualTo(RealUserInterface $user)
    {
        return $this->id === $user->getId();
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

    public function getNewEmailToConfirm()
    {
        return $this->newEmailToConfirm;
    }

    public function setNewEmailToConfirm(string $email = null): self
    {
        $this->newEmailToConfirm = $email;

        return $this;
    }

    public function getNewEmailConfirmationToken(): string
    {
        return $this->newEmailConfirmationToken;
    }

    public function setNewEmailConfirmationToken(string $token = null): self
    {
        $this->newEmailConfirmationToken = $token;

        return $this;
    }

    public function isIndexable()
    {
        return $this->isEnabled();
    }

    // for EncoderAwareInterface
    public function getEncoderName()
    {
        return $this->encoder;
    }

    // for serialization
    public function getEncoder()
    {
        return $this->encoder;
    }

    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
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

    /**
     * @return int
     */
    public function getGoogleUrl()
    {
        return $this->googleUrl;
    }

    /**
     * @param int $googleUrl
     */
    public function setGoogleUrl($googleUrl)
    {
        $this->googleUrl = $googleUrl;
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

    /**
     * Set media.
     *
     * @param Media $media
     *
     * @return User
     */
    public function setMedia(Media $media = null)
    {
        $this->Media = $media;

        return $this;
    }

    /**
     * Get media.
     *
     * @return \Capco\MediaBundle\Entity\Media
     */
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * @return string
     */
    public function getAddress()
    {
        return $this->address;
    }

    /**
     * @param string $address
     */
    public function setAddress($address)
    {
        $this->address = $address;
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

    /**
     * @return int
     */
    public function getZipCode()
    {
        return $this->zipCode;
    }

    /**
     * @param int $zipCode
     */
    public function setZipCode($zipCode)
    {
        $this->zipCode = $zipCode;
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

    public function getIdeas()
    {
        return $this->ideas;
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
     * Gets the value of projectsCount.
     *
     * @return int
     */
    public function getProjectsCount()
    {
        return $this->projectsCount;
    }

    /**
     * Gets the value of sourcesCount.
     *
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
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
     * Gets the value of ideasCount.
     *
     * @return int
     */
    public function getIdeasCount()
    {
        return $this->ideasCount;
    }

    /**
     * Gets the value of opinionsCount.
     *
     * @return int
     */
    public function getOpinionsCount()
    {
        return $this->opinionsCount;
    }

    /**
     * Sets the value of opinionsCount.
     *
     * @param int $opinionsCount the opinions count
     *
     * @return self
     */
    public function setOpinionsCount($opinionsCount)
    {
        $this->opinionsCount = $opinionsCount;

        return $this;
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
     * Sets the value of ideasCount.
     *
     * @param int $ideasCount the ideas count
     *
     * @return self
     */
    public function setIdeasCount($ideasCount)
    {
        $this->ideasCount = $ideasCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getProposalsCount()
    {
        return $this->proposalsCount;
    }

    /**
     * @param int $proposalsCount
     *
     * @return $this
     */
    public function setProposalsCount($proposalsCount)
    {
        $this->proposalsCount = $proposalsCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getRepliesCount()
    {
        return $this->repliesCount;
    }

    /**
     * @param int $repliesCount
     *
     * @return $this
     */
    public function setRepliesCount($repliesCount)
    {
        $this->repliesCount = $repliesCount;

        return $this;
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
     * Sets the value of projectsCount.
     *
     * @param int $projectsCount the sources count
     *
     * @return self
     */
    public function setProjectsCount($projectsCount)
    {
        $this->projectsCount = $projectsCount;

        return $this;
    }

    /**
     * Sets the value of sourcesCount.
     *
     * @param int $sourcesCount the sources count
     *
     * @return self
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getIdeaCommentsCount()
    {
        return $this->ideaCommentsCount;
    }

    /**
     * @param int $ideaCommentsCount
     */
    public function setIdeaCommentsCount($ideaCommentsCount)
    {
        $this->ideaCommentsCount = $ideaCommentsCount;
    }

    /**
     * @return int
     */
    public function getPostCommentsCount()
    {
        return $this->postCommentsCount;
    }

    /**
     * @param int $postCommentsCount
     */
    public function setPostCommentsCount($postCommentsCount)
    {
        $this->postCommentsCount = $postCommentsCount;
    }

    /**
     * @return int
     */
    public function getIdeaVotesCount()
    {
        return $this->ideaVotesCount;
    }

    /**
     * @param int $ideaVotesCount
     */
    public function setIdeaVotesCount($ideaVotesCount)
    {
        $this->ideaVotesCount = $ideaVotesCount;
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
    public function getEventCommentsCount()
    {
        return $this->eventCommentsCount;
    }

    /**
     * @param int $eventCommentsCount
     */
    public function setEventCommentsCount($eventCommentsCount)
    {
        $this->eventCommentsCount = $eventCommentsCount;
    }

    /**
     * @return int
     */
    public function getCommentVotesCount()
    {
        return $this->commentVotesCount;
    }

    /**
     * @param int $commentVotesCount
     */
    public function setCommentVotesCount($commentVotesCount)
    {
        $this->commentVotesCount = $commentVotesCount;
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

    public function setIdeas($ideas)
    {
        $this->ideas = $ideas;

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

    /**
     * @param mixed $userType
     */
    public function setUserType($userType)
    {
        $this->userType = $userType;
    }

    public function isVip()
    {
        return $this->vip;
    }

    /**
     * @param mixed $vip
     *
     * @return $this
     */
    public function setVip($vip)
    {
        $this->vip = $vip;

        return $this;
    }

    public function isAlertExpirationSent()
    {
        return $this->alertExpirationSent;
    }

    public function setAlertExpirationSent($alertExpirationSent)
    {
        $this->alertExpirationSent = $alertExpirationSent;

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

    public function setExpiresAt(\DateTime $date = null)
    {
        $this->expiresAt = $date;

        return $this;
    }

    // ************************* Custom methods *********************************

    public function isEmailConfirmed()
    {
        return null === $this->confirmationToken;
    }

    public function getFullname()
    {
        return sprintf(
            '%s %s',
            $this->getFirstname(),
            $this->getLastname()
        );
    }

    public static function getGenderList()
    {
        return [
            UserInterface::GENDER_UNKNOWN => 'gender.unknown',
            UserInterface::GENDER_FEMALE => 'gender.female',
            UserInterface::GENDER_MALE => 'gender.male',
        ];
    }

    public function getContributions()
    {
        $types = [
        $this->getOpinions(),
        $this->getOpinionVersions(),
        $this->getVotes(),
        $this->getComments(),
        $this->getIdeas(),
        $this->getArguments(),
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

    public function getContributionsCount()
    {
        return $this->sourcesCount + $this->ideasCount + $this->argumentsCount + $this->opinionsCount + $this->opinionVersionsCount + $this->getCommentsCount() + $this->proposalsCount;
    }

    public function getVotesCount()
    {
        return $this->ideaVotesCount + $this->commentVotesCount + $this->opinionVotesCount + $this->opinionVersionVotesCount + $this->argumentVotesCount + $this->sourceVotesCount + $this->proposalVotesCount;
    }

    public function getCommentsCount()
    {
        return $this->ideaCommentsCount + $this->postCommentsCount + $this->eventCommentsCount;
    }

    // ********************* Methods for synthesis tool **************************

    public function getUniqueIdentifier()
    {
        return $this->slug;
    }

    /**
     * Get display name.
     *
     * @return string
     */
    public function getDisplayName()
    {
        return $this->username ?: 'Utilisateur supprimé';
    }

    public function isSuperAdmin()
    {
        return $this->hasRole('ROLE_SUPER_ADMIN');
    }

    /**
     * Tell if user has role admin or super admin.
     *
     * @return bool
     */
    public function isAdmin()
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

    /**
     * @param bool $profilePageIndexed
     */
    public function setProfilePageIndexed(bool $profilePageIndexed = true)
    {
        $this->profilePageIndexed = !$profilePageIndexed;
    }

    /**
     * @return UserNotificationsConfiguration
     */
    public function getNotificationsConfiguration(): UserNotificationsConfiguration
    {
        return $this->notificationsConfiguration;
    }

    /**
     * @param UserNotificationsConfiguration $notificationsConfiguration
     */
    public function setNotificationsConfiguration(UserNotificationsConfiguration $notificationsConfiguration)
    {
        $this->notificationsConfiguration = $notificationsConfiguration;
    }

    private function initializeNotificationsConfiguration()
    {
        $notificationsConfiguration = new UserNotificationsConfiguration();
        $this->setNotificationsConfiguration($notificationsConfiguration);
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

    public function getUserGroups(): ArrayCollection
    {
        return $this->userGroups;
    }

    public function setUserGroups(ArrayCollection $userGroups): self
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
}

<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_notifications_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserNotificationsConfigurationRepository")
 * @ORM\EntityListeners({"Capco\UserBundle\Listener\UserNotificationsListener"})
 */
class UserNotificationsConfiguration
{
    use UuidTrait;

    /**
     * @var string
     * @ORM\Column(name="unsubscribe_token", type="string", length=255, nullable=false, unique=true)
     */
    private $unsubscribeToken;

    /**
     * @var bool
     * @ORM\Column(name="on_proposal_comment_mail", type="boolean", options={"default": true})
     */
    private $onProposalCommentMail = true;

    /**
     * @var User
     * @ORM\OneToOne(targetEntity="Capco\UserBundle\Entity\User", mappedBy="notificationsConfiguration")
     */
    private $user;

    public function getNotificationsValues(): array
    {
        return [
            'onProposalCommentMail' => $this->onProposalCommentMail,
        ];
    }

    public function disableAllNotifications()
    {
        $this->onProposalCommentMail = false;
    }

    /**
     * @return string|null
     */
    public function getUnsubscribeToken()
    {
        return $this->unsubscribeToken;
    }

    /**
     * @param string $unsubscribeToken
     *
     * @return $this
     */
    public function setUnsubscribeToken(string $unsubscribeToken)
    {
        $this->unsubscribeToken = $unsubscribeToken;

        return $this;
    }

    /**
     * @return bool
     */
    public function isOnProposalCommentMail(): bool
    {
        return $this->onProposalCommentMail;
    }

    public function setOnProposalCommentMail(bool $onProposalCommentMail): self
    {
        $this->onProposalCommentMail = $onProposalCommentMail;

        return $this;
    }

    /**
     * @return User
     */
    public function getUser(): User
    {
        return $this->user;
    }

    /**
     * @param User $user
     *
     * @return UserNotificationsConfiguration
     */
    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }
}

<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
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
     * @ORM\Column(name="unsubscribe_token", type="string", length=255, options={"default": NULL}, nullable=true)
     */
    private $unsubscribeToken;

    /**
     * @var bool
     * @ORM\Column(name="on_proposal_comment_mail", type="boolean", options={"default": true})
     */
    private $onProposalCommentMail = true;

    public function getNotificationsValues(): array
    {
        return [
            'onProposalCommentMail' => $this->onProposalCommentMail,
        ];
    }

    /**
     * @return string
     */
    public function getUnsubscribeToken(): string
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

    /**
     * @param bool $onProposalCommentMail
     */
    public function setOnProposalCommentMail(bool $onProposalCommentMail)
    {
        $this->onProposalCommentMail = $onProposalCommentMail;
    }
}

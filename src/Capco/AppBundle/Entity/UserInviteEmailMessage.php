<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\MailerType;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserInviteEmailMessageRepository")
 * @ORM\EntityListeners({"Capco\AppBundle\EventListener\UserInviteEmailMessageListener"})
 * @ORM\Table(name="user_invite_email_message")
 */
class UserInviteEmailMessage implements EntityInterface
{
    use UuidTrait;

    final public const SEND_FAILURE = 'send_failure';
    final public const WAITING_SENDING = 'waiting_sending';
    final public const SENT = 'sent';

    /**
     * @ORM\Column(name="mailer_id" ,type="string", nullable=true)
     */
    private ?string $mailerId = null;

    /**
     * @ORM\Column(name="mailer_type", type="enum_mailer_type")
     */
    private string $mailerType = MailerType::MANDRILL;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTimeInterface $createdAt;

    /**
     * @ORM\Column(name="internal_status", type="string", nullable=false)
     */
    private string $internalStatus = self::WAITING_SENDING;

    /**
     * @ORM\Column(name="message_type", type="string", nullable=false)
     */
    private string $messageType = CapcoAppBundleMessagesTypes::USER_INVITE_INVITATION;

    public function __construct(
        /**
         * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\UserInvite", inversedBy="emailMessages", cascade={"persist"})
         * @ORM\JoinColumn(name="invitation_id", referencedColumnName="id", onDelete="CASCADE")
         */
        private UserInvite $invitation
    ) {
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getInvitation(): UserInvite
    {
        return $this->invitation;
    }

    public function getMailerId(): ?string
    {
        return $this->mailerId;
    }

    public function setMailerId(string $mailerId): self
    {
        $this->mailerId = $mailerId;

        return $this;
    }

    public function getMailerType(): string
    {
        return $this->mailerType;
    }

    public function setMailerType(string $mailerType): self
    {
        $this->mailerType = $mailerType;

        return $this;
    }

    public function getInternalStatus(): string
    {
        return $this->internalStatus;
    }

    public function setInternalStatus(string $internalStatus): self
    {
        $this->internalStatus = $internalStatus;

        return $this;
    }

    public function getMessageType(): string
    {
        return $this->messageType;
    }

    public function setMessageType(string $messageType): self
    {
        $this->messageType = $messageType;

        return $this;
    }
}

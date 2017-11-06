<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_notifications_configuration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserNotificationsConfigurationRepository")
 */
class UserNotificationsConfiguration
{
    use UuidTrait;

    /**
     * @var bool
     * @ORM\Column(name="on_proposal_comment_mail", type="boolean", options={"default": true})
     */
    private $onProposalCommentMail = true;

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

    public function getNotificationsValues(): array
    {
        return [
            'onProposalCommentMail' => $this->onProposalCommentMail,
        ];
    }
}

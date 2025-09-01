<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Repository\MailingListUserRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=MailingListUserRepository::class)
 * @ORM\Table(name="mailing_list_user")
 */
class MailingListUser
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\MailingList", inversedBy="mailingListUsers")
     * @ORM\JoinColumn(name="mailing_list_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private MailingList $mailingList;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Participant")
     * @ORM\JoinColumn(name="participant_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?Participant $participant = null;

    public function getMailingList(): MailingList
    {
        return $this->mailingList;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function getContributor(): ContributorInterface
    {
        return $this->user ?? $this->participant;
    }

    public function setMailingList(MailingList $mailingList): self
    {
        $this->mailingList = $mailingList;

        return $this;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): self
    {
        $this->participant = $participant;

        return $this;
    }

    public function setContributor(ContributorInterface $contributor): self
    {
        match (true) {
            $contributor instanceof User => $this->user = $contributor,
            $contributor instanceof Participant => $this->participant = $contributor,
            default => throw new \InvalidArgumentException()
        };

        return $this;
    }
}

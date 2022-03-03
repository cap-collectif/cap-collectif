<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\AnonymousableTrait;
use Capco\AppBundle\Traits\ConfirmableTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class EventRegistration.
 *
 * @CapcoAssert\HasUnlistedEmail()
 * @CapcoAssert\HasAnonymousOrUser()
 * @CapcoAssert\EmailDoesNotBelongToUser(message="event_registration.create.email_belongs_to_user")
 * @ORM\Table(name="event_registration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventRegistrationRepository")
 */
class EventRegistration
{
    use ConfirmableTrait;
    use AnonymousableTrait;
    use PrivatableTrait;
    use IdTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="registrations", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     * @Assert\NotNull()
     */
    private $event;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $user;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"confirmed"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    public function __construct(Event $event = null)
    {
        $this->event = $event;
        $this->updatedAt = new \DateTime();
        $this->confirmed = false;
    }

    public function getEvent(): Event
    {
        return $this->event;
    }

    public function setEvent(Event $event): self
    {
        $this->event = $event;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function getParticipant(): ?User
    {
        return $this->getUser();
    }

    public function setUser(?User $user = null): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}

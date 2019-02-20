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

    /**
     * @return mixed
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param $event
     *
     * @return $this
     */
    public function setEvent(Event $event)
    {
        $this->event = $event;

        return $this;
    }

    /**
     * @param $user
     *
     * @return $this
     */
    public function setUser(User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param \DateTime $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param \DateTime $updatedAt
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
    }
}

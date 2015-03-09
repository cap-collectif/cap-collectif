<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;

use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * Class EventRegistration
 * @CapcoAssert\HasUnlistedEmail()
 * @CapcoAssert\HasAnonymousOrUser()
 * @ORM\Table(name="event_registration")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventRegistrationRepository")
 */
class EventRegistration
{

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="registrations", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     * @Assert\NotNull()
     */
    private $event;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="registrations", cascade={"persist"})
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $user;

    /**
     * @ORM\Column(name="username", type="string", length=255, nullable=true)
     */
    private $username;

    /**
     * @ORM\Column(name="email", type="string", length=255, nullable=true)
     */
    private $email;

    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private;

    /**
     * @ORM\Column(name="confirmed", type="boolean", nullable=false)
     */
    private $confirmed = false;

    public function __construct(Event $event = null)
    {
        $this->event = $event;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
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
     * @return $this
     */
    public function setEvent(Event $event)
    {
        $this->event = $event;
        return $this;
    }


    /**
     * @param $user
     * @return $this
     */
    public function setUser(User $user = null)
    {
        $this->user = $user;
        return $this;
    }

    /**
     * Gets the value of username.
     *
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param mixed $username
     *
     * @return $this
     */
    public function setUsername($username)
    {
        $this->username = $username;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @param mixed $email
     *
     * @return $this
     */
    public function setEmail($email)
    {
        $this->email = $email;
        return $this;
    }

    /**
     * @return mixed
     */
    public function isPrivate()
    {
        return $this->private;
    }

    /**
     * @param mixed $private
     *
     * @return $this
     */
    public function setPrivate($private)
    {
        $this->private = $private;

        return $this;
    }

    /**
     * @return mixed
     */
    public function isConfirmed()
    {
        return $this->confirmed;
    }

    /**
     * @param mixed $confirmed
     *
     * @return $this
     */
    public function setConfirmed($confirmed)
    {
        $this->confirmed = $confirmed;

        return $this;
    }
}

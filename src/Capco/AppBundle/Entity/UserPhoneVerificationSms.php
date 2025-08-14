<?php

namespace Capco\AppBundle\Entity;

use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_phone_verification_sms")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository")
 */
class UserPhoneVerificationSms extends AbstractPhoneVerificationSms implements EntityInterface
{
    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="userPhoneVerificationSms")
     */
    private User $user;

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }
}

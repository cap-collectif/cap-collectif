<?php

namespace Capco\UserBundle\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Doctrine\UserManager as BaseUserManager;
use FOS\UserBundle\Util\CanonicalFieldsUpdater;
use FOS\UserBundle\Util\PasswordUpdaterInterface;

class UserManager extends BaseUserManager
{
    public function __construct(
        PasswordUpdaterInterface $passwordUpdater,
        CanonicalFieldsUpdater $canonicalFieldsUpdater,
        EntityManagerInterface $om,
        string $class
    ) {
        parent::__construct($passwordUpdater, $canonicalFieldsUpdater, $om, $class);
    }

    public function findUserByResetPasswordToken(?string $token)
    {
        return $this->findUserBy(['resetPasswordToken' => $token]);
    }
}

<?php

namespace Capco\UserBundle\Manager;

use FOS\UserBundle\Model\UserInterface;

class ClassicStrategy
{
    protected $fosUserManager;
    protected $tokenGenerator;
    protected $notifyManager;

    public function __construct($fosUserManager, $tokenGenerator, $notifyManager)
    {
        $this->fosUserManager = $fosUserManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->notifyManager = $notifyManager;
    }

    public function createUser(): UserInterface
    {
        return $this->fosUserManager->createUser();
    }

    public function confirmRegistration(UserInterface &$user, bool $isAdmin)
    {
        // We generate a confirmation token to validate email
        $token = $this->tokenGenerator->generateToken();

        $this->fosUserManager->updatePassword($user);
        $user->setEnabled(true); // the user can use the website but...
      $user->setExpiresAt((new \DateTime())->modify('+ 12 hours')); // the account expires in 12 hours (if not confirmed)
      $user->setConfirmationToken($token);

        if ($creatingAnAdmin) {
            $this->notifyManager->sendAdminConfirmationEmailMessage($user);
        } else {
            $this->notifyManager->sendConfirmationEmailMessage($user);
        }

        $this->fosUserManager->updateUser($user);
    }
}

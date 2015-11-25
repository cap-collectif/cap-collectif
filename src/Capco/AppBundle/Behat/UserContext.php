<?php

namespace Capco\AppBundle\Behat;

use Behat\Mink\Exception\UnsupportedDriverActionException;
use Capco\AppBundle\Entity\EventRegistration;

class UserContext extends DefaultContext
{
    /**
     * @Given I am logged out
     */
    public function iAmLoggedOut()
    {
        $this->navigationContext->iVisitedPage('LogoutPage');
    }

    /**
     * @Given I am logged in as admin
     */
    public function iAmLoggedInAsAdmin()
    {
        $this->logInWith('admin@test.com', 'admin');
    }

    /**
     * @Given I am logged in as drupal
     */
    public function iAmLoggedInAsDrupal()
    {
        $this->logInWith('drupal@gmail.com', 'toto');
    }

    /**
     * @Given I am logged in as user
     */
    public function iAmLoggedInAsUser()
    {
        $this->logInWith('user@test.com', 'user');
    }

    private function logInWith($email, $pwd)
    {
        $this->navigationContext->iVisitedPage('LoginPage');
        $this->fillField('_username', $email);
        $this->fillField('_password', $pwd);
        $this->pressButton('Se connecter');
        try {
            $this->getSession()->wait(2000);
        } catch (UnsupportedDriverActionException $e) {
            // If we're not using JS, we can not (and don't need to) wait
        }
    }

    /**
     * @Given :email is registered to event :slug
     */
    public function isRegisteredToEvent($email, $slug)
    {
        $event        = $this->getRepository('CapcoAppBundle:Event')->findOneBySlug($slug);
        $registration = (new EventRegistration($event))
                            ->setEmail($email)
                            ->setUsername($email)
                            ->setPrivate(false)
                        ;

        $this->getEntityManager()->persist($registration);
        $this->getEntityManager()->flush();
    }
}

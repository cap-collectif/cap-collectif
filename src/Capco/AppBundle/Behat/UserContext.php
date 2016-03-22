<?php

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Entity\EventRegistration;

class UserContext extends DefaultContext
{
    /**
     * @Given I logout
     */
    public function iLogout()
    {
      $home = $this->navigationContext->getPage('HomePage');
      $home->clickLogout();
      sleep(2);
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

    /**
     * @Given I open login modal
     */
    public function iOpenLoginModal()
    {
      $this->navigationContext->iVisitedPage('HomePage');
      $home = $this->navigationContext->getPage('HomePage');
      sleep(3);
      $home->openLoginModal();
    }

    private function logInWith($email, $pwd)
    {
        $this->iOpenLoginModal();
        $this->fillField('_username', $email);
        $this->fillField('_password', $pwd);
        $this->pressButton('Se connecter');
        sleep(3);
    }

    /**
     * @Given :email is registered to event :slug
     */
    public function isRegisteredToEvent($email, $slug)
    {
        $event = $this->getRepository('CapcoAppBundle:Event')->findOneBySlug($slug);
        $registration = (new EventRegistration($event))
                            ->setEmail($email)
                            ->setUsername($email)
                            ->setPrivate(false)
                        ;

        $this->getEntityManager()->persist($registration);
        $this->getEntityManager()->flush();
    }
}

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
     * @Given I am logged in as user_not_confirmed
     */
    public function iAmLoggedInAsUserNotConfirmed()
    {
        $this->logInWith('user_not_confirmed@test.com', 'user_not_confirmed');
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
     * @Given I want to login as expired_user
     */
    public function iWantToLoginAsExpiredUser()
    {
        $this->logInWith('user_expired@test.com', 'user_expired');
    }

    /**
     * @Then I can see I am logged in as :username
     */
    public function iCanSeeIamLoggedInAs($username)
    {
        $this->assertElementContainsText('#navbar-username', $username);
    }

    /**
     * @Then I can access admin in navbar
     */
    public function iCanAccessAdminInNavbar()
    {
        $this->navigationContext->getPage('HomePage')->openUserDropdown();
        $this->assertElementContainsText('.open.dropdown > ul', 'Administration');
    }

    /**
     * @Given I open login modal
     */
    public function iOpenLoginModal()
    {
        $this->navigationContext->iVisitedPage('HomePage');
        $home = $this->navigationContext->getPage('HomePage');
        $home->openLoginModal();
    }

    private function logInWith($email, $pwd)
    {
        $this->iOpenLoginModal();
        $this->fillField('_username', $email);
        $this->fillField('_password', $pwd);
        $this->pressButton('Se connecter');
        sleep(4); // TODO
    }

    /**
     * @Then I should be asked to confirm my email :email
     */
    public function iShouldBeAskedToConfirmMyEmail($email)
    {
        $this->assertSession()->elementExists('css', '#alert-email-not-confirmed');
        $this->assertElementContainsText('#alert-email-not-confirmed', $email);
    }

    /**
     * @Then I should not be asked to confirm my email
     */
    public function iShouldNotBeAskedToConfirmMyEmail()
    {
        $this->assertSession()->elementNotExists('css', '#alert-email-not-confirmed');
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

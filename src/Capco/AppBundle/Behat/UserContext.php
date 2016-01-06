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
    }

    /**
     * @When I go on the sources tab
     */
    public function iGoOnTheSourcesTab()
    {
        $page = $navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getElement('sources tab')."').length > 0");
        $page->clickSourcesTab();
    }

    /**
     * @When I go on the arguments tab
     */
    public function iGoOnTheArgumentsTab()
    {
        $page = $navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getElement('arguments tab')."').length > 0");
        $page->clickArgumentsTab();
    }

    /**
     * @When I go on the connections tab
     */
    public function iGoOnTheConnectionsTab()
    {
        $page = $navigationContext->getPage('opinion page');
        $this->getSession()->wait(3000, "$('".$page->getElement('connections tab')."').length > 0");
        $page->clickConnectionsTab();
    }

    /**
     * @When I want to add a source
     */
    public function clickAddSourceTab()
    {
        $page = $navigationContext->getPage('opinion page');
        $this->getSession()->wait(2000, "$('".$page->getElement('sources add')."').length > 0");
        $page->clickAddSource();
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

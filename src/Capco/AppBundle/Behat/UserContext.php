<?php

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Entity\EventRegistration;
use PHPUnit_Framework_Assert as PHPUnit;

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
     * @Then the question :questionAId should be positioned before :questionBId
     */
    public function questionIsBefore(int $questionAId, int $questionBId)
    {
        $this->getEntityManager()->clear();
        $qA = $this->getRepository('CapcoAppBundle:Questions\AbstractQuestion')->find($questionAId);
        $qB = $this->getRepository('CapcoAppBundle:Questions\AbstractQuestion')->find($questionBId);
        expect($qB->getQuestionnaireAbstractQuestion()->getPosition() - $qA->getQuestionnaireAbstractQuestion()->getPosition() > 0)->toBe(true);
    }

    /**
     * @Then user :userId should have role :role
     * @Given user :userId has role :role
     */
    public function userHasRole(string $userId, string $role)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        expect($user->hasRole($role))->toBe(true);
    }

    /**
     * @Then user :userId should not have role :role
     * @Given user :userId doesn't have role :role
     */
    public function userDoesntHaveRole(string $userId, string $role)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        expect($user->hasRole($role))->toBe(false);
    }

    /**
     * @Then user :userName should have email :email
     */
    public function userEmailIs(string $userName, string $email)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($userName);
        expect($user->getEmail())->toBe($email);
    }

    /**
     * @Given /^user with email "([^"]+)" has disabled notifications$/
     *
     * @param mixed $email
     */
    public function disableUserNotifications($email)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->findOneBy(['email' => $email]);
        $user->getNotificationsConfiguration()->disableAllNotifications();
        $this->getEntityManager()->flush();
    }

    /**
     * @Then user :userSlug email_to_confirm should be :email
     */
    public function userNewEmailIs(string $userSlug, string $email)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->findOneBySlug($userSlug);
        expect($user->getNewEmailToConfirm())->toBe($email);
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
     *
     * @param mixed $username
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
        $this->assertElementContainsText('.open.dropdown > ul', 'navbar.admin');
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

    /**
     * @Then I should be asked to confirm my email :email
     *
     * @param mixed $email
     */
    public function iShouldBeAskedToConfirmMyEmail($email)
    {
        $this->getSession()->wait(3000, "$('#alert-email-not-confirmed').length > 0");
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
     * @Then :username phone number should be :phone
     *
     * @param mixed $username
     * @param mixed $phone
     */
    public function phoneNumberShouldBe($username, $phone)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        PHPUnit::assertSame($user->getPhone(), $phone);
    }

    /**
     * @When I close current alert
     */
    public function iCloseCurrentAlert()
    {
        $alertCloseButton = $this->getSession()->getPage()->find('css', '#current-alert .close');
        $alertCloseButton->click();
    }

    /**
     * @Then :username should not be sms confirmed
     *
     * @param mixed $username
     */
    public function phoneConfirmedShouldBeFalse($username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        PHPUnit::assertFalse($user->isPhoneConfirmed());
    }

    /**
     * @Then :username should have an sms code to confirm
     *
     * @param mixed $username
     */
    public function shouldHaveAnSmsCodeToConfirm($username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        PHPUnit::assertNotNull($user->getSmsConfirmationCode());
        PHPUnit::assertTrue(is_int($user->getSmsConfirmationCode()));
        PHPUnit::assertEquals(strlen((string) $user->getSmsConfirmationCode()), 6);
    }

    /**
     * @Then :username should be sms confirmed
     *
     * @param mixed $username
     */
    public function shouldBePhoneConfirmed($username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        PHPUnit::assertTrue($user->isPhoneConfirmed());
    }

    /**
     * @Given :email is registered to event :slug
     *
     * @param mixed $email
     * @param mixed $slug
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

    private function logInWith($email, $pwd)
    {
        $this->iOpenLoginModal();
        $this->fillField('username', $email);
        $this->fillField('password', $pwd);
        $this->pressButton('global.login_me');
        sleep(4); // TODO
    }
}

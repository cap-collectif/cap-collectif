<?php

namespace Capco\AppBundle\Behat;

use PHPUnit\Framework\Assert;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\AppBundle\Entity\EventRegistration;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class UserContext extends DefaultContext
{
    /**
     * @Given I logout
     */
    public function iLogout()
    {
        $home = $this->navigationContext->getPage('HomePage');
        $home->clickLogout();

        // Called only once, so it's ok
        sleep(2);
    }

    /**
     * @Given I am logged in as no_name
     */
    public function iAmLoggedInAsNoName()
    {
        $this->iAmAuthenticatedAs('no_name@cap-collectif.com');
    }

    /**
     * @Given I am logged in as user_not_confirmed
     */
    public function iAmLoggedInAsUserNotConfirmed()
    {
        $this->iAmAuthenticatedAs('user_not_confirmed@test.com');
    }

    /**
     * @Then the question :questionAId should be positioned before :questionBId
     */
    public function questionIsBefore(int $questionAId, int $questionBId)
    {
        $this->getEntityManager()->clear();
        $qA = $this->getRepository('CapcoAppBundle:Questions\AbstractQuestion')->find($questionAId);
        $qB = $this->getRepository('CapcoAppBundle:Questions\AbstractQuestion')->find($questionBId);
        expect(
            $qB->getQuestionnaireAbstractQuestion()->getPosition() -
                $qA->getQuestionnaireAbstractQuestion()->getPosition() >
                0
        )->toBe(true);
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
     * @Then user identified by email :email should have username :userName
     */
    public function userNameIs(string $email, string $userName)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByEmail($email);
        expect($user->getUsername())->toBe($userName);
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
        $this->iAmAuthenticatedAs('admin@test.com');
    }

    /**
     * @Given I am logged in as super admin
     */
    public function iAmLoggedInToGraphQLAsSfavot()
    {
        $this->iAmAuthenticatedAs('sfavot@jolicode.com');
    }

    /**
     * @Given I am logged in as drupal
     */
    public function iAmLoggedInAsDrupal()
    {
        $this->iAmAuthenticatedAs('drupal@gmail.com');
    }

    /**
     * @Given I am logged in as pierre
     */
    public function iAmLoggedInAsPierre()
    {
        $this->iAmAuthenticatedAs('pierre@cap-collectif.com');
    }

    /**
     * @Given I am logged in as jean
     */
    public function iAmLoggedInAsJean()
    {
        $this->iAmAuthenticatedAs('jean@cap-collectif.com');
    }

    /**
     * @Given I am logged in as mauriau
     */
    public function iAmLoggedInAsMauriau()
    {
        $this->iAmAuthenticatedAs('maxime.auriau@cap-collectif.com');
    }

    /**
     * @Given I am logged in as user
     */
    public function iAmLoggedInAsUser()
    {
        $this->iAmAuthenticatedAs('user@test.com');
    }

    /**
     * @Then I can see I am logged in as :username
     */
    public function iCanSeeIamLoggedInAs(string $username)
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
     */
    public function iShouldBeAskedToConfirmMyEmail(string $email)
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
     */
    public function phoneNumberShouldBe(string $username, string $phone)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        Assert::assertSame($user->getPhone(), $phone);
    }

    /**
     * @When I close current alert
     */
    public function iCloseCurrentAlert()
    {
        $alertCloseButton = $this->getSession()
            ->getPage()
            ->find('css', '#current-alert .close');
        $alertCloseButton->click();
    }

    /**
     * @Then :username should not be sms confirmed
     */
    public function phoneConfirmedShouldBeFalse(string $username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        Assert::assertFalse($user->isPhoneConfirmed());
    }

    /**
     * @Then :username should have an sms code to confirm
     */
    public function shouldHaveAnSmsCodeToConfirm(string $username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        Assert::assertNotNull($user->getSmsConfirmationCode());
        Assert::assertTrue(\is_int($user->getSmsConfirmationCode()));
        Assert::assertEquals(\strlen((string) $user->getSmsConfirmationCode()), 6);
    }

    /**
     * @Then :username should be sms confirmed
     */
    public function shouldBePhoneConfirmed(string $username)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->findOneByUsername($username);
        Assert::assertTrue($user->isPhoneConfirmed());
    }

    /**
     * @Given :email is registered to event :slug
     */
    public function isRegisteredToEvent(string $email, string $slug)
    {
        $event = $this->getRepository('CapcoAppBundle:Event')->findOneBySlug($slug);
        $registration = (new EventRegistration($event))
            ->setEmail($email)
            ->setUsername($email)
            ->setPrivate(false);
        $this->getEntityManager()->persist($registration);
        $this->getEntityManager()->flush();
    }

    /**
     * @Given I am on the home page
     */
    public function IAmOnTheHomePage()
    {
        $this->navigationContext->iVisitedPage('HomePage');
    }

    /**
     * Almost all our testing scenarios needs to be authenticated.
     * We could go threw the login process everytime but it would take a lot of time !
     * And we also don't need to test the login process multiple times (login.feature is enough).
     *
     * That's why we are simulating an HTTP authentication here :
     */
    private function iAmAuthenticatedAs(string $email): void
    {
        $user = $this->getService(UserManager::class)->findUserByEmail($email);
        if (!$user) {
            throw new \RuntimeException('Could not find user associated with email:' . $email);
        }

        // We create a new server session
        $serverSession = $this->getService('session');

        // We populate the server session with an authenticated token
        $providerKey = $this->getParameter('fos_user.firewall_name');
        $token = new UsernamePasswordToken($user, null, $providerKey, $user->getRoles());
        $serverSession->set('_security_' . $providerKey, serialize($token));
        $serverSession->save();

        $driver = $this->getSession()->getDriver();
        $cookie = [
            'domain' => 'capco.test',
            'name' => $serverSession->getName(),
            'value' => $serverSession->getId(),
            'path' => '/',
            'secure' => true,
        ];

        try {
            // We manually set the client cookie
            $driver->getWebDriverSession()->setCookie($cookie);
        } catch (\Exception $e) {
            if (Text::startsWith($e->getMessage(), 'unable to set cookie')) {
                // We have to navigate to a page to launch browser
                // Maybe we can find a better way to start the browser with initial cookies…
                $this->navigationContext->iVisitedPage('HomePage');

                // We manually set the client cookie (again)
                $driver->getWebDriverSession()->setCookie($cookie);
            } else {
                throw $e;
            }
        }

        // Reload the page to authenticate user
        $this->getSession()->reload();
    }
}

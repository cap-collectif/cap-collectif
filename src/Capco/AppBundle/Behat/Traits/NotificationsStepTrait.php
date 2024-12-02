<?php

namespace Capco\AppBundle\Behat\Traits;

trait NotificationsStepTrait
{
    /**
     * @When /^I go to an email notifications preferences link with token "([^"]+)"$/
     */
    public function iGoToAnEmailNotificationsPreferencesLinkWithToken(mixed $token)
    {
        $this->visitPath("/profile/notifications/{$token}");
    }

    /**
     * @When /^I go to an email disable notifications link with token "([^"]+)"$/
     */
    public function iGoToEmailDisableNotificationPreferencesLink(mixed $token)
    {
        $this->visitPath("/profile/notifications/disable/{$token}");
    }

    /**
     * @Then /^user with unsubscribe token "([^"]+)" should have his notifications disabled$/
     */
    public function userWithUnsubscribeTokenShouldHaveDisabledNotifications(mixed $token)
    {
        $userNotifications = $this->getRepository(
            'CapcoAppBundle:UserNotificationsConfiguration'
        )->findOneBy(['unsubscribeToken' => $token]);
        foreach ($userNotifications->getNotificationsValues() as $key => $notificationsValue) {
            if (true === $notificationsValue) {
                throw new \Exception("User has at least one notifications enabled : {$key} -> {$notificationsValue}");
            }
        }

        return true;
    }
}

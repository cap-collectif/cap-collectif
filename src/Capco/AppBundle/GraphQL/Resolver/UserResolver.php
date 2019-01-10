<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Mutation\DeleteAccountMutation;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Model\UserInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class UserResolver implements ResolverInterface
{
    private $router;
    private $typeResolver;
    private $deleteAccountMutation;

    public function __construct(
        Router $router,
        TypeResolver $typeResolver,
        DeleteAccountMutation $deleteAccountMutation
    ) {
        $this->router = $router;
        $this->typeResolver = $typeResolver;
        $this->deleteAccountMutation = $deleteAccountMutation;
    }

    public function resolveUserType()
    {
        return $this->typeResolver->resolve('InternalUser');
    }

    public function resolveResettingPasswordUrl(User $user): string
    {
        return $this->router->generate(
            'fos_user_resetting_reset',
            ['token' => $user->getResetPasswordToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveRegistrationConfirmationUrl(UserInterface $user): string
    {
        return $this->router->generate(
            'account_confirm_email',
            ['token' => $user->getConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveConfirmNewEmailUrl(User $user, $absolute = true): string
    {
        return $this->router->generate(
            'account_confirm_new_email',
            ['token' => $user->getNewEmailConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveEmail($object): ?string
    {
        if (0 === strpos($object->getEmail(), 'twitter_')) {
            return null;
        }

        return $object->getEmail();
    }

    public function resolveCreatedAt($object): \DateTime
    {
        return $object->getCreatedAt();
    }

    public function resolveShowNotificationsPreferencesUrl(): string
    {
        return $this->router->generate(
            'capco_profile_notifications_edit_account',
            [],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveDisableNotificationsUrl(User $user): string
    {
        return $this->router->generate(
            'capco_profile_notifications_disable',
            ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveLoginAndShowDataUrl(User $user): string
    {
        return $this->router->generate(
            'capco_profile_data_login',
            ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveShowUrlBySlug(string $slug)
    {
        return $this->router->generate(
            'capco_user_profile_show_all',
            compact('slug'),
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolvePhoneConfirmationSentAt($object): ?\DateTime
    {
        return $object->getSmsConfirmationSentAt();
    }

    public function resolveRolesText($object): string
    {
        $convertedRoles = array_map(function ($role) {
            return str_replace(
                ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                ['Utilisateur', 'Administrateur', 'Super Admin'],
                $role
            );
        }, $object->getRoles());

        return implode('|', $convertedRoles);
    }

    public function contributionsToDeleteCount($object): int
    {
        $count = $this->deleteAccountMutation->hardDeleteUserContributionsInActiveSteps(
            $object,
            true
        );

        return $count;
    }
}

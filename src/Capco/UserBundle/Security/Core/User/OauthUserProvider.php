<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use FOS\UserBundle\Model\UserManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\User\FOSUBUserProvider;
use Symfony\Component\Security\Core\User\UserInterface;

class OauthUserProvider extends FOSUBUserProvider
{
    protected $extraMapper;

    public function __construct(
        UserManagerInterface $userManager,
        OpenIDExtraMapper $extraMapper,
        array $properties
    ) {
        $this->extraMapper = $extraMapper;
        parent::__construct($userManager, $properties);
    }

    public function connect(UserInterface $user, UserResponseInterface $response): void
    {
        $email = $response->getEmail() ?: $response->getUsername();

        //on connect - get the access token and the user ID
        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setterId = 'openid' === $service ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        //we "disconnect" previously connected users
        if (null !== ($previousUser = $this->userManager->findUserByEmail($email))) {
            $previousUser->{$setterId}(null);
            $previousUser->{$setterToken}(null);
            $this->userManager->updateUser($previousUser);
        }

        //we connect current user
        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());
        $this->userManager->updateUser($user);
    }

    public function loadUserByOAuthUserResponse(UserResponseInterface $response): UserInterface
    {
        $email = $response->getEmail() ?: 'twitter_' . $response->getUsername();
        $username =
            $response->getNickname() ?: $response->getFirstName() . ' ' . $response->getLastName();
        $user = $this->userManager->findUserByEmail($email);

        if (null === $user) {
            $user = $this->userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setPlainPassword($this->randomString(20));
            $user->setEnabled(true);
        }

        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setterId = 'openid' === $service ? $setter : $setter . 'Id';
        $setterToken = $setter . 'AccessToken';

        if ('openid' === $service) {
            $user->setUsername($username);
            $user->setEmail($email);
            $this->extraMapper->map($user, $response);
        }

        $user->{$setterId}($response->getUsername());
        $user->{$setterToken}($response->getAccessToken());

        $this->userManager->updateUser($user);

        return $user;
    }

    protected function randomString(int $length): string
    {
        $key = '';
        $keys = array_merge(range(0, 9), range('a', 'Z'));

        for ($i = 0; $i < $length; ++$i) {
            $key .= $keys[array_rand($keys)];
        }

        return $key;
    }
}

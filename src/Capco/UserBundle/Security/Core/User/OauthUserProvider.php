<?php
namespace Capco\UserBundle\Security\Core\User;

use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\User\FOSUBUserProvider;
use Symfony\Component\Security\Core\User\UserInterface;

class OauthUserProvider extends FOSUBUserProvider
{
    /**
     * {@inheritdoc}
     */
    public function connect(UserInterface $user, UserResponseInterface $response)
    {
        $email = $response->getEmail() ?: $response->getUsername();

        //on connect - get the access token and the user ID
        $service = $response->getResourceOwner()->getName();
        $setter = 'set' . ucfirst($service);
        $setter_id = $setter . 'Id';
        $setter_token = $setter . 'AccessToken';

        //we "disconnect" previously connected users
        if (null !== $previousUser = $this->userManager->findUserByEmail($email)) {
            $previousUser->{$setter_id}(null);
            $previousUser->{$setter_token}(null);
            $this->userManager->updateUser($previousUser);
        }

        //we connect current user
        $user->{$setter_id}($response->getUsername());
        $user->{$setter_token}($response->getAccessToken());
        $this->userManager->updateUser($user);
    }

    /**
     * {@inheritdoc}
     */
    public function loadUserByOAuthUserResponse(UserResponseInterface $response)
    {
        $email = $response->getEmail() ?: 'twitter_' . $response->getUsername();
        $username = $response->getNickname()
            ?: $response->getFirstName() . ' ' . $response->getLastName();
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
        $setter_id = $setter . 'Id';
        $setter_token = $setter . 'AccessToken';
        $user->{$setter_id}($response->getUsername());
        $user->{$setter_token}($response->getAccessToken());

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

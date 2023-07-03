<?php

namespace spec\Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class FranceConnectOptionsModifierSpec extends ObjectBehavior
{
    public function it_get_allowed_data(
        FranceConnectSSOConfigurationRepository $repository,
        RedisCache $redisCache,
        Manager $toggleManager,
        SessionInterface $session,
        FranceConnectSSOConfiguration $fc
    ) {
        $this->beConstructedWith($repository, $redisCache, $toggleManager, $session);
        $toggleManager->isActive('login_franceconnect')->willReturn(true);
        $repository->find('franceConnect')->willReturn($fc);
        $data = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => false,
            'gender' => false,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];

        $fc->getAllowedData()->willReturn($data);

        $this->getAllowedData()->shouldReturn(['given_name', 'family_name', 'email']);
    }

    public function it_didnt_get_allowed_data(
        FranceConnectSSOConfigurationRepository $repository,
        RedisCache $redisCache,
        Manager $toggleManager,
        SessionInterface $session,
        FranceConnectSSOConfiguration $fc
    ) {
        $this->beConstructedWith($repository, $redisCache, $toggleManager, $session);
        $toggleManager->isActive('login_franceconnect')->willReturn(false);

        $this->getAllowedData()->shouldReturn([]);
    }
}

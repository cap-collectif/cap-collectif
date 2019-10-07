<?php

namespace spec\Capco\UserBundle\Security\Core\User;

use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use PhpSpec\ObjectBehavior;

class MonCompteParisUserProviderSpec extends ObjectBehavior
{
    public function it_should_create_account_for_a_validated_paris_user(
        UserManager $manager,
        OpenAmClient $client,
        User $user
    ) {
        $email = 'paris_account_validated@cap-collectif.com';
        $this->beConstructedWith($manager, $client);
        $manager->findUserBy(['parisId' => $email])->willReturn(null);
        $client->getUserInformations($email)->willReturn(['validatedAccount' => ['true']]);

        $manager->createUser()->willReturn($user);
        $manager->updateUser($user)->shouldBeCalled();
        $user->setParisId($email)->willReturn($user);
        $user->setUsername(null)->willReturn($user);
        $user->setEmail($email)->willReturn($user);
        $user->setPlainPassword('No password is stored locally.')->willReturn($user);
        $user->setEnabled(true)->willReturn($user);
        $this->loadUserByUsername($email)->shouldReturn($user);
    }

    public function it_should_not_create_account_for_a_not_validated_paris_user(
        UserManager $manager,
        OpenAmClient $client
    ) {
        $email = 'paris_account_not_validated@cap-collectif.com';
        $this->beConstructedWith($manager, $client);
        $manager->findUserBy(['parisId' => $email])->willReturn(null);
        $client->getUserInformations($email)->willReturn(['validatedAccount' => ['false']]);
        $this->shouldThrow()->during('loadUserByUsername', [$email]);
    }
}

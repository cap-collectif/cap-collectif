<?php

namespace spec\Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Exception\CasAuthenticationException;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Core\User\CasUserProvider;
use Capco\UserBundle\Security\Service\CapebUserFilter;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class CasUserProviderSpec extends ObjectBehavior
{
    public function it_can_check_if_it_is_possible_to_load_a_user_by_username(
        UserManager $userManager,
        User $user
    ) {
        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');

        $user
            ->setCasId('fake-cas-id')
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setUsername('fake-cas-id')
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user
            ->setEmail('fake-cas-id@fake-email-cap-collectif.com')
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $userManager->updateUser($user)->shouldBeCalled();
        $userManager->findUserBy(['casId' => 'fake-cas-id'])->shouldBeCalled();

        $this->loadUserByUsername('fake-cas-id')->shouldReturn($user);
    }

    public function it_should_not_throw_exception_for_authorized_cas_user(
        UserManager $userManager,
        User $user
    ) {
        $casId = 'RomaneA';
        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user->getId()->willReturn('<some uuid>');

        $user
            ->setCasId($casId)
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $user
            ->setUsername($casId)
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user
            ->setEmail($casId . '@fake-email-cap-collectif.com')
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $userManager->updateUser($user)->shouldBeCalled();
        $userManager->findUserBy(['casId' => $casId])->shouldBeCalled();

        $this->loadUserByUsername($casId)->shouldReturn($user);

        $this->shouldNotThrow(
            new CasAuthenticationException(
                'Vous n\'êtes pas autorisé à accéder à cet espace, désolé. Pour toute question, contactez votre administrateur réseau'
            )
        )->during('loadUserByUsername', [$casId]);
    }

    public function it_can_check_if_the_user_class_is_supported()
    {
        $this->supportsClass(User::class)->shouldReturn(true);

        $this->supportsClass(Group::class)->shouldReturn(false);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CasUserProvider::class);
    }

    public function let(UserManager $userManager, GroupMutation $groupMutation, CapebUserFilter $capebUserFilter, LoggerInterface $logger)
    {
        $this->beConstructedWith($userManager, $groupMutation, $capebUserFilter, $logger);
    }
}

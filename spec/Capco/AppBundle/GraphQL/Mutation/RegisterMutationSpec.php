<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\GraphQL\Mutation\RegisterMutation;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Capco\UserBundle\Handler\UserInvitationHandler;
use DG\BypassFinals;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

BypassFinals::enable();

/**
 * @extends ObjectBehavior<string, string>
 */
class RegisterMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        Manager $toggleManager,
        UserInviteRepository $userInviteRepository,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        UserManagerInterface $userManager,
        TokenGeneratorInterface $tokenGenerator,
        FOSNotifier $notifier,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        UserInvitationHandler $userInvitationHandler,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        EntityManagerInterface $em,
        RateLimiter $rateLimiter,
        RequestGuesser $requestGuesser
    ): void {
        $this->beConstructedWith(
            $toggleManager,
            $userInviteRepository,
            $logger,
            $translator,
            $userManager,
            $tokenGenerator,
            $notifier,
            $formFactory,
            $responsesFormatter,
            $userInvitationHandler,
            $organizationInvitationRepository,
            $em,
            $rateLimiter,
            $requestGuesser
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(RegisterMutation::class);
    }

    public function it_should_check_rate_limit(
        Arg $args,
        RateLimiter $rateLimiter,
        RequestGuesser $requestGuesser
    ): void {
        $args->getArrayCopy()->willReturn([
            'invitationToken' => 'theToken',
            'email' => 'toto@test.com',
            'locale' => null,
        ]);
        $this->getMockedGraphQLArgumentFormatted($args);

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('any-ip')
        ;
        $rateLimiter->setLimit(Argument::type('int'))->shouldBeCalled();
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(false)
        ;

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(2);
        $payload['errorsCode']->shouldBe([RegisterMutation::RATE_LIMIT_REACHED]);
        $payload['user']->shouldBe(null);
    }

    public function it_register_a_user_invited_to_an_organization_and_join_it(
        PendingOrganizationInvitation $organizationInvitation,
        OrganizationMember $organizationMember,
        User $user,
        UserManager $userManager,
        Organization $organization,
        Arg $args,
        Manager $toggleManager,
        FormFactory $formFactory,
        Form $form,
        UserInviteRepository $userInviteRepository,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        UserInvitationHandler $userInvitationHandler,
        RateLimiter $rateLimiter,
        RequestGuesser $requestGuesser
    ): void {
        $args->getArrayCopy()->willReturn([
            'invitationToken' => 'theToken',
            'email' => 'toto@test.com',
            'locale' => null,
        ]);

        $this->getMockedGraphQLArgumentFormatted($args);

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('any-ip')
        ;
        $rateLimiter->setLimit(Argument::type('int'))->shouldBeCalled();
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(true)
        ;

        $userInviteRepository
            ->findOneByTokenNotExpiredAndEmail('theToken', 'toto@test.com')
            ->willReturn(null)
        ;
        $organizationInvitationRepository
            ->findOneBy(['token' => 'theToken', 'email' => 'toto@test.com'])
            ->willReturn($organizationInvitation)
        ;
        $organizationInvitation->getEmail()->willReturn('toto@test.com');
        $organizationInvitation->getToken()->willReturn('theToken');
        $organizationInvitation->getOrganization()->willReturn($organization);
        $organizationInvitation->getRole()->willReturn('ROLE_ADMIN');

        $toggleManager->isActive(Manager::registration)->willReturn(true);
        $toggleManager->isActive(Manager::multilangue)->willReturn(false);
        $userManager
            ->createUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $formFactory
            ->create(ApiRegistrationFormType::class, Argument::type(User::class))
            ->willReturn($form)
        ;
        $form->submit(['email' => 'toto@test.com'], false)->willReturn(null);

        $form->isValid()->willReturn(true);

        $user->setEnabled(true)->shouldBeCalled();
        $user->getEmail()->willReturn('toto@test.com');
        $userInvitationHandler->handleUserInvite($user->getWrappedObject())->shouldBeCalled();
        $userInvitationHandler
            ->handleUserOrganizationInvite($user->getWrappedObject())
            ->shouldBeCalled()
        ;
        $userManager->updatePassword($user->getWrappedObject())->shouldBeCalled();
        $organizationsMembers = new ArrayCollection([$organizationMember->getWrappedObject()]);
        $user->getMemberOfOrganizations()->willReturn($organizationsMembers);
        $organization->addMember(Argument::type(OrganizationMember::class))->shouldBeCalled();
        $user->addMemberOfOrganization(Argument::type(OrganizationMember::class))->shouldBeCalled();
        $userManager->updateUser($user->getWrappedObject())->shouldBeCalled();

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(2);
        $payload['errorsCode']->shouldBe(null);
        $payload['user']->shouldBe($user);
    }
}

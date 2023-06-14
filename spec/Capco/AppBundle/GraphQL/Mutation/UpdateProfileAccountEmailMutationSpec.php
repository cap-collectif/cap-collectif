<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UpdateUserEmailErrorCode;
use Capco\AppBundle\GraphQL\Mutation\UpdateProfileAccountEmailMutation;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;
use Symfony\Component\Security\Core\Encoder\PasswordEncoderInterface;

class UpdateProfileAccountEmailMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        UserManager $userManager,
        Publisher $publisher,
        EncoderFactoryInterface $encoderFactory,
        EmailDomainRepository $emailDomainRepository,
        Manager $toggleManager,
        TokenGeneratorInterface $tokenGenerator,
        RateLimiter $rateLimiter
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $logger,
            $userRepository,
            $userManager,
            $publisher,
            $encoderFactory,
            $emailDomainRepository,
            $toggleManager,
            $tokenGenerator,
            $rateLimiter
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateProfileAccountEmailMutation::class);
    }

    public function it_should_fail_if_password_is_incorrect(
        EncoderFactoryInterface $encoderFactory,
        PasswordEncoderInterface $passwordEncoder,
        Arg $args,
        User $viewer
    ) {
        $args->getArrayCopy()->willReturn([
            'email' => 'someone@email.com',
            'passwordConfirm' => 'anything',
        ]);
        $viewer
            ->hasPassword()
            ->shouldBeCalled()
            ->willReturn(true);
        $viewer
            ->getPassword()
            ->shouldBeCalled()
            ->willReturn('anything');
        $viewer
            ->getSalt()
            ->shouldBeCalled()
            ->willReturn('');
        $passwordEncoder
            ->isPasswordValid(Argument::any(), Argument::any(), Argument::any())
            ->willReturn(false);
        $encoderFactory->getEncoder($viewer)->willReturn($passwordEncoder);

        $payload = $this->__invoke($args, $viewer);
        $payload->shouldHaveCount(1);
        $payload['error']->shouldBe(UpdateUserEmailErrorCode::SPECIFY_PASSWORD);
    }

    public function it_should_check_rate_limiting(RateLimiter $rateLimiter, Arg $args, User $viewer)
    {
        $args->getArrayCopy()->willReturn([
            'email' => 'someone@email.com',
            'passwordConfirm' => 'anything',
        ]);
        $viewer
            ->hasPassword()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->getId()
            ->shouldBeCalled()
            ->willReturn('abc123');

        $rateLimiter->setLimit(Argument::type('int'))->willReturn($rateLimiter);
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn(false);

        $payload = $this->__invoke($args, $viewer);
        $payload->shouldHaveCount(1);
        $payload['error']->shouldBe(RateLimiter::LIMIT_REACHED);
    }

    public function it_should_check_if_email_is_already_in_use(
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        User $existingUser,
        User $viewer
    ) {
        $args->getArrayCopy()->willReturn([
            'email' => 'someone@email.com',
            'passwordConfirm' => 'anything',
        ]);
        $viewer
            ->hasPassword()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->getId()
            ->shouldBeCalled()
            ->willReturn('abc123');

        $userRepository
            ->findOneByEmail('someone@email.com')
            ->shouldBeCalled()
            ->willReturn($existingUser);
        $rateLimiter->setLimit(Argument::type('int'))->willReturn($rateLimiter);
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->willReturn(true);

        $payload = $this->__invoke($args, $viewer);
        $payload->shouldHaveCount(1);
        $payload['error']->shouldBe(UpdateUserEmailErrorCode::ALREADY_USED_EMAIL);
    }

    public function it_should_check_email_domain(
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Manager $toggleManager,
        EmailDomainRepository $emailDomainRepository,
        Arg $args,
        User $viewer
    ) {
        $args->getArrayCopy()->willReturn([
            'email' => 'someone@email.com',
            'passwordConfirm' => 'anything',
        ]);
        $viewer
            ->hasPassword()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->getId()
            ->shouldBeCalled()
            ->willReturn('abc123');

        $userRepository
            ->findOneByEmail('someone@email.com')
            ->shouldBeCalled()
            ->willReturn(null);
        $rateLimiter->setLimit(Argument::type('int'))->willReturn($rateLimiter);
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->willReturn(true);
        $toggleManager
            ->isActive('restrict_registration_via_email_domain')
            ->shouldBeCalled()
            ->willReturn(true);
        $emailDomainRepository
            ->findOneBy(Argument::type('array'))
            ->shouldBeCalled()
            ->willReturn(null);

        $payload = $this->__invoke($args, $viewer);
        $payload->shouldHaveCount(1);
        $payload['error']->shouldBe(UpdateUserEmailErrorCode::UNAUTHORIZED_EMAIL_DOMAIN);
    }

    public function it_should_update_user_email(
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Manager $toggleManager,
        FormFactoryInterface $formFactory,
        FormInterface $form,
        Publisher $publisher,
        UserManager $userManager,
        TokenGeneratorInterface $tokenGenerator,
        Arg $args,
        User $viewer
    ) {
        $args->getArrayCopy()->willReturn([
            'email' => 'someone@email.com',
            'passwordConfirm' => 'anything',
        ]);
        $viewer
            ->hasPassword()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->getId()
            ->shouldBeCalled()
            ->willReturn('abc123');
        $viewer
            ->setNewEmailConfirmationToken(Argument::type('string'))
            ->shouldBeCalled()
            ->willReturn($viewer);

        $userRepository
            ->findOneByEmail('someone@email.com')
            ->shouldBeCalled()
            ->willReturn(null);
        $rateLimiter->setLimit(Argument::type('int'))->willReturn($rateLimiter);
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->willReturn(true);
        $toggleManager
            ->isActive('restrict_registration_via_email_domain')
            ->shouldBeCalled()
            ->willReturn(false);
        $form
            ->submit(Argument::type('array'), false)
            ->shouldBeCalled()
            ->willReturn(true);
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true);
        $formFactory
            ->create(Argument::any(), Argument::any(), Argument::type('array'))
            ->shouldBeCalled()
            ->willReturn($form);
        $tokenGenerator
            ->generateToken()
            ->shouldBeCalled()
            ->willReturn('some-token');
        $publisher
            ->publish(Argument::type('string'), Argument::type(Message::class))
            ->shouldBeCalled();
        $userManager->updateUser($viewer)->shouldBeCalled();

        $payload = $this->__invoke($args, $viewer);
        $payload->shouldHaveCount(1);
        $payload['viewer']->shouldBe($viewer);
    }
}

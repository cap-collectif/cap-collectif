<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Newsletter;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\Newsletter\SubscribeNewsletterMutation;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class SubscribeNewsletterMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter
    ) {
        $this->beConstructedWith(
            $toggleManager,
            $logger,
            $captchaChecker,
            new RequestGuesser(new RequestStack()),
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SubscribeNewsletterMutation::class);
    }

    public function it_should_have_newsletter_toggle_on(Manager $toggleManager, Arg $args)
    {
        $toggleManager->isActive(Manager::newsletter)->willReturn(false);
        $this->getMockedGraphQLArgumentFormatted($args);

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(SubscribeNewsletterMutation::FEATURE_NOT_ENABLED);
    }

    public function it_should_have_a_captcha(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $request = Request::create('', 'POST', [], [], [], ['REMOTE_ADDR' => '']);

        $this->beConstructedWithRequest(
            $request,
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );

        $email = 'something@email.com';

        $toggleManager->isActive(Manager::newsletter)->willReturn(true);
        $toggleManager
            ->hasOneActive([Manager::captcha, Manager::turnstile_captcha])
            ->willReturn(true)
        ;
        $captchaChecker
            ->__invoke(Argument::type('string'), Argument::type('string'))
            ->shouldNotBeCalled()
        ;
        $args->getArrayCopy()->willReturn(['email' => $email]);

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(SubscribeNewsletterMutation::INVALID_CAPTCHA);
    }

    public function it_should_have_a_valid_captcha(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $request = Request::create('', 'POST', [], [], [], ['REMOTE_ADDR' => '']);

        $this->beConstructedWithRequest(
            $request,
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );

        $email = 'something@email.com';
        $captcha = 'whatever';

        $toggleManager->isActive(Manager::newsletter)->willReturn(true);
        $toggleManager
            ->hasOneActive([Manager::captcha, Manager::turnstile_captcha])
            ->willReturn(true)
        ;
        $captchaChecker
            ->__invoke($captcha, '')
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $args->getArrayCopy()->willReturn(['email' => $email, 'captcha' => $captcha]);

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(SubscribeNewsletterMutation::INVALID_CAPTCHA);
    }

    public function it_should_not_validate_captcha_if_feature_is_disabled(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $email = $this->getEmailToSubscribe(
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter,
            $args,
            $form
        );

        $this->__invoke($args);
    }

    public function it_should_have_a_valid_email(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $request = Request::create('', 'POST', [], [], [], ['REMOTE_ADDR' => '']);

        $this->beConstructedWithRequest(
            $request,
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );

        $email = '';

        $toggleManager->isActive(Manager::newsletter)->willReturn(true);
        $toggleManager
            ->hasOneActive([Manager::captcha, Manager::turnstile_captcha])
            ->willReturn(false)
        ;
        $args->getArrayCopy()->willReturn(['email' => $email]);

        $formFactory
            ->create(
                NewsletterSubscriptionType::class,
                Argument::type(NewsletterSubscription::class)
            )
            ->shouldBeCalledOnce()
            ->willReturn($form)
        ;
        $form->submit(['email' => $email], false)->shouldBeCalledOnce();
        $form->isValid()->willReturn(false);
        $form->getErrors(Argument::any(), Argument::any())->willReturn([]);
        $form->all()->willReturn([]);

        $this->shouldThrow(GraphQLException::class)->during('__invoke', [$args]);
    }

    public function it_should_subscribe_new_email(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $email = $this->getEmailToSubscribe(
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter,
            $args,
            $form
        );

        $publisher
            ->publish(Argument::type('string'), Argument::type(Message::class))
            ->shouldBeCalledOnce()
        ;

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['email']->shouldBe($email);
    }

    public function it_should_subscribe_existing_subscription(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $email = $this->getEmailToSubscribe(
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter,
            $args,
            $form
        );

        $newsletterSubscription = new NewsletterSubscription();
        $newsletterSubscription->setEmail($email);
        $newsletterSubscription->setIsEnabled(false);
        $newsletterSubscriptionRepository
            ->findOneBy(Argument::type('array'))
            ->shouldBeCalledOnce()
            ->willReturn($newsletterSubscription)
        ;

        $publisher
            ->publish(Argument::type('string'), Argument::type(Message::class))
            ->shouldBeCalledOnce()
        ;

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['email']->shouldBe($email);
    }

    public function it_should_subscribe_existing_user(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $email = $this->getEmailToSubscribe(
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter,
            $args,
            $form
        );

        $user = new User();
        $user->setEmail($email);
        $user->setConsentExternalCommunication(false);
        $user->getNotificationsConfiguration()->setUser($user);
        $userRepository
            ->findOneBy(Argument::type('array'))
            ->shouldBeCalledOnce()
            ->willReturn($user)
        ;

        $publisher
            ->publish(Argument::type('string'), Argument::type(Message::class))
            ->shouldBeCalledOnce()
        ;

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['email']->shouldBe($email);
    }

    public function it_should_check_rate_limiting(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args
    ) {
        $this->getMockedGraphQLArgumentFormatted($args);
        $request = Request::create('', 'POST', [], [], [], ['REMOTE_ADDR' => '']);

        $this->beConstructedWithRequest(
            $request,
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );
        $toggleManager->isActive(Manager::newsletter)->willReturn(true);

        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->willReturn(false)
        ;

        $payload = $this->__invoke($args);
        $payload->shouldHaveCount(1);
        $payload['errorCode']->shouldBe(SubscribeNewsletterMutation::RATE_LIMIT_REACHED);
    }

    protected function beConstructedWithRequest(
        Request $request,
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter
    ): void {
        $requestStack = new RequestStack();
        $requestStack->push($request);

        $rateLimiter->setLimit(Argument::type('int'))->willReturn($rateLimiter);
        $rateLimiter
            ->canDoAction(Argument::type('string'), Argument::type('string'))
            ->willReturn(true)
        ;

        $this->beConstructedWith(
            $toggleManager,
            $logger,
            $captchaChecker,
            new RequestGuesser($requestStack),
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );
    }

    private function getEmailToSubscribe(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        Arg $args,
        FormInterface $form
    ): string {
        $request = Request::create('', 'POST', [], [], [], ['REMOTE_ADDR' => '']);

        $this->beConstructedWithRequest(
            $request,
            $toggleManager,
            $logger,
            $captchaChecker,
            $publisher,
            $formFactory,
            $entityManager,
            $newsletterSubscriptionRepository,
            $userRepository,
            $rateLimiter
        );

        $email = 'something@email.com';

        $toggleManager->isActive(Manager::newsletter)->willReturn(true);
        $args->getArrayCopy()->willReturn(['email' => $email]);
        $toggleManager
            ->hasOneActive([Manager::captcha, Manager::turnstile_captcha])
            ->willReturn(false)
        ;
        $captchaChecker
            ->__invoke(Argument::type('string'), Argument::type('string'))
            ->shouldNotBeCalled()
        ;
        $formFactory
            ->create(
                NewsletterSubscriptionType::class,
                Argument::type(NewsletterSubscription::class)
            )
            ->shouldBeCalledOnce()
            ->willReturn($form)
        ;
        $form->submit(['email' => $email], false)->shouldBeCalledOnce();
        $form
            ->isValid()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        return $email;
    }
}

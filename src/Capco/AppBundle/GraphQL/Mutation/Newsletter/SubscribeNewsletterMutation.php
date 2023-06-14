<?php

namespace Capco\AppBundle\GraphQL\Mutation\Newsletter;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class SubscribeNewsletterMutation implements MutationInterface
{
    const FEATURE_NOT_ENABLED = 'FEATURE_NOT_ENABLED';
    const INVALID_CAPTCHA = 'INVALID_CAPTCHA';
    const EMAIL_ALREADY_SUBSCRIBED = 'EMAIL_ALREADY_SUBSCRIBED';
    public const RATE_LIMITER_ACTION = 'RegisterMutation';
    public const RATE_LIMIT_REACHED = 'RATE_LIMIT_REACHED';

    private Manager $toggleManager;
    private LoggerInterface $logger;
    private CaptchaChecker $captchaChecker;
    private RequestGuesser $requestGuesser;
    private Publisher $publisher;
    private FormFactoryInterface $formFactory;
    private EntityManagerInterface $entityManager;
    private NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    private UserRepository $userRepository;
    private RateLimiter $rateLimiter;

    public function __construct(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        RequestGuesser $requestGuesser,
        Publisher $publisher,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter
    ) {
        $this->toggleManager = $toggleManager;
        $this->logger = $logger;
        $this->captchaChecker = $captchaChecker;
        $this->requestGuesser = $requestGuesser;
        $this->publisher = $publisher;
        $this->formFactory = $formFactory;
        $this->entityManager = $entityManager;
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->userRepository = $userRepository;
        $this->rateLimiter = $rateLimiter;
    }

    public function __invoke(Argument $args): array
    {
        if (!$this->toggleManager->isActive(Manager::newsletter)) {
            return ['errorCode' => self::FEATURE_NOT_ENABLED];
        }

        if (
            !$this->rateLimiter
                ->setLimit(3)
                ->canDoAction(self::RATE_LIMITER_ACTION, $this->requestGuesser->getClientIp())
        ) {
            return ['errorCode' => self::RATE_LIMIT_REACHED];
        }

        $data = $args->getArrayCopy();

        $ip = $this->requestGuesser->getClientIp();
        $email = $data['email'];

        if (
            $this->toggleManager->hasOneActive([Manager::captcha, Manager::turnstile_captcha]) &&
            (!isset($data['captcha']) || !$this->captchaChecker->__invoke($data['captcha'], $ip))
        ) {
            $this->logger->warning('Someone is certainly trying to bruteforce an email', [
                'email' => $email,
            ]);

            return ['errorCode' => self::INVALID_CAPTCHA];
        }

        unset($data['captcha']);

        $subscription = new NewsletterSubscription();
        $subscription->setEmail($email);

        $form = $this->formFactory->create(NewsletterSubscriptionType::class, $subscription);

        /** @var NewsletterSubscription $existingNewsletterSubscription */
        $existingNewsletterSubscription = $this->newsletterSubscriptionRepository->findOneBy([
            'email' => $subscription->getEmail(),
        ]);

        if ($existingNewsletterSubscription && $existingNewsletterSubscription->getIsEnabled()) {
            return ['errorCode' => self::EMAIL_ALREADY_SUBSCRIBED];
        }

        $form->submit($data, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        /** @var User $userToNotify */
        $userToNotify = $this->userRepository->findOneBy([
            'email' => $subscription->getEmail(),
        ]);
        $em = $this->entityManager;

        if ($userToNotify) {
            $userNotification = $userToNotify->getNotificationsConfiguration();
            if (!$userNotification->isConsentExternalCommunication()) {
                $userToNotify->setNotificationsConfiguration(
                    $userNotification->setConsentExternalCommunication(true)
                );
                $this->pushToSendinblue('addUserToSendinblue', [
                    'user' => $userToNotify,
                ]);
            }
        } elseif (!$existingNewsletterSubscription) {
            $em->persist($subscription);
            $this->pushToSendinblue('addEmailToSendinblue', [
                'email' => $subscription->getEmail(),
            ]);
        } elseif (!$existingNewsletterSubscription->getIsEnabled()) {
            $existingNewsletterSubscription->setIsEnabled(true);
            $this->pushToSendinblue('addEmailToSendinblue', [
                'email' => $existingNewsletterSubscription->getEmail(),
            ]);
        }

        $em->flush();

        return ['email' => $email];
    }

    private function pushToSendinblue(string $method, array $args): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => $method,
                    'args' => $args,
                ])
            )
        );
    }
}

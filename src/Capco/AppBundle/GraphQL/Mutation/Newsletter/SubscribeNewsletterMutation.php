<?php

namespace Capco\AppBundle\GraphQL\Mutation\Newsletter;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Form\NewsletterSubscriptionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
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
use Symfony\Component\Form\FormFactoryInterface;

class SubscribeNewsletterMutation implements MutationInterface
{
    use MutationTrait;

    final public const FEATURE_NOT_ENABLED = 'FEATURE_NOT_ENABLED';
    final public const INVALID_CAPTCHA = 'INVALID_CAPTCHA';
    final public const EMAIL_ALREADY_SUBSCRIBED = 'EMAIL_ALREADY_SUBSCRIBED';
    final public const RATE_LIMITER_ACTION = 'RegisterMutation';
    final public const RATE_LIMIT_REACHED = 'RATE_LIMIT_REACHED';

    private readonly Manager $toggleManager;
    private readonly LoggerInterface $logger;
    private readonly CaptchaChecker $captchaChecker;
    private readonly RequestGuesser $requestGuesser;
    private readonly FormFactoryInterface $formFactory;
    private EntityManagerInterface $entityManager;
    private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    private readonly UserRepository $userRepository;
    private readonly RateLimiter $rateLimiter;
    private readonly SendInBluePublisher $sendInBluePublisher;

    public function __construct(
        Manager $toggleManager,
        LoggerInterface $logger,
        CaptchaChecker $captchaChecker,
        RequestGuesser $requestGuesser,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $entityManager,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        RateLimiter $rateLimiter,
        SendInBluePublisher $sendInBluePublisher
    ) {
        $this->toggleManager = $toggleManager;
        $this->logger = $logger;
        $this->captchaChecker = $captchaChecker;
        $this->requestGuesser = $requestGuesser;
        $this->formFactory = $formFactory;
        $this->entityManager = $entityManager;
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->userRepository = $userRepository;
        $this->rateLimiter = $rateLimiter;
        $this->sendInBluePublisher = $sendInBluePublisher;
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
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
            $this->toggleManager->hasOneActive([Manager::captcha, Manager::turnstile_captcha])
            && (!isset($data['captcha']) || !$this->captchaChecker->__invoke($data['captcha'], $ip))
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
                $this->sendInBluePublisher->pushToSendinblue('addUserToSendInBlue', [
                    'user' => $userToNotify,
                ]);
            }
        } elseif (!$existingNewsletterSubscription) {
            $em->persist($subscription);
            $this->sendInBluePublisher->pushToSendinblue('addEmailToSendInBlue', [
                'email' => $subscription->getEmail(),
            ]);
        } elseif (!$existingNewsletterSubscription->getIsEnabled()) {
            $existingNewsletterSubscription->setIsEnabled(true);
            $this->sendInBluePublisher->pushToSendinblue('addEmailToSendInBlue', [
                'email' => $existingNewsletterSubscription->getEmail(),
            ]);
        }

        $em->flush();

        return ['email' => $email];
    }
}

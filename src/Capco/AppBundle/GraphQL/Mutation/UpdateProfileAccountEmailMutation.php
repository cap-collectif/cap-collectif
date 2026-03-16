<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UpdateUserEmailErrorCode;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Service\User\AccountConfirmationSender;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiProfileAccountFormType;
use Capco\UserBundle\Form\Type\CreatePasswordFormType;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;

class UpdateProfileAccountEmailMutation extends BaseUpdateProfile
{
    use MutationTrait;

    final public const RATE_LIMITER_ACTION = 'UpdateProfileAccountEmail';

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        UserRepository $userRepository,
        private readonly UserManager $userManager,
        private readonly Publisher $publisher,
        private readonly EncoderFactoryInterface $encoderFactory,
        private readonly EmailDomainRepository $emailDomainRepository,
        private readonly Manager $toggleManager,
        private readonly TokenGeneratorInterface $tokenGenerator,
        private readonly RateLimiter $rateLimiter,
        private readonly AccountConfirmationSender $accountConfirmationSender
    ) {
        parent::__construct($em, $formFactory, $logger, $userRepository);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        $newEmailToConfirm = $arguments['email'];
        $password = $arguments['passwordConfirm'];
        $encoder = $this->encoderFactory->getEncoder($viewer);
        $hasPassword = $viewer->hasPassword();
        $shouldPersistNewPassword = false;
        $isPasswordValid = false;

        if (true === $hasPassword) {
            $isPasswordValid = $encoder->isPasswordValid($viewer->getPassword(), $password, $viewer->getSalt());

            // Some accounts are hashed with algorithms that can be validated natively.
            if (
                !$isPasswordValid
                && \is_string($viewer->getPassword())
                && '' !== $viewer->getPassword()
                && \is_string($password)
                && '' !== $password
            ) {
                $isPasswordValid = password_verify($password, $viewer->getPassword());
            }
        }

        $validateNewPassword = function () use ($password): ?array {
            $createPasswordForm = $this->formFactory->create(CreatePasswordFormType::class, null, [
                'csrf_protection' => false,
            ]);
            $createPasswordForm->submit(
                [
                    'plainPassword' => $password,
                ],
                false
            );

            if (!$createPasswordForm->isValid()) {
                return ['error' => UpdateUserEmailErrorCode::PASSWORD_NOT_VALID];
            }

            return null;
        };

        if (
            true === $hasPassword
            && !$isPasswordValid
        ) {
            return ['error' => UpdateUserEmailErrorCode::SPECIFY_PASSWORD];
        }
        if (false === $hasPassword) {
            if ($this->isFranceConnectAccount($viewer)) {
                $error = $validateNewPassword();
                if ($error) {
                    return $error;
                }
                $shouldPersistNewPassword = true;
            }
        }

        $this->rateLimiter->setLimit(3);

        if (
            false === $this->rateLimiter->canDoAction(self::RATE_LIMITER_ACTION, $viewer->getId())
        ) {
            return ['error' => RateLimiter::LIMIT_REACHED];
        }

        if ($this->userRepository->findOneByEmail($newEmailToConfirm)) {
            return ['error' => UpdateUserEmailErrorCode::ALREADY_USED_EMAIL];
        }

        if (
            $this->toggleManager->isActive('restrict_registration_via_email_domain')
            && !$this->emailDomainRepository->findOneBy([
                'value' => explode('@', (string) $newEmailToConfirm)[1],
            ])
        ) {
            return ['error' => UpdateUserEmailErrorCode::UNAUTHORIZED_EMAIL_DOMAIN];
        }

        $form = $this->formFactory->create(ApiProfileAccountFormType::class, $viewer, [
            'csrf_protection' => false,
        ]);
        $form->submit(['newEmailToConfirm' => $newEmailToConfirm], false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        // We generate a confirmation token to validate the new email
        $token = $this->tokenGenerator->generateToken();
        $viewer->setNewEmailConfirmationToken($token);

        if ($shouldPersistNewPassword) {
            $viewer->setPlainPassword($password);
        }

        $this->userManager->updateUser($viewer);

        if ($shouldPersistNewPassword) {
            $this->publisher->publish(
                'user.password',
                new Message(
                    $this->encodeMessagePayload([
                        'userId' => $viewer->getId(),
                    ])
                )
            );
            $this->accountConfirmationSender->sendIfNeeded($viewer);
        }

        $this->publisher->publish(
            'user.email',
            new Message(
                $this->encodeMessagePayload([
                    'userId' => $viewer->getId(),
                ])
            )
        );

        return ['viewer' => $viewer];
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function encodeMessagePayload(array $payload): string
    {
        try {
            return json_encode($payload, \JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new \RuntimeException('Unable to encode message payload.', 0, $exception);
        }
    }

    private function isFranceConnectAccount(User $viewer): bool
    {
        try {
            return $viewer->isFranceConnectAccount();
        } catch (\Throwable) {
            return false;
        }
    }
}

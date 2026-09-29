<?php

namespace Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Enum\NewsletterSubscriptionErrorCode;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class NewsletterSubscriptionEmailValidator
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository
    ) {
    }

    /**
     * Same rules as the NewsletterSubscription entity constraints (NotBlank, Email, UniqueEntity on email).
     */
    public function getErrorCode(string $email, ?NewsletterSubscription $current = null): ?string
    {
        if (\count($this->validator->validate($email, [new NotBlank(), new Email()])) > 0) {
            return NewsletterSubscriptionErrorCode::INVALID_EMAIL;
        }

        $existing = $this->newsletterSubscriptionRepository->findOneBy(['email' => $email]);
        if ($existing instanceof NewsletterSubscription && $existing !== $current) {
            return NewsletterSubscriptionErrorCode::EMAIL_ALREADY_USED;
        }

        return null;
    }
}

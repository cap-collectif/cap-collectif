<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserSubscribedToNewsLetterAtResolver implements QueryInterface
{
    protected NewsletterSubscriptionRepository $newLetterRepository;

    public function __construct(NewsletterSubscriptionRepository $newsletterSubscriptionRepository)
    {
        $this->newLetterRepository = $newsletterSubscriptionRepository;
    }

    public function __invoke(User $user): ?\DateTime
    {
        /** @var NewsletterSubscription $newsLetter */
        $subscription = $this->newLetterRepository->findOneBy(['email' => $user->getEmail()]);
        if (!$subscription) {
            return null;
        }

        return $subscription->getCreatedAt();
    }
}

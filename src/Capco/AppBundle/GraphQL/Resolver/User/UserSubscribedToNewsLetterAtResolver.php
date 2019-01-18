<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserSubscribedToNewsLetterAtResolver implements ResolverInterface
{
    protected $newLetterRepository;

    public function __construct(NewsletterSubscriptionRepository $newsletterSubscriptionRepository)
    {
        $this->newLetterRepository = $newsletterSubscriptionRepository;
    }

    public function __invoke(User $user): ?\DateTime
    {
        /** @var $newsLetter NewsletterSubscription */
        $subscription = $this->newLetterRepository->findOneBy(['email' => $user->getEmail()]);
        if (!$subscription) {
            return null;
        }

        return $subscription->getCreatedAt();
    }
}

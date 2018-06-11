<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserNewsLetterResolver implements ResolverInterface
{
    protected $newLetterRepository;

    public function __construct(NewsletterSubscriptionRepository $newsletterSubscriptionRepository)
    {
        $this->newLetterRepository = $newsletterSubscriptionRepository;
    }

    public function __invoke(User $user, string $type = null)
    {
        /** @var $newsLetter NewsletterSubscription */
        $newsLetter = $this->newLetterRepository->findOneBy(['email' => $user->getEmail()]);
        if (!$newsLetter) {
            throw new UserError('No newsletter');
        }

        if ('at' === $type) {
            return $newsLetter->getCreatedAt();
        }

        return $newsLetter->getIsEnabled();
    }
}

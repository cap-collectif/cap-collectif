<?php

namespace Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateNewsletterSubscriptionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly NewsletterSubscriptionEmailValidator $emailValidator
    ) {
    }

    /**
     * @return array{newsletterSubscription: NewsletterSubscription|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $email = trim((string) $input->offsetGet('email'));
        if ($errorCode = $this->emailValidator->getErrorCode($email)) {
            return ['newsletterSubscription' => null, 'errorCode' => $errorCode];
        }

        $newsletterSubscription = (new NewsletterSubscription())
            ->setEmail($email)
            ->setIsEnabled((bool) $input->offsetGet('isEnabled'))
        ;

        $this->entityManager->persist($newsletterSubscription);
        $this->entityManager->flush();

        return ['newsletterSubscription' => $newsletterSubscription, 'errorCode' => null];
    }
}

<?php

namespace Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Enum\NewsletterSubscriptionErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateNewsletterSubscriptionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        private readonly NewsletterSubscriptionEmailValidator $emailValidator
    ) {
    }

    /**
     * @return array{newsletterSubscription: NewsletterSubscription|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $newsletterSubscription = $this->newsletterSubscriptionRepository->find($input->offsetGet('id'));
        if (!$newsletterSubscription instanceof NewsletterSubscription) {
            return ['newsletterSubscription' => null, 'errorCode' => NewsletterSubscriptionErrorCode::NOT_FOUND];
        }

        $email = trim((string) $input->offsetGet('email'));
        if ($errorCode = $this->emailValidator->getErrorCode($email, $newsletterSubscription)) {
            return ['newsletterSubscription' => null, 'errorCode' => $errorCode];
        }

        $newsletterSubscription
            ->setEmail($email)
            ->setIsEnabled((bool) $input->offsetGet('isEnabled'))
        ;

        $this->entityManager->flush();

        return ['newsletterSubscription' => $newsletterSubscription, 'errorCode' => null];
    }
}

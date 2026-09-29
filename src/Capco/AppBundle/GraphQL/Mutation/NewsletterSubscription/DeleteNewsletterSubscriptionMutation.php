<?php

namespace Capco\AppBundle\GraphQL\Mutation\NewsletterSubscription;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Enum\NewsletterSubscriptionErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteNewsletterSubscriptionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository
    ) {
    }

    /**
     * @return array{deletedNewsletterSubscriptionId: string|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        $newsletterSubscription = $this->newsletterSubscriptionRepository->find($id);
        if (!$newsletterSubscription instanceof NewsletterSubscription) {
            return ['deletedNewsletterSubscriptionId' => null, 'errorCode' => NewsletterSubscriptionErrorCode::NOT_FOUND];
        }

        $this->entityManager->remove($newsletterSubscription);
        $this->entityManager->flush();

        return ['deletedNewsletterSubscriptionId' => $id, 'errorCode' => null];
    }
}

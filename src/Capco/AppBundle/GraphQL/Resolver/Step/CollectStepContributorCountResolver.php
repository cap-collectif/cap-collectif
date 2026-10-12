<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class CollectStepContributorCountResolver implements QueryInterface
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly CollectStepContributorCountDataLoader $collectStepCountContributorDataLoader,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly PromiseAdapterInterface $adapter
    ) {
    }

    public function __invoke(CollectStep $collectStep): Promise
    {
        $viewer = $this->tokenStorage->getToken()?->getUser();
        if (!$collectStep->canDisplay($viewer instanceof User ? $viewer : null)) {
            return $this->adapter->createFulfilled(0);
        }

        try {
            return $this->collectStepCountContributorDataLoader->load([
                'collectStep' => $collectStep,
            ]);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}

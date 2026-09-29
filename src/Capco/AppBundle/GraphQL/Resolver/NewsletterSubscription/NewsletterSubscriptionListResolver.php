<?php

namespace Capco\AppBundle\GraphQL\Resolver\NewsletterSubscription;

use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class NewsletterSubscriptionListResolver implements QueryInterface
{
    public function __construct(
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;

        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->newsletterSubscriptionRepository->getPaginated(
                $search,
                $offset,
                $limit
            )
        );

        $connection = $paginator->auto($args, $this->newsletterSubscriptionRepository->countAll($search));
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving newsletter subscriptions.');
        }

        return $connection;
    }
}

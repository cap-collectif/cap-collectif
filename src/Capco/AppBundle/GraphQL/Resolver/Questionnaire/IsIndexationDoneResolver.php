<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Swarrot\SwarrotBundle\Broker\PeclFactory;

class IsIndexationDoneResolver implements ResolverInterface
{
    private $peclFactory;

    public function __construct(PeclFactory $peclFactory)
    {
        $this->peclFactory = $peclFactory;
    }

    public function __invoke(): bool
    {
        return true;
        /*
         * This condition is causing production issues.
         * It should not wait ALL elasticsearch messages.
         *
         * TODO fix me if needed.
         */
        // $queue = $this->peclFactory->getQueue('elasticsearch_indexation', 'rabbitmq');

        // return (bool) !$queue->get();
    }
}

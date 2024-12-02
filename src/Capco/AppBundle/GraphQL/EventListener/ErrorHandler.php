<?php

namespace Capco\AppBundle\GraphQL\EventListener;

use Overblog\GraphQLBundle\Error\ErrorHandler as GraphQLErrorHandler;
use Overblog\GraphQLBundle\Event\ExecutorResultEvent;
use Psr\Log\LoggerInterface;

/** https://github.com/overblog/GraphQLBundle/blob/master/docs/error-handling/index.md#custom-error-handling--formatting */
final class ErrorHandler
{
    public function __construct(private readonly LoggerInterface $logger, private readonly GraphQLErrorHandler $errorHandler, private readonly bool $throwException = false)
    {
    }

    public function onPostExecutor(ExecutorResultEvent $executorResultEvent)
    {
        $result = $executorResultEvent->getResult();
        $this->errorHandler->handleErrors($result, $this->throwException);

        $result = $result->toArray();

        if (isset($result['errors'])) {
            $this->logger->warning(__METHOD__ . ' : ' . json_encode($result['errors']));
        }
    }
}

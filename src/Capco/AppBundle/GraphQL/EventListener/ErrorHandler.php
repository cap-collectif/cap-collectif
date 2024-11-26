<?php

namespace Capco\AppBundle\GraphQL\EventListener;

use Overblog\GraphQLBundle\Error\ErrorHandler as GraphQLErrorHandler;
use Overblog\GraphQLBundle\Event\ExecutorResultEvent;
use Psr\Log\LoggerInterface;

/** https://github.com/overblog/GraphQLBundle/blob/master/docs/error-handling/index.md#custom-error-handling--formatting */
final class ErrorHandler
{
    private readonly GraphQLErrorHandler $errorHandler;

    private readonly bool $throwException;

    private readonly LoggerInterface $logger;

    public function __construct(
        LoggerInterface $logger,
        GraphQLErrorHandler $errorHandler,
        bool $throwException = false
    ) {
        $this->errorHandler = $errorHandler;
        $this->logger = $logger;
        $this->throwException = $throwException;
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

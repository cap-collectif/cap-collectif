<?php

namespace Capco\AppBundle\GraphQL\EventListener;

use Overblog\GraphQLBundle\Error\ErrorHandler as GraphQLErrorHandler;
use Overblog\GraphQLBundle\Event\ExecutorResultEvent;
use Psr\Log\LoggerInterface;

/** https://github.com/overblog/GraphQLBundle/blob/master/docs/error-handling/index.md#custom-error-handling--formatting */
final class ErrorHandler
{
    private $errorHandler;

    private $throwException;

    private $debug;

    private $logger;

    public function __construct(
        LoggerInterface $logger,
        GraphQLErrorHandler $errorHandler,
        bool $throwException = false,
        bool $debug = false
    ) {
        $this->errorHandler = $errorHandler;
        $this->logger = $logger;
        $this->throwException = $throwException;
        $this->debug = $debug;
    }

    public function onPostExecutor(ExecutorResultEvent $executorResultEvent)
    {
        $result = $executorResultEvent->getResult();
        $this->errorHandler->handleErrors($result, $this->throwException);

        $result = $result->toArray();

        if (isset($result['errors'])) {
            $this->logger->error(__METHOD__ . ' : ' . json_encode($result['errors']));
        }
    }
}

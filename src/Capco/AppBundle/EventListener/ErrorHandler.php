<?php
namespace Capco\AppBundle\EventListener;

use GraphQL\Error\Error;
use GraphQL\Error\FormattedError;
use Overblog\GraphQLBundle\Event\ExecutorResultEvent;
use Psr\Log\LoggerInterface;

class ErrorHandler
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function onPostExecutor(ExecutorResultEvent $event)
    {
        $myErrorFormatter = function (Error $error) {
            return FormattedError::createFromException($error);
        };

        $myErrorHandler = function (array $errors, callable $formatter) {
            return array_map($formatter, $errors);
        };

        $result = $event
            ->getResult()
            ->setErrorFormatter($myErrorFormatter)
            ->setErrorsHandler($myErrorHandler)
            ->toArray();

        if (isset($result['errors'])) {
            $this->logger->error(__METHOD__ . ' : ' . json_encode($result['errors']));
        }
    }
}

<?php

namespace Capco\AppBundle\Request;

use Overblog\GraphQLBundle\Request\Executor as BaseExecutor;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Request\ParserInterface;

class Executor
{
    protected $executor;
    protected $logger;

    public function __construct(BaseExecutor $executor, LoggerInterface $logger)
    {
        $this->executor = $executor;
        $this->logger = $logger;
    }

    public function execute($schemaName, array $request, $rootValue = null)
    {
        $results = $this->executor->execute($schemaName, $request, $rootValue);
        $result = $results->toArray();
        if (isset($result['errors'])) {
            $this->logger->info(
                json_encode(
                    isset($request[ParserInterface::PARAM_OPERATION_NAME])
                        ? $request[ParserInterface::PARAM_OPERATION_NAME]
                        : null
                )
            );
            $this->logger->error(__METHOD__ . ' : ' . json_encode($result['errors']));
        }

        return $results;
    }
}

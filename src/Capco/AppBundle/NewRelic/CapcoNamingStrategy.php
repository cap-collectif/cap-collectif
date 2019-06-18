<?php

namespace Capco\AppBundle\NewRelic;

use Ekino\NewRelicBundle\TransactionNamingStrategy\TransactionNamingStrategyInterface;
use Overblog\GraphQLBundle\Request\Parser;
use Overblog\GraphQLBundle\Request\ParserInterface;
use Symfony\Component\HttpFoundation\Request;

class CapcoNamingStrategy implements TransactionNamingStrategyInterface
{
    protected $requestParser;

    public function __construct(Parser $requestParser)
    {
        $this->requestParser = $requestParser;
    }

    public function getTransactionName(Request $request): string
    {
        // If it is a graphql query
        if ('graphql_multiple_endpoint' === $request->get('_route')) {
            $parameters = $this->requestParser->parse($request);

            $transactionName = $parameters[ParserInterface::PARAM_OPERATION_NAME] ?? 'Unknown query';
            // We could use a query hash instead of UnknownQuery

            return sprintf(
                '%s::%s',
                'GraphQL',
                $transactionName
            );
        }

        return $request->get('_route') ?: 'Unknown route';
    }
}

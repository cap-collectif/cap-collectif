<?php

namespace Capco\AppBundle\NewRelic;

use Ekino\NewRelicBundle\TransactionNamingStrategy\TransactionNamingStrategyInterface;
use Overblog\GraphQLBundle\Request\Parser;
use Overblog\GraphQLBundle\Request\ParserInterface;
use Symfony\Component\HttpFoundation\Request;
use GraphQL\Error\SyntaxError;

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

            try {
                $parameters = $this->requestParser->parse($request);
                
                // We could use a query hash instead of UnknownQuery
                $transactionName = $parameters[ParserInterface::PARAM_OPERATION_NAME] ?? 'Unknown query';
            } catch (SyntaxError $syntaxError) {
                $transactionName = "Syntax error query";
            }

            return sprintf(
                '%s::%s',
                'GraphQL',
                $transactionName
            );
        }

        return $request->get('_route') ?: 'Unknown route';
    }
}

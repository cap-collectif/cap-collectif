<?php

namespace Capco\AppBundle\DataCollector;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

class GraphQLCollector extends DataCollector
{
    /**
     * Collects data for the given Request and Response.
     *
     * @param Request         $request
     * @param Response        $response
     * @param \Exception|null $exception
     */
    public function collect(
        Request $request,
        Response $response,
        \Exception $exception = null
    ): void {
        $graphqlQuery =
            'graphql_multiple_endpoint' === $request->attributes->get('_route') ||
            'graphql_endpoint'
                ? json_decode($request->getContent(), true)
                : null;
        $this->data = [
            'method' => $request->getMethod(),
            'query' => $request->request->get('query', null),
            'graphql_query' => $graphqlQuery,
            'acceptable_content_types' => $request->getAcceptableContentTypes(),
        ];
    }

    public function getQuery()
    {
        return $this->data['query'];
    }

    public function getGraphQLQuery()
    {
        return $this->data['graphql_query'];
    }

    public function getMethod()
    {
        return $this->data['method'];
    }

    public function getAcceptableContentTypes()
    {
        return $this->data['acceptable_content_types'];
    }

    public function reset(): void
    {
        $this->data = [];
    }

    /**
     * Returns the name of the collector.
     *
     * @return string The collector name
     */
    public function getName(): string
    {
        return 'capco.graphql';
    }
}

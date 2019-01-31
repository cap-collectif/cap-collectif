<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Overblog\GraphQLBundle\Request as GraphQLRequest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Overblog\GraphQLBundle\Controller\GraphController as BaseController;

class GraphQLController extends BaseController
{
    public const PREVIEW_HEADER = 'application/vnd.cap-collectif.preview+json';
    /**
     * @var GraphQLRequest\BatchParser
     */
    private $batchParser;
    /**
     * @var GraphQLRequest\Executor
     */
    private $requestExecutor;
    /**
     * @var GraphQLRequest\Parser
     */
    private $requestParser;

    public function __construct(
        GraphQLRequest\ParserInterface $batchParser,
        GraphQLRequest\Executor $requestExecutor,
        GraphQLRequest\ParserInterface $requestParser
    ) {
        parent::__construct($batchParser, $requestExecutor, $requestParser, false, false);
        $this->batchParser = $batchParser;
        $this->requestExecutor = $requestExecutor;
        $this->requestParser = $requestParser;
    }

    /**
     * @Route("/graphql", name="graphql_endpoint", defaults={"_feature_flags" = "public_api"})
     * @Route("/graphql/{schemaName}", name="graphql_multiple_endpoint", requirements={"schemaName" = "public|internal"})
     */
    public function endpointAction(Request $request, string $schemaName = null)
    {
        if (!$schemaName) {
            if (self::PREVIEW_HEADER === $request->headers->get('accept')) {
                $schemaName = 'preview';
            }
            $schemaName = 'public';
        }

        return $this->createResponse($request, $schemaName, false);
    }

    // See https://github.com/overblog/GraphQLBundle/blob/master/src/Controller/GraphController.php

    /**
     * @param Request     $request
     * @param string|null $schemaName
     * @param bool        $batched
     *
     * @return JsonResponse|Response
     */
    private function createResponse(
        Request $request,
        string $schemaName = null,
        bool $batched
    ): Response {
        if ('OPTIONS' === $request->getMethod()) {
            $response = new JsonResponse([], 200);
        } else {
            if (!\in_array($request->getMethod(), ['POST', 'GET'])) {
                return new Response('', 405);
            }
            $payload = $this->processQuery($request, $schemaName, $batched);
            $response = new JsonResponse($payload, 200);
        }
        $this->addCORSHeadersIfNeeded($response, $request);

        // We had Cache headers here
        $response->setSharedMaxAge(60);
        $response->setPublic();

        return $response;
    }

    private function addCORSHeadersIfNeeded(Response $response, Request $request): void
    {
    }

    /**
     * @param Request     $request
     * @param string|null $schemaName
     * @param bool        $batched
     *
     * @return array
     */
    private function processQuery(Request $request, string $schemaName = null, bool $batched): array
    {
        if ($batched) {
            $payload = $this->processBatchQuery($request, $schemaName);
        } else {
            $payload = $this->processNormalQuery($request, $schemaName);
        }

        return $payload;
    }

    /**
     * @param Request     $request
     * @param string|null $schemaName
     *
     * @return array
     */
    private function processBatchQuery(Request $request, string $schemaName = null): array
    {
        $queries = $this->batchParser->parse($request);
        $payloads = [];
        foreach ($queries as $query) {
            $payload = $this->requestExecutor
                ->execute($schemaName, [
                    'query' => $query['query'],
                    'variables' => $query['variables'],
                ])
                ->toArray();
            if (!$this->useApolloBatchingMethod) {
                $payload = ['id' => $query['id'], 'payload' => $payload];
            }
            $payloads[] = $payload;
        }

        return $payloads;
    }

    /**
     * @param Request     $request
     * @param string|null $schemaName
     *
     * @return array
     */
    private function processNormalQuery(Request $request, string $schemaName = null): array
    {
        $params = $this->requestParser->parse($request);

        return $this->requestExecutor->execute($schemaName, $params)->toArray();
    }
}

<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Api;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Overblog\GraphQLBundle\Request as GraphQLRequest;
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

    private $logger;

    public function __construct(
        GraphQLRequest\ParserInterface $batchParser,
        GraphQLRequest\Executor $requestExecutor,
        GraphQLRequest\ParserInterface $requestParser,
        LoggerInterface $logger
    ) {
        parent::__construct($batchParser, $requestExecutor, $requestParser, false, false);
        $this->batchParser = $batchParser;
        $this->requestExecutor = $requestExecutor;
        $this->requestParser = $requestParser;
        $this->logger = $logger;
    }

    /**
     * @Route("/graphql", name="graphql_endpoint", defaults={"_feature_flags" = "public_api"}, options={"i18n" = false})
     * @Route("/graphql/{schemaName}", name="graphql_multiple_endpoint", requirements={"schemaName" = "public|internal"}, options={"i18n" = false})
     */
    public function endpointAction(Request $request, ?string $schemaName = null)
    {
        if (!$schemaName) {
            $schemaName = 'public';
            if (self::PREVIEW_HEADER === $request->headers->get('accept')) {
                $schemaName = 'preview';
            }
        }

        try {
            return $this->createResponse($request, $schemaName, false);
        } catch (BadRequestHttpException $e) {
            if ('public' === $schemaName || 'preview' === $schemaName) {
                $this->logger->warn('Wrong public query');
            } else {
                throw $e;
            }
        }
    }

    // See https://github.com/overblog/GraphQLBundle/blob/master/src/Controller/GraphController.php

    /**
     * @return JsonResponse|Response
     */
    private function createResponse(Request $request, ?string $schemaName, bool $batched): Response
    {
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

    private function processQuery(Request $request, ?string $schemaName, bool $batched): array
    {
        if ($batched) {
            $payload = $this->processBatchQuery($request, $schemaName);
        } else {
            $payload = $this->processNormalQuery($request, $schemaName);
        }

        return $payload;
    }

    private function processBatchQuery(Request $request, ?string $schemaName = null): array
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

    private function processNormalQuery(Request $request, ?string $schemaName = null): array
    {
        $params = $this->requestParser->parse($request);

        return $this->requestExecutor->execute($schemaName, $params)->toArray();
    }
}

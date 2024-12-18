<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Controller\GraphController as BaseController;
use Overblog\GraphQLBundle\Request\BatchParser;
use Overblog\GraphQLBundle\Request\Executor;
use Overblog\GraphQLBundle\Request\Parser;
use Overblog\GraphQLBundle\Request\ParserInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;

class GraphQLController extends BaseController
{
    final public const PREVIEW_HEADER = 'application/vnd.cap-collectif.preview+json';
    private const SCHEMA_PUBLIC = 'public';
    private const SCHEMA_PREVIEW = 'preview';
    private const SCHEMA_INTERNAL = 'internal';
    private const SCHEMA_DEV = 'dev';
    private const ENV_DEV = 'dev';
    private const ENV_TEST = 'test';
    private const ENV_PROD = 'prod';

    private readonly ParserInterface $batchParser;
    private readonly Executor $requestExecutor;
    private readonly Parser $requestParser;
    private readonly bool $useApolloBatchingMethod;

    public function __construct(
        BatchParser $batchParser,
        Executor $requestExecutor,
        Parser $requestParser,
        private readonly LoggerInterface $logger,
        private readonly Manager $manager,
        private readonly string $env
    ) {
        parent::__construct($batchParser, $requestExecutor, $requestParser, false, $graphqlBatchingMethod = 'apollo');
        $this->batchParser = $batchParser;
        $this->requestExecutor = $requestExecutor;
        $this->requestParser = $requestParser;
        $this->useApolloBatchingMethod = 'apollo' === $graphqlBatchingMethod;
    }

    /**
     * @Route("/graphql", name="graphql_endpoint", defaults={"_feature_flags" = "public_api"}, options={"i18n" = false})
     * @Route("/graphql/{schemaName}", name="graphql_multiple_endpoint", requirements={"schemaName" = "public|internal|dev"}, options={"i18n" = false})
     */
    public function endpointAction(Request $request, ?string $schemaName = null): Response
    {
        if (!$schemaName) {
            $schemaName = self::SCHEMA_PUBLIC;
            if (self::PREVIEW_HEADER === $request->headers->get('accept')) {
                $schemaName = self::SCHEMA_PREVIEW;
            }
        }
        if (self::SCHEMA_DEV === $schemaName && self::ENV_PROD === $this->env) {
            $this->logger->warning('trying to access dev schema in prod environment.');

            throw new BadRequestHttpException('trying to access dev schema in prod environment.');
        }

        try {
            return $this->createResponse($request, $schemaName, false);
        } catch (BadRequestHttpException $e) {
            if (self::SCHEMA_PUBLIC === $schemaName || self::SCHEMA_PREVIEW === $schemaName) {
                $this->logger->warning('Wrong public query');

                return new Response('Wrong public query', Response::HTTP_BAD_REQUEST);
            }

            throw $e;
        }
    }

    /**
     * See https://github.com/overblog/GraphQLBundle/blob/master/src/Controller/GraphController.php.
     */
    private function createResponse(Request $request, ?string $schemaName, bool $batched): Response
    {
        if ('OPTIONS' === $request->getMethod()) {
            $response = new JsonResponse([], 200);
            $this->addCORSAndCacheHeadersIfNeeded($response, $request);

            return $response;
        }

        if ('POST' !== $request->getMethod()) {
            $response = new JsonResponse('', 405);
            $this->addCORSAndCacheHeadersIfNeeded($response, $request);

            return $response;
        }

        if ($this->manager->isActive(Manager::graphql_introspection)) {
            $this->requestExecutor->enableIntrospectionQuery();
        }

        $payload = $this->processQuery($request, $schemaName, $batched);

        // look for a syntax error in graphql response
        $syntaxError = false;
        if (isset($payload['errors']) && \count($payload['errors']) > 0) {
            foreach ($payload['errors'] as $error) {
                if (str_contains((string) $error['message'], 'Syntax Error')) {
                    $syntaxError = true;

                    break;
                }
            }
        }

        $statusCode = $syntaxError ? 400 : 200;
        $response = new JsonResponse($payload, $statusCode);
        $this->addCORSAndCacheHeadersIfNeeded($response, $request);

        return $response;
    }

    private function addCORSAndCacheHeadersIfNeeded(Response $response, Request $request): void
    {
        // We make sure to handle CORS correctly in development/testing
        if (self::ENV_DEV === $this->env || self::ENV_TEST === $this->env) {
            $response->headers->set(
                'Access-Control-Allow-Origin',
                $request->headers->get('Origin') ?? '*',
                true
            );
            $response->headers->set('Access-Control-Allow-Credentials', 'true', true);
            $response->headers->set(
                'Access-Control-Allow-Headers',
                'Accept, Accept-Language, Origin, Content-Type, Authorization, SetBySymfonyShouldBeOnDevOnly',
                true
            );
            $response->headers->set('Access-Control-Allow-Methods', 'OPTIONS, POST', true);
            $response->headers->set('Access-Control-Max-Age', '3600', true);
        }

        // We had Cache headers here
        $response->setSharedMaxAge(60);
        $response->setPublic();
        $response->setVary([
            'Accept-Encoding',
            'Accept-Language',
            'Origin',
            'Access-Control-Request-Headers',
            'Access-Control-Request-Method',
        ]);
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
                ->toArray()
            ;
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

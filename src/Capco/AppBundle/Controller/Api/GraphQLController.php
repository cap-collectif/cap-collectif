<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Api;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Request\Parser;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Overblog\GraphQLBundle\Request\ParserInterface;
use Overblog\GraphQLBundle\Controller\GraphController as BaseController;

class GraphQLController extends BaseController
{
    public const PREVIEW_HEADER = 'application/vnd.cap-collectif.preview+json';

    private ParserInterface $batchParser;
    private Executor $requestExecutor;
    private Parser $requestParser;
    private LoggerInterface $logger;
    private Manager $manager;

    private string $env;

    public function __construct(
        ParserInterface $batchParser,
        Executor $requestExecutor,
        Parser $requestParser,
        LoggerInterface $logger,
        Manager $manager,
        string $env
    ) {
        parent::__construct($batchParser, $requestExecutor, $requestParser, false, false);
        $this->batchParser = $batchParser;
        $this->requestExecutor = $requestExecutor;
        $this->requestParser = $requestParser;
        $this->logger = $logger;
        $this->manager = $manager;
        $this->env = $env;
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
                if (false !== strpos($error['message'], 'Syntax Error')) {
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
        if ('dev' === $this->env || 'test' === $this->env) {
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

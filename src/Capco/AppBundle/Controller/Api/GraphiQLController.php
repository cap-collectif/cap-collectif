<?php

namespace Capco\AppBundle\Controller\Api;

use Overblog\GraphiQLBundle\Config\GraphiQLControllerEndpoint;
use Overblog\GraphiQLBundle\Config\GraphiQLViewConfig;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment as TwigEnvironment;

final class GraphiQLController
{
    public function __construct(private readonly TwigEnvironment $twig, private readonly GraphiQLViewConfig $viewConfig, private readonly GraphiQLControllerEndpoint $graphQLEndpoint)
    {
    }

    /**
     * @Route("/graphiql", name="graphiql_endpoint", defaults={"_feature_flags" = "public_api"}, options={"i18n" = false})
     * @Route("/graphiql/{schemaName}", name="graphiql_multiple_endpoint", condition="'%kernel.environment%' === 'dev'", requirements={"schemaName" = "public|internal|dev"}, options={"i18n" = false})
     *
     * @param null|mixed $schemaName
     */
    public function indexAction($schemaName = null): Response
    {
        $endpoint =
            null === $schemaName
                ? $this->graphQLEndpoint->getDefault()
                : $this->graphQLEndpoint->getBySchema($schemaName);

        return Response::create(
            $this->twig->render($this->viewConfig->getTemplate(), [
                'schemaName' => $schemaName,
                'endpoint' => $endpoint,
                'versions' => [
                    'graphiql' => $this->viewConfig->getJavaScriptLibraries()->getGraphiQLVersion(),
                    'react' => $this->viewConfig->getJavaScriptLibraries()->getReactVersion(),
                    'fetch' => $this->viewConfig->getJavaScriptLibraries()->getFetchVersion(),
                ],
            ])
        );
    }
}

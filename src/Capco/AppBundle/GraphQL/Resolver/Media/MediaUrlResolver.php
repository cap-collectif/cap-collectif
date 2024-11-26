<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class MediaUrlResolver implements QueryInterface
{
    private readonly MediaProvider $mediaProvider;
    private readonly RouterInterface $router;
    private readonly ?string $assetsHost;
    private readonly string $routerRequestContextHost;

    public function __construct(
        MediaProvider $mediaProvider,
        RouterInterface $router,
        string $routerRequestContextHost,
        ?string $assetsHost = null
    ) {
        $this->mediaProvider = $mediaProvider;
        $this->router = $router;
        $this->assetsHost = $assetsHost;
        $this->routerRequestContextHost = $routerRequestContextHost;
    }

    public function __invoke(Media $media, ?Arg $args = null, ?\ArrayObject $context = null): string
    {
        $format = $args && $args['format'] ? $args['format'] : 'reference';
        $isExportContext =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');

        $routingContext = $this->router->getContext();

        if ('reference' === $format) {
            $path =
                $routingContext->getScheme() .
                '://' .
                $routingContext->getHost() .
                '/' .
                'media' .
                $this->mediaProvider->generatePublicUrl($media, 'reference');
            if ($this->assetsHost && !$isExportContext) {
                $path = str_replace($this->routerRequestContextHost, $this->assetsHost, $path);
            }

            return $path;
        }

        return $this->assetsHost
            ? str_replace(
                $this->routerRequestContextHost,
                $this->assetsHost,
                $this->mediaProvider->generatePublicUrl($media, $format)
            )
            : $this->mediaProvider->generatePublicUrl($media, $format);
    }
}

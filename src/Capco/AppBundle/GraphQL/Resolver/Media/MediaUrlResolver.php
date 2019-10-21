<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\MediaBundle\Entity\Media;
use Sonata\MediaBundle\Provider\FileProvider;
use Sonata\MediaBundle\Provider\ImageProvider;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class MediaUrlResolver implements ResolverInterface
{

    private $imgProvider;
    private $fileProvider;
    private $router;
    private $assetsHost;
    private $routerRequestContextHost;

    public function __construct(
        ImageProvider $imgProvider,
        FileProvider $fileProvider,
        RouterInterface $router,
        string $routerRequestContextHost,
        ?string $assetsHost = null
    ) {
        $this->imgProvider = $imgProvider;
        $this->fileProvider = $fileProvider;
        $this->router = $router;
        $this->assetsHost = $assetsHost;
        $this->routerRequestContextHost = $routerRequestContextHost;
    }

    public function __invoke(Media $media, ?\ArrayObject $context = null, ?Arg $args = null): string
    {
        $format = $args && $args['format'] ? $args['format'] : 'reference';
        $isExportContext =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');

        $provider = $this->getProvider($media->getProviderName());

        if ('reference' === $format) {
            $path = $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL) .
                'media' .
                $provider->generatePublicUrl($media, 'reference');
            if ($this->assetsHost && !$isExportContext) {
                $path = str_replace(
                    $this->routerRequestContextHost,
                    $this->assetsHost,
                    $path
                );
            }
            return $path;
        }

        return $this->assetsHost ?
            str_replace(
                $this->routerRequestContextHost,
                $this->assetsHost,
                $provider->generatePublicUrl($media, $format)
            ) :
            $provider->generatePublicUrl($media, $format);
    }

    private function getProvider(string $providerName)
    {
        if ('sonata.media.provider.image' === $providerName) {
            return $this->imgProvider;
        }
        if ('sonata.media.provider.file' === $providerName) {
            return $this->fileProvider;
        }

        throw new \InvalidArgumentException('Unknown provider : ' . $providerName);
    }
}

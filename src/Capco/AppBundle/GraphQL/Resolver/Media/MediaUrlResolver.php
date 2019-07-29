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

    public function __construct(
        ImageProvider $imgProvider,
        FileProvider $fileProvider,
        RouterInterface $router
    ) {
        $this->imgProvider = $imgProvider;
        $this->fileProvider = $fileProvider;
        $this->router = $router;
    }

    public function __invoke(Media $media, ?Arg $args = null): string
    {
        $format = $args && $args['format'] ? $args['format'] : 'reference';

        $provider = $this->getProvider($media->getProviderName());

        if ('reference' === $format) {
            return $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL) .
                'media' .
                $provider->generatePublicUrl($media, 'reference');
        }

        return $provider->generatePublicUrl($media, $format);
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

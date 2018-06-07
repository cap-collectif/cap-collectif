<?php

/*
 * This file is part of the Sonata project.
 *
 * (c) Thomas Rabaix <thomas.rabaix@sonata-project.org>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Capco\MediaBundle\Thumbnail;

use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Sonata\MediaBundle\Thumbnail\ThumbnailInterface;
use Symfony\Component\Routing\RouterInterface;

class LiipImagineThumbnail implements ThumbnailInterface
{
    /**
     * @var \Symfony\Component\Routing\RouterInterface
     */
    protected $router;

    /**
     * @param \Symfony\Component\Routing\RouterInterface $router
     */
    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    /**
     * {@inheritdoc}
     */
    public function generatePublicUrl(MediaProviderInterface $provider, MediaInterface $media, $format)
    {
        if ('reference' === $format) {
            $path = $provider->getReferenceImage($media);
        } else {
            $path = $this->router->generate(
                sprintf('_imagine_%s', $format),
                ['path' => sprintf('%s/%s_%s.%s', $provider->generatePath($media), $media->getId(), $format, $this->getExtension($media))]
            );
        }

        return $provider->getCdnPath($path, $media->getCdnIsFlushable());
    }

    /**
     * {@inheritdoc}
     */
    public function generatePrivateUrl(MediaProviderInterface $provider, MediaInterface $media, $format)
    {
        if ('reference' !== $format) {
            // This bundle is madness ¯\_(ツ)_/¯
            // throw new \RuntimeException('No private url for LiipImagineThumbnail');

            return $this->generatePublicUrl($provider, $media, $format);
        }

        $path = $provider->getReferenceImage($media);

        return $path;
    }

    /**
     * {@inheritdoc}
     */
    public function generate(MediaProviderInterface $provider, MediaInterface $media)
    {
        // nothing to generate, as generated on demand
    }

    /**
     * {@inheritdoc}
     */
    public function delete(MediaProviderInterface $provider, MediaInterface $media, $formats = null)
    {
        // feature not available
    }

    /**
     * @param MediaInterface $media
     *
     * @return string the file extension for the $media, or the $defaultExtension if not available
     */
    private function getExtension(MediaInterface $media)
    {
        $ext = $media->getExtension();
        if (!is_string($ext) || 3 !== strlen($ext)) {
            $ext = 'jpg';
        }

        return $ext;
    }
}

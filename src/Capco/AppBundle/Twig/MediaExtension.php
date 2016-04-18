<?php

namespace Capco\AppBundle\Twig;

class MediaExtension extends \Twig_Extension
{
    protected $container;

    public function __construct($container)
    {
        $this->container = $container;
    }

    public function getName()
    {
        return 'media_extension';
    }

    public function getFunctions()
    {
        return [
          'media_public_url' => new \Twig_Function_Method($this, 'getMediaUrl')
        ];
    }

    public function getMediaUrl($media, $format)
    {
        if (!$media) {
          return null;
        }

        $provider = $this->container->get($media->getProviderName());
        return $provider->generatePublicUrl($media, $format);
    }
}

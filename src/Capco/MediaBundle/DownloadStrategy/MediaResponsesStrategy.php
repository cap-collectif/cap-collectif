<?php

namespace Capco\MediaBundle\DownloadStrategy;

use \Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Security\DownloadStrategyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Translation\TranslatorInterface;

class MediaResponsesDownloadStrategy implements DownloadStrategyInterface
{
    protected $translator;
    protected $container;

    public function __construct(ContainerInterface $container, TranslatorInterface $translator)
    {
        $this->translator = $translator;
        $this->container = $container;
    }

    /**
     * {@inheritdoc}
     */
    public function isGranted(MediaInterface $media, Request $request)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getDescription()
    {
        return $this->translator->trans(
            'description.media_responses_download_strategy',
            [],
            'SonataAdminBundle'
        );
    }
}

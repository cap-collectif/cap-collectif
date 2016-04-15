<?php

namespace Capco\AppBundle\Manager;

use Sonata\MediaBundle\Entity\MediaManager as SonataMediaManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediaManager
{
    protected $mediaManager;

    public function __construct(SonataMediaManager $mediaManager)
    {
        $this->mediaManager = $mediaManager;
    }

    public function createImageFromUploadedFile(UploadedFile $file)
    {
        $media = $this->mediaManager->create();
        $media->setProviderName('sonata.media.provider.image');
        $media->setBinaryContent($file);
        $media->setContext('default');
        $media->setEnabled(true);
        $this->mediaManager->save($media, false);
        return $media;
    }
}

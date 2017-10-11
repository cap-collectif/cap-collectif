<?php

namespace Capco\MediaBundle\Controller;

use Sonata\MediaBundle\Controller\MediaController as BaseController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MediaController extends BaseController
{
    /**
     * This action applies a given filter to a given image,
     * optionally saves the image and
     * outputs it to the browser at the same time.
     *
     * Note by bjaillot: duplicate from BaseController::liipImagineFilterAction
     * where the initial preg_match only handle jpg
     *
     * @param string $path
     * @param string $filter
     *
     * @return Response
     */
    public function liipImagineFilterAction($path, $filter)
    {
        if (!preg_match('@([^/]*)/(.*)/([a-z0-9\-]*)_([a-z_A-Z]*).(jpg|png|jpeg)@', $path, $matches)) {
            throw new NotFoundHttpException();
        }

        $targetPath = $this->get('liip_imagine.cache.manager')->resolve($this->get('request'), $path, $filter);

        if ($targetPath instanceof Response) {
            return $targetPath;
        }

        // get the file
        $media = $this->getMedia($matches[3]);
        if (!$media) {
            throw new NotFoundHttpException();
        }

        $provider = $this->getProvider($media);
        $file = $provider->getReferenceFile($media);

        // load the file content from the abstracted file system
        $tmpFile = sprintf('%s.%s', tempnam(sys_get_temp_dir(), 'sonata_media_liip_imagine'), $media->getExtension());
        file_put_contents($tmpFile, $file->getContent());

        $image = $this->get('liip_imagine')->open($tmpFile);

        $response = $this->get('liip_imagine.filter.manager')->get($this->get('request'), $filter, $image, $path);

        if ($targetPath) {
            $response = $this->get('liip_imagine.cache.manager')->store($response, $targetPath, $filter);
        }

        return $response;
    }
}

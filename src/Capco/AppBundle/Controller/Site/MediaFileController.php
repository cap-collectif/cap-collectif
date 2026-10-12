<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MediaFileController extends AbstractController
{
    public function __construct(private readonly string $projectDir)
    {
    }

    public function __invoke(string $path): BinaryFileResponse
    {
        $root = realpath($this->projectDir . '/public/media');
        $file = realpath($root . '/' . $path);
        if (!$root || !$file || !str_starts_with($file, $root . '/') || !is_file($file)) {
            throw new NotFoundHttpException();
        }

        return new BinaryFileResponse($file, 200, ['Cache-Control' => 'private, no-store'], false, null, false, false);
    }
}

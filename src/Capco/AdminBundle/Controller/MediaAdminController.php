<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Controller\Api\MediasController;
use Capco\AppBundle\Manager\MediaManager;
use Capco\MediaBundle\Provider\AllowedExtensions;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MediaAdminController extends AbstractController
{
    public const INPUT_NAME = 'binaryContent';

    private MediaManager $mediaManager;
    private ValidatorInterface $validator;

    public function __construct(
        MediaManager $mediaManager,
        ValidatorInterface $validator
    ) {
        $this->mediaManager = $mediaManager;
        $this->validator = $validator;
    }

    public function listAction(): Response
    {
        return $this->render('CapcoMediaBundle:MediaAdmin:list.html.twig');
    }

    /**
     * @todo used to override the sonata creation route in sonata admin pages
     * @todo use /api/files instead when possible
     */
    public function createAction(?Request $request = null)
    {
        if ($request->isMethod(Request::METHOD_POST)) {
            try {
                $newMedia = $this->mediaManager->createFileFromUploadedFile(
                    $this->getUploadedFile($request)
                );

                return new JsonResponse([
                    'result' => 'ok',
                    'objectId' => $newMedia->getId(),
                    'objectName' => $newMedia->getName(),
                ]);
            } catch (\RuntimeException $exception) {
                return new JsonResponse([
                    'result' => 'error',
                    'errors' => $exception->getMessage()
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        return $this->render("CapcoAdminBundle:Media:create.html.twig");
    }

    private function getUploadedFile(Request $request): UploadedFile
    {
        $uploadedFile = $request->files->get(self::INPUT_NAME);
        if (null === $uploadedFile) {
            throw new \RuntimeException(MediasController::NO_MEDIA_FOUND);
        }

        $this->checkUploadedFile($uploadedFile);

        return $uploadedFile;
    }

    private function checkUploadedFile(UploadedFile $uploadedFile): void
    {
        $violations = $this->validator->validate($uploadedFile, [
            new File([
                'maxSize' => '10M',
                'mimeTypes' => AllowedExtensions::ALLOWED_MIMETYPES,
            ]),
        ]);
        if ($violations->count() > 0) {
            throw new \RuntimeException(MediasController::FILE_NOT_ALLOWED);
        }
    }
}

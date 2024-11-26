<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Controller\Api\MediasController;
use Capco\AppBundle\Exception\UploadedFileException;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Provider\AllowedExtensions;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MediaAdminController extends CRUDController
{
    final public const INPUT_NAME = 'binaryContent';

    private readonly MediaManager $mediaManager;
    private readonly ValidatorInterface $validator;

    public function __construct(
        MediaManager $mediaManager,
        ValidatorInterface $validator,
        BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        Pool $pool,
    ) {
        parent::__construct($breadcrumbsBuilder, $pool);
        $this->mediaManager = $mediaManager;
        $this->validator = $validator;
    }

    /**
     * @todo used to override the sonata creation route in sonata admin pages
     * @todo use /api/files instead when possible
     */
    public function createAction(?Request $request = null): Response
    {
        /** * @var User $viewer  */
        $viewer = $this->getUser();
        if ($viewer->isOnlyUser() && null === $viewer->getOrganization()) {
            throw $this->createAccessDeniedException();
        }

        $errors = null;

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
            } catch (UploadedFileException $exception) {
                $errors = $exception->getMessage();
            }
        }

        return $this->render('@CapcoAdmin/Media/create.html.twig', [
            'errors' => $errors,
        ]);
    }

    private function getUploadedFile(Request $request): UploadedFile
    {
        $uploadedFile = $request->files->get(self::INPUT_NAME);
        if (null === $uploadedFile) {
            throw new UploadedFileException(MediasController::NO_MEDIA_FOUND);
        }

        $this->checkUploadedFile($uploadedFile);

        return $uploadedFile;
    }

    private function checkUploadedFile(UploadedFile $uploadedFile): void
    {
        $violations = $this->validator->validate($uploadedFile, [
            new File([
                'maxSize' => '10M',
                'mimeTypes' => AllowedExtensions::ALLOWED_MIMETYPES_IMAGE,
            ]),
        ]);

        if ($violations->count() > 0) {
            $errorMessages = [];
            foreach ($violations as $violation) {
                $errorMessages[] = $violation->getMessage();
            }

            throw new UploadedFileException(implode(' ', $errorMessages));
        }
    }
}

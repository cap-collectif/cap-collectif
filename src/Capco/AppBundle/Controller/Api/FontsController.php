<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Font;
use Capco\AppBundle\Font\FontProcessor;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\FontRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class FontsController extends AbstractController
{
    private const MESSAGE_INVALID_FONT_FORMAT = 'Invalid font format.';
    private const ALLOWED_MIMETYPES_FONTS = [
        'application/octet-stream',
        'application/font-sfnt',
        'font/otf',
        'font/sfnt',
        'application/font-otf',
        'application/vnd.ms-opentype',
        'application/x-font-opentype',
        'font/ttf',
        'application/font-ttf',
        'application/x-font-ttf',
        'application/x-font-truetype',
        'application/vnd.ms-fontobject',
        'font/woff',
        'application/font-woff',
        'font/woff2',
        'application/font-woff2',
        'application/zip',
    ];

    public function __construct(private readonly ValidatorInterface $validator, private readonly FontProcessor $fontProcessor, private readonly FontRepository $fontRepository, private readonly MediaUrlResolver $mediaUrlResolver, private readonly EntityManagerInterface $em)
    {
    }

    /**
     * @Route("/upload/fonts", name="upload_fonts", options={"i18n" = false})
     * @Security("is_granted('ROLE_ADMIN')")
     */
    public function postFontAction(Request $request): JsonResponse
    {
        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return $this->json([
                'code' => 400,
                'message' => 'You must provide a file.',
            ]);
        }

        $violations = $this->validator->validate($uploadedFile, [
            new File([
                'mimeTypes' => self::ALLOWED_MIMETYPES_FONTS,
                'mimeTypesMessage' => self::MESSAGE_INVALID_FONT_FORMAT,
            ]),
        ]);

        if (0 !== \count($violations)) {
            return $this->json(
                [
                    'code' => 400,
                    'message' => $violations->get(0)->getMessage(),
                ],
                400
            );
        }

        $uploadedFonts = [];
        if ('zip' === $uploadedFile->guessExtension()) {
            $uploadedFonts = $this->fontProcessor->processArchive($uploadedFile);
        } else {
            $uploadedFonts[] = $this->fontProcessor->processFont($uploadedFile);
        }

        foreach ($uploadedFonts as $uploadedFont) {
            if ($this->fontRepository->findOneByUploadedFont($uploadedFont)) {
                continue;
            }

            $font = Font::fromUploadedFont($uploadedFont);
            $font->setFile($this->createFontMedia($uploadedFont));

            $this->em->persist($font);
        }
        $this->em->flush();

        if (\count($uploadedFonts) > 0) {
            $lastUploadedFont = $this->fontRepository->getLastUploadedFont();

            if (!$lastUploadedFont) {
                throw new \LogicException('Could not get last uploaded font');
            }

            return $this->json([
                'id' => GlobalId::toGlobalId('Font', $lastUploadedFont->getId()),
                'isCustom' => $lastUploadedFont->isCustom(),
                'url' => $lastUploadedFont->getFile()
                    ? $this->mediaUrlResolver->__invoke($lastUploadedFont->getFile())
                    : null,
                'name' => $lastUploadedFont->getName(),
                'useAsHeading' => $lastUploadedFont->getUseAsHeading(),
                'useAsBody' => $lastUploadedFont->getUseAsBody(),
            ], 201);
        }

        return $this->json(
            [
                'code' => Response::HTTP_BAD_REQUEST,
                'message' => self::MESSAGE_INVALID_FONT_FORMAT,
            ],
            Response::HTTP_BAD_REQUEST
        );
    }

    private function createFontMedia(array $uploadedFont)
    {
        $mediaManager = $this->get(MediaManager::class);

        return $mediaManager->createFileFromUploadedFile(
            $uploadedFont['file'],
            'default',
            sha1($uploadedFont['name'] . uniqid('', true) . random_int(11111, 99999)) .
                '.' .
                $uploadedFont['extension']
        );
    }
}

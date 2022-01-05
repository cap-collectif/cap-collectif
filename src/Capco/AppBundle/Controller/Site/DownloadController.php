<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Command\ExportDebateCommand;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Generator\CSV\IdentificationCodeListCSVGenerator;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository;
use Capco\AppBundle\Twig\MediaExtension;
use Capco\MediaBundle\Entity\Media;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Translation\TranslatorInterface;

class DownloadController extends Controller
{
    private LoggerInterface $logger;
    private SessionInterface $session;
    private TranslatorInterface $translator;
    private UserIdentificationCodeListRepository $userIdentificationCodeListRepository;
    private string $projectDir;

    public function __construct(
        LoggerInterface $logger,
        SessionInterface $session,
        TranslatorInterface $translator,
        UserIdentificationCodeListRepository $userIdentificationCodeListRepository,
        string $projectDir
    ) {
        $this->logger = $logger;
        $this->session = $session;
        $this->translator = $translator;
        $this->userIdentificationCodeListRepository = $userIdentificationCodeListRepository;
        $this->projectDir = $projectDir;
    }

    /**
     * @Route("/debate/{debateId}/download/{type}", name="app_debate_download", options={"i18n" = false})
     * @Security("has_role('ROLE_PROJECT_ADMIN')")
     */
    public function downloadArgumentsAction(
        Request $request,
        string $debateId,
        string $type
    ): Response {
        $debateId = GlobalId::fromGlobalId($debateId)['id'];

        $user = $this->getUser();
        $isProjectAdmin = $user->isOnlyProjectAdmin();

        $fileName = ExportDebateCommand::getFilename($debateId, $type, $isProjectAdmin);
        $filePath = $this->projectDir . '/public/export/' . $fileName;

        if (!file_exists($filePath)) {
            $this->session
                ->getFlashBag()
                ->add('danger', $this->translator->trans('project.download.not_yet_generated'));

            return $this->redirect($request->headers->get('referer'));
        }
        $date = (new \DateTime())->format('Y-m-d');

        $response = $this->file($filePath, $date . '_' . $fileName);
        $response->headers->set('Content-Type', 'text/csv' . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download", options={"i18n" = false})
     * @Entity("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @Entity("media", options={"mapping": {"mediaId": "id"}})
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request)
    {
        if (
            !$mediaResponse->getQuestion() ||
            !$mediaResponse->getQuestion()->isPrivate() ||
            $this->getUser() === $mediaResponse->getProposal()->getAuthor() ||
            $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            $provider = $this->get('sonata.media.pool')->getProvider($media->getProviderName());

            // In case something bad happened, and we lost the file…
            if (!$provider->getReferenceFile($media)->exists()) {
                $this->logger->error('File not found for media : ' . $media->getId());

                return new Response('File not found.');
            }

            // Depending on the file type we redirect to the file or download it
            $type = $media->getContentType();
            $redirectFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (\in_array($type, $redirectFileTypes, true)) {
                $url =
                    $request->getUriForPath('/media') .
                    $this->get(MediaExtension::class)->path($media, 'reference');

                return new RedirectResponse($url);
            }

            $downloadMode = $this->get('sonata.media.pool')->getDownloadMode($media);
            $response = $provider->getDownloadResponse($media, 'reference', $downloadMode);
            if ($response instanceof BinaryFileResponse) {
                $response->prepare($request);
            }

            // Avoid some files to be corrupt
            ob_get_clean();

            return $response;
        }

        return new Response('Sorry, you are not allowed to see this file.');
    }

    /**
     * @Route("/identificationCodesList/download/cap-collectif-codes-{listId}.csv", name="app_identification_codes_list_download", options={"i18n" = false})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadIdentificationCodesListAction(string $listId): Response
    {
        $list = $this->getUserIdentificationCodeList($listId);

        return IdentificationCodeListCSVGenerator::generateFromList($list);
    }

    private function getUserIdentificationCodeList(string $globalId): UserIdentificationCodeList
    {
        $decoded = GlobalId::fromGlobalId($globalId);
        if (isset($decoded['id'])) {
            $list = $this->userIdentificationCodeListRepository->find($decoded['id']);
            if ($list) {
                return $list;
            }
        }

        throw new NotFoundHttpException('no list matching id');
    }
}

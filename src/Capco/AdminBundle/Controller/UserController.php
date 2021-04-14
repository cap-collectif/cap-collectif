<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Command\CreateCsvFromLegacyUsersCommand;
use Capco\AppBundle\Command\CreateCsvFromUsersCommand;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Sonata\AdminBundle\Controller\CRUDController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Process\Process;

/**
 * @Security("has_role('ROLE_ADMIN')")
 */
class UserController extends CRUDController
{
    public function editAction($id = null): Response
    {
        $object = $this->get(UserRepository::class)->find($id);

        if (!$object) {
            throw $this->createNotFoundException(
                'The user corresponding to this id doesn\'t exist.'
            );
        }

        return $this->renderWithExtraParams(
            'CapcoAdminBundle:User:edit.html.twig',
            [
                'action' => 'edit',
                'form' => null,
                'object' => $object,
                'objectId' => $object->getId(),
            ],
            null
        );
    }

    public function exportAction(Request $request): Response
    {
        $this->admin->checkAccess('export');

        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/';
        $filename = 'users.csv';
        $absolutePath = $path . $filename;
        if (file_exists($absolutePath)) {
            Process::fromShellCommandline('rm -rf ' . $absolutePath)->mustRun();
        }
        if (file_exists('/tmp/users.csv')) {
            Process::fromShellCommandline('rm -rf ' . '/tmp/users.csv')->mustRun();
        }

        if (!file_exists($absolutePath)) {
            CreateCsvFromUsersCommand::export($this->get(LocaleRepository::class)->getDefaultCode(), $this->get('doctrine')
                ->getConnection());
        }

        $contentType = 'text/csv';

        $date = date('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($absolutePath);
        $response->headers->set('X-Accel-Redirect', '/export/' . $filename);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $date . '_' . $filename
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }

    public function exportLegacyUsersAction(Request $request): Response
    {
        if (!$this->get(Manager::class)->isActive(Manager::export_legacy_users)) {
            throw new AccessDeniedException();
        }
        $this->admin->checkAccess('export');
        $trans = $this->get('translator');
        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/';
        $filename = CreateCsvFromLegacyUsersCommand::FILENAME;

        if (!file_exists($path . $filename)) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();
            $flashBag->add(
                'danger',
                $trans->trans('project.download.not_yet_generated', [], 'CapcoAppBundle')
            );

            return $this->redirect($request->headers->get('referer'));
        }
        $absolutePath = $path . $filename;
        $contentType = 'text/csv';

        $date = date('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($absolutePath);
        $response->headers->set('X-Accel-Redirect', '/export/' . $filename);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $date . '_' . $filename
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }
}

<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Sonata\AdminBundle\Controller\CRUDController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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
                'objectId' => $object->getId()
            ],
            null
        );
    }

    public function exportAction(Request $request): Response
    {
        $this->admin->checkAccess('export');
        $trans = $this->get('translator');

        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/';
        $filename = 'users.csv';

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

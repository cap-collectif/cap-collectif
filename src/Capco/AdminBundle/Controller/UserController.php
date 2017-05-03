<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class UserController extends Controller
{
    public function batchActionDeleteIsRelevant(array $selectedIds, $allEntitiesSelected)
    {
        if (!$this->isGranted('ROLE_SUPER_ADMIN')) {
            foreach ($selectedIds as $id) {
                $user = $this->container->get('fos_user.user_manager')->findUserBy(['id' => $id]);
                if ($user->hasRole('ROLE_SUPER_ADMIN')) {
                    return 'user.delete.batch_denied';
                }
            }
        }

        return true;
    }

    /**
     * Delete action.
     *
     * @param int|string|null $id
     * @param Request         $request
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     *
     * @return Response|RedirectResponse
     */
    public function deleteAction($id, Request $request = null)
    {
        $id = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$this->isGranted('ROLE_SUPER_ADMIN') && $object->hasRole('ROLE_SUPER_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        return parent::deleteAction($id, $request);
    }

    /**
     * Edit action.
     *
     * @param int|string|null $id
     * @param Request         $request
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     *
     * @return Response|RedirectResponse
     */
    public function editAction($id = null, Request $request = null)
    {
        $id = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$this->isGranted('ROLE_SUPER_ADMIN') && $object->hasRole('ROLE_SUPER_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        return parent::editAction($id, $request);
    }

    public function exportAction(Request $request)
    {
        $this->admin->checkAccess('export');
        $trans = $this->get('translator');

        $path = $this->container->getParameter('kernel.root_dir') . '/../web/export/';
        $filename = 'users.csv';

        if (!file_exists($path . $filename)) {
            $this->get('session')->getFlashBag()->add('danger', $trans->trans('project.download.not_yet_generated', [], 'CapcoAppBundle'));

            return $this->redirect($request->headers->get('referer'));
        }

        $absolutePath = $path . $filename;
        $contentType = 'text/csv';

        $date = date('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($absolutePath);
        $response->headers->set('X-Accel-Redirect', '/export/' . $filename);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT, $date . '_' . $filename
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }
}

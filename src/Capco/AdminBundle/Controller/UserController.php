<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;

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
     * @return Response|RedirectResponse
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     */
    public function deleteAction($id, Request $request = null)
    {
        $id     = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$this->isGranted('ROLE_SUPER_ADMIN') && $object->hasRole('ROLE_SUPER_ADMIN')) {
            throw new AccessDeniedException();
        }

        return parent::deleteAction($id, $request);
    }

    /**
     * Edit action.
     *
     * @param int|string|null $id
     * @param Request         $request
     *
     * @return Response|RedirectResponse
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     */
    public function editAction($id = null, Request $request = null)
    {
        $id     = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$this->isGranted('ROLE_SUPER_ADMIN') && $object->hasRole('ROLE_SUPER_ADMIN')) {
            throw new AccessDeniedException();
        }

        return parent::editAction($id, $request);
    }
}

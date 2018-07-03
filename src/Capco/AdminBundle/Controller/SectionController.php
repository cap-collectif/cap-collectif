<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SectionController extends PositionableController
{
    public function __construct()
    {
        parent::__construct('capco.section.resolver');
    }

    /**
     * @param array $selectedIds
     * @param $allEntitiesSelected
     *
     * @return bool|string
     */
    public function batchActionDeleteIsRelevant(array $selectedIds, $allEntitiesSelected)
    {
        foreach ($selectedIds as $id) {
            $item = $this->container->get('doctrine')
                ->getManager()
                ->getRepository('Section')
                ->find($id);
            if (!$item->isCustom()) {
                return 'admin.action.section.batch_delete.denied';
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
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object->isCustom()) {
            throw $this->createAccessDeniedException();
        }

        return parent::deleteAction($id, $request);
    }
}

<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;

class SectionController extends Controller
{
    /**
     * @param array $selectedIds
     * @param $allEntitiesSelected
     *
     * @return bool|string
     */
    public function batchActionDeleteIsRelevant(array $selectedIds, $allEntitiesSelected)
    {
        foreach ($selectedIds as $id) {
            $item = $this->container->get('doctrine.orm.entity_manager')->getRepository('Section')->find($id);
            if (!$item->isCustom()) {
                return 'admin.action.section.batch_delete.denied';
            }
        }

        return true;
    }

    /**
     * Delete action
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
        $id      = $this->get('request')->get($this->admin->getIdParameter());
        $object  = $this->admin->getObject($id);

        if (!$object->isCustom()) {
            throw new AccessDeniedException();
        }

        return parent::deleteAction($id, $request);
    }

    public function upAction()
    {
        $id     = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, -1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            array('filter' => $this->admin->getFilterParameters())
        ));
    }

    public function downAction()
    {
        $id     = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, 1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            array('filter' => $this->admin->getFilterParameters())
        ));
    }

    private function move($section, $relativePosition)
    {
        if (!$section) {
            throw new NotFoundHttpException(sprintf('unable to find the section with id : %s', $id));
        }

        if (false === $this->admin->isGranted('EDIT', $section)) {
            throw new AccessDeniedException();
        }

        $resolver = $this->get('capco.section.resolver');

        // Object to switch position with
        $objectToSwitch = $resolver->getObjectToSwitch($section, $relativePosition);

        if (null != $objectToSwitch) {

            // Switch position
            $oldPosition = $section->getPosition();
            $section->setPosition($objectToSwitch->getPosition());
            $objectToSwitch->setPosition($oldPosition);

            // Save the two objects
            $this->admin->update($section);
            $this->admin->update($objectToSwitch);

            // Fix positions for all objects and save 'em
            $sections = $resolver->getDisplayableSectionsOrdered();
            foreach ($sections as $index => $sec) {
                if ($sec->getPosition() != $index) {
                    $sec->setPosition($index);
                    $this->admin->update($sec);
                }
            }
        }
    }
}

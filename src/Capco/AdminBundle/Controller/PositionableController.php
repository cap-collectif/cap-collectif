<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class PositionableController extends Controller
{
    private $resolverName;

    public function __construct($resolverName)
    {
        $this->resolverName = $resolverName;
    }

    public function upAction()
    {
        $id = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, -1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            array('filter' => $this->admin->getFilterParameters())
        ));
    }

    public function downAction()
    {
        $id = $this->get('request')->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, 1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            array('filter' => $this->admin->getFilterParameters())
        ));
    }

    private function move($object, $relativePosition)
    {
        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id : %s', $id));
        }

        if (false === $this->admin->isGranted('EDIT', $object)) {
            throw new AccessDeniedException();
        }

        $resolver = $this->get($this->resolverName);

        // Object to switch position with
        $objectToSwitch = $resolver->getObjectToSwitch($object, $relativePosition);

        if (null != $objectToSwitch) {

            // Switch position
            $oldPosition = $object->getPosition();
            $object->setPosition($objectToSwitch->getPosition());
            $objectToSwitch->setPosition($oldPosition);

            // Save the two objects
            $this->admin->update($object);
            $this->admin->update($objectToSwitch);

            // Fix positions for all objects and save 'em
            $objects = $resolver->getDisplayableOrdered();
            foreach ($objects as $index => $sec) {
                if ($sec->getPosition() != $index) {
                    $sec->setPosition($index);
                    $this->admin->update($sec);
                }
            }
        }
    }
}

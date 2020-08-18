<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class PositionableController extends CRUDController
{
    private $resolverName;

    public function __construct($resolverName)
    {
        $this->resolverName = $resolverName;
    }

    public function upAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, -1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            ['filter' => $this->admin->getFilterParameters()]
        ));
    }

    public function downAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        $this->move($object, 1);

        return new RedirectResponse($this->admin->generateUrl(
            'list',
            ['filter' => $this->admin->getFilterParameters()]
        ));
    }

    private function move($object, $relativePosition)
    {
        if (!$object) {
            throw $this->createNotFoundException('Unable to find the object');
        }

        if (false === $this->admin->isGranted('EDIT', $object)) {
            throw $this->createAccessDeniedException();
        }

        $resolver = $this->get($this->resolverName);

        // Object to switch position with
        $objectToSwitch = $resolver->getObjectToSwitch($object, $relativePosition);

        if ($objectToSwitch) {
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
                if ($sec->getPosition() !== $index) {
                    $sec->setPosition($index);
                    $this->admin->update($sec);
                }
            }
        }
    }
}

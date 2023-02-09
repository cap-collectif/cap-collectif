<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Security\EventVoter;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EventController extends Controller
{
    // While route en template are not totally managed by admin next, we need to keep it
    public function createAction(Request $request): Response
    {
        if (!$this->isGranted(EventVoter::CREATE, new Event())) {
            throw $this->createAccessDeniedException();
        }

        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Event:create.html.twig',
            [
                'action' => 'create',
                'object' => $this->admin->getNewInstance(),
            ],
            null,
            $request
        );
    }

    // While route en template are not totally managed by admin next, we need to keep it
    public function editAction(Request $request): Response
    {
        $id = $request->get($this->admin->getIdParameter());
        if (!$this->isGranted(EventVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }

        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Event:edit.html.twig',
            [
                'action' => 'edit',
                'object' => $this->admin->getObject($id),
                'eventId' => GlobalId::toGlobalId('Event', $id),
            ],
            null
        );
    }
}

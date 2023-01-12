<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Security\EventVoter;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;

class EventController extends Controller
{
    // While route en template are not totally managed by admin next, we need to keep it
    public function createAction(?Request $request = null)
    {
        if (!$this->isGranted(EventVoter::CREATE, new Event())) {
            throw $this->createAccessDeniedException();
        }

        return $this->renderWithExtraParams(
            $this->admin->getTemplate('create'),
            [
                'action' => 'create',
                'object' => $this->admin->getNewInstance(),
            ],
            null,
            $request
        );
    }

    // While route en template are not totally managed by admin next, we need to keep it
    public function editAction($id = null)
    {
        if (!$this->isGranted(EventVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }

        return $this->renderWithExtraParams(
            $this->admin->getTemplate('edit'),
            [
                'action' => 'edit',
                'object' => $this->admin->getObject($id),
                'eventId' => GlobalId::toGlobalId('Event', $id),
            ],
            null
        );
    }
}

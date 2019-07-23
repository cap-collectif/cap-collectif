<?php

namespace Capco\AdminBundle\Controller;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;

class EventController extends Controller
{
    public function createAction(Request $request = null)
    {
        return $this->renderWithExtraParams(
            $this->admin->getTemplate('create'),
            [
                'action' => 'create',
                'object' => $this->admin->getNewInstance()
            ],
            null,
            $request
        );
    }

    public function editAction($id = null)
    {
        return $this->renderWithExtraParams(
            $this->admin->getTemplate('edit'),
            [
                'action' => 'edit',
                'object' => $this->admin->getObject($id),
                'eventId' => GlobalId::toGlobalId('Event', $id)
            ],
            null
        );
    }
}

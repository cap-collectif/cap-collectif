<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OpinionTypeController extends Controller
{
    protected function redirectTo($object, Request $request = null)
    {
        $url = false;

        $consultationTypeId = $object->getConsultationType() ? $object->getConsultationType()->getId() : $request->get('consultation_type_id');

        if (null !== $request->get('btn_update_and_list')) {
            $url = $this->generateUrl('admin_capco_app_consultationtype_edit', ['id' => $consultationTypeId]);
        }
        if (null !== $request->get('btn_create_and_list')) {
            $url = $this->generateUrl('admin_capco_app_consultationtype_edit', ['id' => $consultationTypeId]);
        }

        if (null !== $request->get('btn_create_and_create')) {
            $params = array();
            if ($this->admin->hasActiveSubClass()) {
                $params['subclass'] = $request->get('subclass');
            }
            $url = $this->admin->generateUrl('create', $params);
        }

        if ($this->getRestMethod($request) === 'DELETE') {
            $consultationTypeId = $request->get('consultation_type_id');
            $url = $this->generateUrl('admin_capco_app_consultationtype_edit', ['id' => $consultationTypeId]);
        }

        if (!$url) {
            $url = $this->admin->generateObjectUrl('edit', $object);
        }

        return new RedirectResponse($url);
    }

}

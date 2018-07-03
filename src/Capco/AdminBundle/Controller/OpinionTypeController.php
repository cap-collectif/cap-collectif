<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OpinionTypeController extends Controller
{
    protected function redirectTo($object)
    {
        $url = false;
        $request = $this->get('request')->request;

        $consultationStepTypeId = $object->getConsultationStepType() ? $object->getConsultationStepType()->getId() : $request->get('consultation_step_type_id');

        if ($request && null !== $request->get('btn_update_and_list')) {
            $url = $this->generateUrl('admin_capco_app_steps_consultationsteptype_edit', ['id' => $consultationStepTypeId]);
        }
        if ($request && null !== $request->get('btn_create_and_list')) {
            $url = $this->generateUrl('admin_capco_app_steps_consultationsteptype_edit', ['id' => $consultationStepTypeId]);
        }

        if ($request && null !== $request->get('btn_create_and_create')) {
            $params = [];
            if ($this->admin->hasActiveSubClass()) {
                $params['subclass'] = $request->get('subclass');
            }
            $url = $this->admin->generateUrl('create', $params);
        }

        if ($request && 'DELETE' === $this->getRestMethod($request)) {
            $consultationStepTypeId = $request->get('consultation_step_type_id');
            $url = $this->generateUrl('admin_capco_app_steps_consultationsteptype_edit', ['id' => $consultationStepTypeId]);
        }

        if (!$url) {
            $url = $this->admin->generateObjectUrl('edit', $object);
        }

        return new RedirectResponse($url);
    }
}

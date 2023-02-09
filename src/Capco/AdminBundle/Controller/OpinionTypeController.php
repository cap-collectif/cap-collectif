<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class OpinionTypeController extends Controller
{
    protected function redirectTo(Request $request, object $object): RedirectResponse
    {
        $url = false;
        $locale = $request->getLocale();

        $consultationId = $object->getConsultation()
            ? $object->getConsultation()->getId()
            : $request->get('consultation_id');

        if (null !== $request->get('btn_update_and_list')) {
            $url = $this->generateUrl('admin_capco_app_consultation_edit', [
                'id' => $consultationId,
                '_locale' => $locale,
            ]);
        }
        if (null !== $request->get('btn_create_and_list')) {
            $url = $this->generateUrl('admin_capco_app_consultation_edit', [
                'id' => $consultationId,
                '_locale' => $locale,
            ]);
        }

        if (null !== $request->get('btn_create_and_create')) {
            $params = [];
            if ($this->admin->hasActiveSubClass()) {
                $params['subclass'] = $request->get('subclass');
            }
            $url = $this->admin->generateUrl('create', $params);
        }

        if ('DELETE' === $request->getMethod()) {
            $consultationId = $request->get('consultation_id');
            $url = $this->generateUrl('admin_capco_app_consultation_edit', [
                'id' => $consultationId,
                '_locale' => $locale,
            ]);
        }

        if (!$url) {
            $url = $this->admin->generateObjectUrl('edit', $object);
        }

        return new RedirectResponse($url);
    }
}

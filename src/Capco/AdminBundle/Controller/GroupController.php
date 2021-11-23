<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;

class GroupController extends Controller
{
    public function exportAction(Request $request)
    {
        $this->admin->checkAccess('export');
        $trans = $this->get('translator');

        $path = $this->container->getParameter('kernel.root_dir') . '/../public/export/';
        $filename = 'users.csv';

        if (!file_exists($path . $filename)) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();
            $flashBag->add(
                'danger',
                $trans->trans('project.download.not_yet_generated', [], 'CapcoAppBundle')
            );

            return $this->redirect($request->headers->get('referer'));
        }

        $absolutePath = $path . $filename;
        $contentType = 'text/csv';

        $date = date('Y-m-d');

        $response = $this->file($absolutePath, $date . '_' . $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }
}

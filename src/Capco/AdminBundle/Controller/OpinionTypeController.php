<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OpinionTypeController extends Controller
{

    /**
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function treeAction(Request $request)
    {
        $opinionTypeRepo = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType');
        $rootOTs = $opinionTypeRepo->childrenHierarchy();

        $datagrid = $this->admin->getDatagrid();

        $formView = $datagrid->getForm()->createView();
        $this->get('twig')->getExtension('form')->renderer->setTheme($formView, $this->admin->getFilterTheme());

        return $this->render('CapcoAdminBundle:OpinionType:tree.html.twig', array(
            'action'           => 'tree',
            'root_opinion_types'  => $rootOTs,
            'form'             => $formView,
            'csrf_token'       => $this->getCsrfToken('sonata.batch'),
        ));
    }
}

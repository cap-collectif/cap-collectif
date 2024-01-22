<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Controller\CRUDController as Controller;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class OpinionTypeController extends Controller
{
    private OpinionTypeRepository $opinionTypeRepository;

    public function __construct(BreadcrumbsBuilderInterface $breadcrumbsBuilder, Pool $pool, OpinionTypeRepository $opinionTypeRepository)
    {
        parent::__construct($breadcrumbsBuilder, $pool);
        $this->opinionTypeRepository = $opinionTypeRepository;
    }

    public function createAction(Request $request): Response
    {
        $viewer = $this->getUser();
        if ($viewer->isOnlyUser() && null === $viewer->getOrganization()) {
            throw $this->createAccessDeniedException();
        }

        return parent::createAction($request);
    }

    public function editAction(Request $request): Response
    {
        $opinionTypeId = $request->get('id');
        $opinionType = $this->opinionTypeRepository->find($opinionTypeId);
        $consultation = $opinionType->getConsultation();

        $organization = $this->getUser()->getOrganization();

        if (!$organization) {
            return parent::editAction($request);
        }

        if ($consultation->getOwner() !== $organization) {
            throw $this->createAccessDeniedException();
        }

        return parent::editAction($request);
    }

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

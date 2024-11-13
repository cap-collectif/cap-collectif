<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Notifier\ContributionNotifier;
use Doctrine\Common\Util\ClassUtils;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportingController extends AbstractSonataCrudController
{
    public function showAction(Request $request): Response
    {
        $this->assertObjectExists($request, true);

        $id = $request->get($this->admin->getIdParameter());
        \assert(null !== $id);
        $object = $this->admin->getObject($id);
        \assert(null !== $object);

        $this->checkParentChildAssociation($request, $object);

        $this->admin->checkAccess('show', $object);

        $preResponse = $this->preShow($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($object);

        $fields = $this->admin->getShow();

        return $this->renderWithExtraParams('@CapcoAdmin/Reporting/show.html.twig', [
            'action' => 'show',
            'object' => $object,
            'elements' => $fields,
            'admin_pool' => $this->pool,
            'breadcrumbs_builder' => $this->breadcrumbsBuilder,
        ]);
    }

    public function disableAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id : %s', $id));
        }

        $related = $object->getRelatedObject();

        if ($related) {
            if ($related instanceof Trashable) {
                $related->setTrashedStatus(Trashable::STATUS_INVISIBLE);
            }
            $this->get(ContributionNotifier::class)->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        // Synchronously index
        $indexer = $this->get(Indexer::class);
        $indexer->index(ClassUtils::getClass($related), $related->getId());
        $indexer->finishBulk();

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.disable.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }

    public function trashAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id : %s', $id));
        }

        $related = $object->getRelatedObject();

        if ($related) {
            if ($related instanceof Trashable) {
                $related->setTrashedStatus(Trashable::STATUS_VISIBLE);
            }
            $this->get(ContributionNotifier::class)->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        // Synchronously index
        $indexer = $this->get(Indexer::class);
        $indexer->index(ClassUtils::getClass($related), $related->getId());
        $indexer->finishBulk();

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.trash.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }

    public function archiveAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id : %s', $id));
        }

        $object->setIsArchived(true);
        $this->admin->update($object);

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.archive.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }
}

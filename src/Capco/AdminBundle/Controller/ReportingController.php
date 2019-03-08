<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Capco\AppBundle\Elasticsearch\Indexer;

class ReportingController extends Controller
{
    public function disableAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(
                sprintf('unable to find the object with id : %s', $id)
            );
        }

        $related = $object->getRelatedObject();

        if ($related) {
            if ($related instanceof Trashable) {
                $related->setTrashedStatus(Trashable::STATUS_INVISIBLE);
            }
            $this->get('capco.contribution_notifier')->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        // Synchronously index
        $indexer = $this->get(Indexer::class);
        $indexer->index(\get_class($related), $related->getId());
        $indexer->finishBulk();

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.disable.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }

    public function trashAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(
                sprintf('unable to find the object with id : %s', $id)
            );
        }

        $related = $object->getRelatedObject();

        if ($related) {
            if ($related instanceof Trashable) {
                $related->setTrashedStatus(Trashable::STATUS_VISIBLE);
            }
            $this->get('capco.contribution_notifier')->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        // Synchronously index
        $indexer = $this->get(Indexer::class);
        $indexer->index(\get_class($related), $related->getId());
        $indexer->finishBulk();

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.trash.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }

    public function archiveAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(
                sprintf('unable to find the object with id : %s', $id)
            );
        }

        $object->setIsArchived(true);
        $this->admin->update($object);

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.archive.success');

        return new RedirectResponse($this->generateUrl('admin_capco_app_reporting_index'));
    }
}

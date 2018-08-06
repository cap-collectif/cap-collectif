<?php
namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

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
            method_exists($related, 'setEnabled')
                ? $related->setEnabled(false)
                : $related->setIsEnabled(false);
            $this->get('capco.contribution_notifier')->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.disable.success');

        return new RedirectResponse($this->generateUrl('capco_admin_reporting_index'));
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
            $related->setTrashedStatus('visible');
            $this->get('capco.contribution_notifier')->onModeration($related);
        }

        $this->admin->update($related);

        $object->setIsArchived(true);
        $this->admin->update($object);

        $this->addFlash('sonata_flash_success', 'admin.action.reporting.trash.success');

        return new RedirectResponse($this->generateUrl('capco_admin_reporting_index'));
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

        return new RedirectResponse($this->generateUrl('capco_admin_reporting_index'));
    }
}

<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\ProposalForm;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProposalFormController extends Controller
{
    public function duplicateAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $translator = $this->get('translator');

        /** @var ProposalForm $object */
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id: %s', $id));
        }

        $clonedProposalForm = clone $object;
        $clonedProposalForm->setTitle($translator->trans('copy-of') . ' ' . $object->getTitle());

        $this->admin->create($clonedProposalForm);

        $this->addFlash('sonata_flash_success', 'your-form-has-been-duplicated');

        return new RedirectResponse($this->admin->generateUrl('list'));
    }
}

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

        /** @var ProposalForm $object */
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id: %s', $id));
        }

        $clonedProposalForm = new ProposalForm();
        $clonedProposalForm->setTitle($object->getTitle() . ' (Clone)');
        $clonedProposalForm->initializeNotificationConfiguration();
        $clonedProposalForm->setQuestions($object->getQuestions());
        $clonedProposalForm->setDescription($object->getDescription());
        $clonedProposalForm->setCommentable($object->isCommentable());
        $clonedProposalForm->setQuestions($object->getQuestions());
        $clonedProposalForm->setCostable($object->isCostable());
        $clonedProposalForm->setTitleHelpText($object->getTitleHelpText());
        $clonedProposalForm->setSummaryHelpText($object->getSummaryHelpText());
        $clonedProposalForm->setThemeHelpText($object->getThemeHelpText());
        $clonedProposalForm->setDistrictHelpText($object->getDistrictHelpText());
        $clonedProposalForm->setCategoryHelpText($object->getCategoryHelpText());
        $clonedProposalForm->setAddressHelpText($object->getAddressHelpText());
        $clonedProposalForm->setIllustrationHelpText($object->getIllustrationHelpText());
        $clonedProposalForm->setUsingThemes($object->isUsingThemes());
        $clonedProposalForm->setAllowAknowledge($object->isAllowAknowledge());
        $clonedProposalForm->setThemeMandatory($object->isThemeMandatory());
        $clonedProposalForm->setUsingCategories($object->isUsingCategories());
        $clonedProposalForm->setCategoryMandatory($object->isCategoryMandatory());
        $clonedProposalForm->setDistrictMandatory($object->isDistrictMandatory());
        $clonedProposalForm->setUsingDistrict($object->isUsingDistrict());
        $clonedProposalForm->setUsingAddress($object->getUsingAddress());
        $clonedProposalForm->setProposalInAZoneRequired($object->isProposalInAZoneRequired());
        $clonedProposalForm->setZoomMap($object->getZoomMap());
        $clonedProposalForm->setLatMap($object->getLatMap());
        $clonedProposalForm->setLngMap($object->getLngMap());

        $this->admin->create($clonedProposalForm);

        $this->addFlash('sonata_flash_success', 'Cloned successfully');

        return new RedirectResponse($this->admin->generateUrl('list'));
    }
}

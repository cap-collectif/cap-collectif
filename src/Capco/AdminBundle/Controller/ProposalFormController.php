<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\NotificationsConfiguration\QuestionnaireNotificationConfiguration;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalFormVoter;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProposalFormController extends CRUDController
{
    public function duplicateAction(Request $request)
    {
        $id = $request->get($this->admin->getIdParameter());
        $filters = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];

        /** @var ProposalForm $object */
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id: %s', $id));
        }

        $translator = $this->get('translator');
        $em = $this->get('doctrine.orm.entity_manager');
        $clonedProposalForm = clone $object;
        $clonedProposalForm->setTitle($translator->trans('copy-of') . ' ' . $object->getTitle());
        $evaluationForm = $clonedProposalForm->getEvaluationForm();

        if (null !== $evaluationForm) {
            $evaluationForm->setTitle(
                $translator->trans('copy-of') . ' ' . $evaluationForm->getTitle()
            );
            foreach ($evaluationForm->getQuestions() as $qaq) {
                $em->persist($qaq);
                $em->persist($qaq->getQuestion());
            }

            $notificationsConfiguration = $evaluationForm->getNotificationsConfiguration();

            $newNotificationsConfiguration = (new QuestionnaireNotificationConfiguration())
                ->setOnQuestionnaireReplyUpdate(
                    $notificationsConfiguration->isOnQuestionnaireReplyUpdate()
                )
                ->setOnQuestionnaireReplyCreate(
                    $notificationsConfiguration->isOnQuestionnaireReplyCreate()
                )
                ->setOnQuestionnaireReplyDelete(
                    $notificationsConfiguration->isOnQuestionnaireReplyDelete()
                )
                ->setEmail($notificationsConfiguration->getEmail())
                ->setQuestionnaire($evaluationForm);

            $evaluationForm->setNotificationsConfiguration($newNotificationsConfiguration);
        }

        foreach ($clonedProposalForm->getQuestions() as $qaq) {
            $em->persist($qaq);
            $em->persist($qaq->getQuestion());
        }

        $em->persist($clonedProposalForm);
        $em->flush();

        $this->addFlash('sonata_flash_success', 'your-form-has-been-duplicated');

        return new RedirectResponse($this->admin->generateUrl('list', ['filter' => $filters]));
    }

    public function editAction($id = null)
    {
        $this->throwIfNoAccess();

        return parent::editAction($id);
    }

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(ProposalFormVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}

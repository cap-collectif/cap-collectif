<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Security\ConsultationVoter;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ConsultationController extends CRUDController
{
    public function __construct(
        BreadcrumbsBuilderInterface $breadcrumbsBuilder,
        Pool $pool,
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly ActionLogger $actionLogger
    ) {
        parent::__construct($breadcrumbsBuilder, $pool);
    }

    public function editAction(Request $request): Response
    {
        // this is a copy of editAction from CRUDController, since we need to access the current user to update the form we can't do it in ConsultationAdmin
        $this->throwIfNoAccess();

        // the key used to lookup the template
        $templateKey = 'edit';

        $id = $request->get($this->admin->getIdParameter());
        $existingObject = $this->admin->getObject($id);

        if (!$existingObject) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id: %s', $id));
        }

        $this->checkParentChildAssociation($request, $existingObject);

        $this->admin->checkAccess('edit', $existingObject);

        $preResponse = $this->preEdit($request, $existingObject);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($existingObject);
        $objectId = $this->admin->getNormalizedIdentifier($existingObject);

        // start changed parts
        /** * @var User $viewer */
        $viewer = $this->getUser();
        $organization = $viewer->getOrganization();

        $consultationSteps = $organization ? $this->consultationStepRepository->findByOrganization($organization) : $this->consultationStepRepository->findAll();

        /** @var Form $form */
        $form = $this->admin->getForm();
        $form->add('step', EntityType::class, [
            'class' => ConsultationStep::class,
            'choices' => $consultationSteps,
            'required' => false,
        ]);
        // end changed parts

        $form->setData($existingObject);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if (
                $isFormValid
                && (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))
            ) {
                $submittedObject = $form->getData();
                if ($form->has('districts')) {
                    $submittedDistricts = $form->get('districts')
                        ? $form->get('districts')->getData()
                        : null;

                    if (null !== $submittedDistricts) {
                        $em = $this->container->get('doctrine.orm.entity_manager');
                        $repository = $em->getRepository(ProjectDistrictPositioner::class);
                        $repository->deleteExistingPositionersForProject($existingObject->getId());
                        $em->flush();

                        $positioners = [];
                        $position = 0;
                        foreach ($submittedDistricts as $district) {
                            $positioner = new ProjectDistrictPositioner();
                            $positioner
                                ->setDistrict($district)
                                ->setProject($existingObject)
                                ->setPosition($position++)
                            ;

                            $positioners[] = $positioner;
                        }
                        $submittedObject->setProjectDistrictPositioners($positioners);
                    }
                }

                $this->admin->setSubject($submittedObject);

                try {
                    $projectTitle = $existingObject->getStep()?->getProject()?->getTitle();

                    $this->actionLogger->log(
                        user: $this->getUser(),
                        actionType: LogActionType::EDIT,
                        description: sprintf('Le formulaire de consultation %s%s', $existingObject->getTitle(), sprintf(' du projet %s', $projectTitle)),
                    );

                    $projectTitle = $existingObject->getStep()?->getProject()?->getTitle();

                    $actionDescription = sprintf('le formulaire de consultation %s', $existingObject->getTitle());

                    if (null !== $projectTitle) {
                        $actionDescription .= sprintf(' du projet %s', $projectTitle);
                    }

                    $this->actionLogger->log(
                        user: $this->getUser(),
                        actionType: LogActionType::EDIT,
                        description: $actionDescription,
                    );

                    $existingObject = $this->admin->update($submittedObject);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $objectId,
                                'objectName' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                ),
                            ],
                            200,
                            []
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->trans(
                            'success.edition.flash',
                            [
                                'name' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                ),
                            ],
                            'SonataAdminBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($request, $existingObject);
                } catch (ModelManagerException $e) {
                    $this->handleModelManagerException($e);

                    $isFormValid = false;
                } catch (LockException) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->trans(
                            'flash_lock_error',
                            [
                                'name' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                ),
                                'link_start' => '<a href="' .
                                    $this->admin->generateObjectUrl('edit', $existingObject) .
                                    '">',
                                'link_end' => '</a>',
                            ],
                            'SonataAdminBundle'
                        )
                    );
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                if (!$this->isXmlHttpRequest($request)) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->trans(
                            'error.edition.flash',
                            [
                                'name' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                ),
                            ],
                            'SonataAdminBundle'
                        )
                    );
                }
            } elseif ($this->isPreviewRequested($request)) {
                // enable the preview template if the form was valid and preview was requested
                $templateKey = 'preview';
                $this->admin->getShow();
            }
        }

        $formView = $form->createView();
        // set the theme for the current Admin Form
        $this->setFormTheme($formView, $this->admin->getFormTheme());

        $template = $this->admin->getTemplateRegistry()->getTemplate($templateKey);

        return $this->renderWithExtraParams(
            $template,
            [
                'action' => 'edit',
                'form' => $formView,
                'object' => $existingObject,
                'objectId' => $objectId,
            ],
            null
        );
    }

    protected function redirectTo(Request $request, object $object): RedirectResponse
    {
        if (null !== $request->get('btn_update_and_list')) {
            return new RedirectResponse('/admin-next/forms?formType=CONSULTATION');
        }

        return parent::redirectTo($request, $object);
    }

    private function throwIfNoAccess()
    {
        $consultation = $this->admin->getSubject();
        if (!$this->isGranted(ConsultationVoter::EDIT, $consultation)) {
            throw $this->createAccessDeniedException();
        }
    }
}

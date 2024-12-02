<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ProjectTypeController extends CRUDController
{
    public function editAction(Request $request): Response
    {
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

        /** @var Form $form */
        $form = $this->admin->getForm();
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
                $this->admin->setSubject($submittedObject);

                try {
                    $existingObject = $this->admin->update($submittedObject);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $objectId,
                                'objectName' => $this->escapeHtml(
                                    $this->trans(
                                        $existingObject->getTitle(),
                                        [],
                                        'SonataAdminBundle'
                                    )
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
                                    $this->trans(
                                        $existingObject->getTitle(),
                                        [],
                                        'SonataAdminBundle'
                                    )
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
                                    $this->trans(
                                        $existingObject->getTitle(),
                                        [],
                                        'SonataAdminBundle'
                                    )
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
                                    $this->trans(
                                        $existingObject->getTitle(),
                                        [],
                                        'SonataAdminBundle'
                                    )
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
}

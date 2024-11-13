<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Resolver\SectionResolver;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SectionController extends PositionableController
{
    private SectionResolver $sectionResolver;

    public function __construct(BreadcrumbsBuilderInterface $breadcrumbsBuilder, Pool $pool, SectionResolver $sectionResolver)
    {
        parent::__construct(SectionResolver::class, $breadcrumbsBuilder, $pool);
        $this->sectionResolver = $sectionResolver;
    }

    /**
     * @param $allEntitiesSelected
     *
     * @return bool|string
     */
    public function batchActionDeleteIsRelevant(array $selectedIds, $allEntitiesSelected)
    {
        foreach ($selectedIds as $id) {
            $item = $this->container->get(SectionRepository::class)->find($id);
            if (!$item->isCustom()) {
                return 'admin.action.section.batch_delete.denied';
            }
        }

        return true;
    }

    /**
     * Delete action.
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     */
    public function deleteAction(Request $request): Response
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object->isCustom()) {
            throw $this->createAccessDeniedException();
        }

        return parent::deleteAction($request);
    }

    /**
     * Edit action.
     *
     * @throws NotFoundHttpException If the object does not exist
     * @throws AccessDeniedException If access is not granted
     */
    public function editAction(Request $request): Response
    {
        // NEXT_MAJOR: Remove the unused $id parameter
        if (isset(\func_get_args()[0])) {
            @trigger_error(
                sprintf(
                    'Support for the "id" route param as argument 1 at `%s()` is deprecated since' .
                        ' sonata-project/admin-bundle 3.62 and will be removed in 4.0,' .
                        ' use `AdminInterface::getIdParameter()` instead.',
                    __METHOD__
                ),
                \E_USER_DEPRECATED
            );
        }

        // the key used to lookup the template
        $templateKey = 'edit';

        $id = $request->get($this->admin->getIdParameter());

        /**
         * @var Section $existingObject
         */
        $existingObject = $this->admin->getObject($id);

        if (!$existingObject) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id: %s', $id));
        }

        if ('projects' === $existingObject->getType()) {
            return $this->renderWithExtraParams(
                '@CapcoAdmin/Section/edit_projects.html.twig',
                [
                    'action' => 'edit',
                    'object' => $existingObject,
                ]
            );
        }
        if ('projectsMap' === $existingObject->getType()) {
            return $this->renderWithExtraParams(
                '@CapcoAdmin/Section/edit_projects_map.html.twig',
                [
                    'action' => 'edit',
                    'object' => $existingObject,
                ]
            );
        }
        if ('carrousel' === $existingObject->getType()) {
            return $this->redirect(
                '/admin-next/section/carrousel/' . GlobalId::toGlobalId('Section', $existingObject->getId()),
                301
            );
        }

        $this->checkParentChildAssociation($request, $existingObject);

        $this->admin->checkAccess('edit', $existingObject);

        $preResponse = $this->preEdit($request, $existingObject);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($existingObject);
        $objectId = $this->admin->getNormalizedIdentifier($existingObject);

        $form = $this->admin->getForm();
        $form->getName();

        $form->setData($existingObject);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if (
                $isFormValid
                && (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))
            ) {
                /** @phpstan-var T $submittedObject */
                $submittedObject = $form->getData();
                $this->admin->setSubject($submittedObject);

                try {
                    $existingObject = $this->admin->update($submittedObject);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->handleXmlHttpRequestSuccessResponse(
                            $request,
                            $existingObject
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->trans(
                            'flash_edit_success',
                            [
                                '%name%' => $this->escapeHtml(
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
                } catch (LockException $e) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->trans(
                            'flash_lock_error',
                            [
                                '%name%' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                ),
                                '%link_start%' => sprintf(
                                    '<a href="%s">',
                                    $this->admin->generateObjectUrl('edit', $existingObject)
                                ),
                                '%link_end%' => '</a>',
                            ],
                            'SonataAdminBundle'
                        )
                    );
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                if (
                    $this->isXmlHttpRequest($request)
                    && null !== ($response = $this->handleXmlHttpRequestErrorResponse($request, $form))
                ) {
                    return $response;
                }

                $this->addFlash(
                    'sonata_flash_error',
                    $this->trans(
                        'flash_edit_error',
                        ['%name%' => $this->escapeHtml($this->admin->toString($existingObject))],
                        'SonataAdminBundle'
                    )
                );
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

    protected function move($object, $relativePosition, $resolver = null)
    {
        parent::move($object, $relativePosition, $this->sectionResolver);
    }
}

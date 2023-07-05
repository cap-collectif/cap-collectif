<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Sonata\AdminBundle\Admin\AdminInterface;
use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Sonata\AdminBundle\FieldDescription\FieldDescriptionInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CRUDController extends AbstractSonataCrudController
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
                } catch (LockException $e) {
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

    public function createAction(Request $request): Response
    {
        // the key used to lookup the template
        $templateKey = 'edit';

        $this->admin->checkAccess('create');

        $class = new \ReflectionClass(
            $this->admin->hasActiveSubClass()
                ? $this->admin->getActiveSubClass()
                : $this->admin->getClass()
        );

        if ($class->isAbstract()) {
            return $this->renderWithExtraParams(
                '@SonataAdmin/CRUD/select_subclass.html.twig',
                [
                    'base_template' => $this->getBaseTemplate(),
                    'admin' => $this->admin,
                    'action' => 'create',
                ],
                null
            );
        }

        $newObject = $this->admin->getNewInstance();

        $preResponse = $this->preCreate($request, $newObject);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($newObject);

        $form = $this->admin->getForm();

        $form->setData($newObject);
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
                $this->admin->checkAccess('create', $submittedObject);

                try {
                    $newObject = $this->admin->create($submittedObject);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $newObject->getId(),
                                'objectName' => $this->escapeHtml(
                                    $this->admin->toString($newObject)
                                ),
                            ],
                            200,
                            []
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->trans(
                            'success.creation.flash',
                            ['name' => $this->escapeHtml($this->admin->toString($newObject))],
                            'SonataAdminBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($request, $newObject);
                } catch (ModelManagerException $e) {
                    $this->handleModelManagerException($e);

                    $isFormValid = false;
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                $this->addFlash(
                    'sonata_flash_error',
                    $this->trans(
                        'error.creation.flash',
                        ['name' => $this->escapeHtml($this->admin->toString($newObject))],
                        'SonataAdminBundle'
                    )
                );
            } elseif ($this->isPreviewRequested($request)) {
                // pick the preview template if the form was valid and preview was requested
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
                'action' => 'create',
                'form' => $formView,
                'object' => $newObject,
                'objectId' => null,
            ],
            null
        );
    }

    public function deleteAction(Request $request): Response
    {
        // NEXT_MAJOR: Remove the unused $id parameter
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(sprintf('unable to find the object with id: %s', $id));
        }

        $this->checkParentChildAssociation($request, $object);

        $this->admin->checkAccess('delete', $object);

        $preResponse = $this->preDelete($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        if (Request::METHOD_DELETE === $request->getMethod()) {
            // check the csrf token
            $this->validateCsrfToken($request, 'sonata.delete');

            $objectName = $this->admin->toString($object);

            try {
                $this->admin->delete($object);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(['result' => 'ok'], Response::HTTP_OK, []);
                }

                $this->addFlash(
                    'sonata_flash_success',
                    $this->trans(
                        'success.delete.flash',
                        ['name' => $this->escapeHtml($objectName)],
                        'SonataAdminBundle'
                    )
                );
            } catch (ModelManagerException $e) {
                $this->handleModelManagerException($e);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(['result' => 'error'], Response::HTTP_OK, []);
                }

                $this->addFlash(
                    'sonata_flash_error',
                    $this->trans(
                        'error.delete.flash',
                        ['name' => $this->escapeHtml($objectName)],
                        'SonataAdminBundle'
                    )
                );
            }

            return $this->redirectToList();
        }

        $template = $this->admin->getTemplateRegistry()->getTemplate('delete');

        return $this->renderWithExtraParams(
            $template,
            [
                'object' => $object,
                'action' => 'delete',
                'csrf_token' => $this->getCsrfToken('sonata.delete'),
            ],
            null
        );
    }

    /**
     * @param $conditions
     *
     * @return JsonResponse
     *                      Method from Sonata Admin HelperController used to fetch items in autocompletion.
     *                      Extended to allow additional conditions in query
     */
    protected function retrieveAutocompleteItems(Request $request, $conditions = [])
    {
        $pool = $this->get('sonata.admin.pool');
        $admin = $pool->getInstance($request->get('admin_code'));
        $admin->setRequest($request);
        $context = $request->get('_context', '');

        if ('filter' === $context && false === $admin->isGranted('LIST')) {
            throw $this->createAccessDeniedException();
        }

        if (
            'filter' !== $context
            && false === $admin->isGranted('CREATE')
            && false === $admin->isGranted('EDIT')
        ) {
            throw $this->createAccessDeniedException();
        }

        // subject will be empty to avoid unnecessary database requests and keep autocomplete function fast
        $admin->setSubject($admin->getNewInstance());

        if ('filter' === $context) {
            // filter
            $fieldDescription = $this->retrieveFilterFieldDescription(
                $admin,
                $request->get('field')
            );
            $filterAutocomplete = $admin->getDatagrid()->getFilter($fieldDescription->getName());

            $property = $filterAutocomplete->getFieldOption('property');
            $callback = $filterAutocomplete->getFieldOption('callback');
            $minimumInputLength = $filterAutocomplete->getFieldOption('minimum_input_length', 3);
            $itemsPerPage = $filterAutocomplete->getFieldOption('items_per_page', 10);
            $reqParamPageNumber = $filterAutocomplete->getFieldOption(
                'req_param_name_page_number',
                '_page'
            );
            $toStringCallback = $filterAutocomplete->getFieldOption('to_string_callback');
        } else {
            // create/edit form
            $fieldDescription = $this->retrieveFormFieldDescription($admin, $request->get('field'));
            $formAutocomplete = $admin->getForm()->get($fieldDescription->getName());

            if ($formAutocomplete->getConfig()->getAttribute('disabled')) {
                throw $this->createAccessDeniedException('Autocomplete list can`t be retrieved because the form element is disabled or read_only.');
            }

            $property = $formAutocomplete->getConfig()->getAttribute('property');
            $callback = $formAutocomplete->getConfig()->getAttribute('callback');
            $minimumInputLength = $formAutocomplete
                ->getConfig()
                ->getAttribute('minimum_input_length')
            ;
            $itemsPerPage = $formAutocomplete->getConfig()->getAttribute('items_per_page');
            $reqParamPageNumber = $formAutocomplete
                ->getConfig()
                ->getAttribute('req_param_name_page_number')
            ;
            $toStringCallback = $formAutocomplete->getConfig()->getAttribute('to_string_callback');
        }

        $searchText = $request->get('q');

        $targetAdmin = $fieldDescription->getAssociationAdmin();

        // check user permission
        if (false === $targetAdmin->isGranted('LIST')) {
            throw $this->createAccessDeniedException();
        }

        if (mb_strlen($searchText, 'UTF-8') < $minimumInputLength) {
            return new JsonResponse(
                ['status' => 'KO', 'message' => 'Too short search string.'],
                403
            );
        }

        $targetAdmin->setPersistFilters(false);
        $datagrid = $targetAdmin->getDatagrid();

        if (null !== $callback) {
            if (!\is_callable($callback)) {
                throw new \RuntimeException('Callback does not contain callable function.');
            }

            $callback($targetAdmin, $property, $searchText);
        } else {
            if (\is_array($property)) {
                // multiple properties
                foreach ($property as $prop) {
                    if (!$datagrid->hasFilter($prop)) {
                        throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $prop, \get_class($targetAdmin)));
                    }

                    $filter = $datagrid->getFilter($prop);
                    $filter->setCondition(FilterInterface::CONDITION_OR);

                    $datagrid->setValue($prop, null, $searchText);
                }
            } else {
                if (!$datagrid->hasFilter($property)) {
                    throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $property, \get_class($targetAdmin)));
                }

                $datagrid->setValue($property, null, $searchText);
            }
        }

        foreach ($conditions as $field => $value) {
            if (!$datagrid->hasFilter($field)) {
                throw new \RuntimeException(sprintf('To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.', $field, \get_class($targetAdmin)));
            }
            $datagrid->setValue($field, null, $value);
        }

        $datagrid->setValue('_per_page', null, $itemsPerPage);
        $datagrid->setValue('_page', null, $request->query->get($reqParamPageNumber, 1));

        $datagrid->buildPager();

        $pager = $datagrid->getPager();

        $items = [];
        $results = $pager->getResults();

        foreach ($results as $entity) {
            if (null !== $toStringCallback) {
                if (!\is_callable($toStringCallback)) {
                    throw new \RuntimeException('Option "to_string_callback" does not contain callable function.');
                }

                $label = \call_user_func($toStringCallback, $entity, $property);
            } else {
                $resultMetadata = $targetAdmin->getObjectMetadata($entity);
                $label = $resultMetadata->getTitle();
            }

            $items[] = ['id' => $admin->id($entity), 'label' => $label];
        }

        return new JsonResponse([
            'status' => 'OK',
            'more' => !$pager->isLastPage(),
            'items' => $items,
        ]);
    }

    /**
     * Method from Sonata Admin HelperController.
     *
     * @param mixed $field
     */
    protected function retrieveFormFieldDescription(
        AdminInterface $admin,
        $field
    ): FieldDescriptionInterface {
        $admin->getFormFieldDescriptions();

        $fieldDescription = $admin->getFormFieldDescription($field);

        if (!$fieldDescription) {
            throw new \RuntimeException(sprintf('The field "%s" does not exist.', $field));
        }

        if ('sonata_type_model_autocomplete' !== $fieldDescription->getType()) {
            throw new \RuntimeException(sprintf('Unsupported form type "%s" for field "%s".', $fieldDescription->getType(), $field));
        }

        if (null === $fieldDescription->getTargetModel()) {
            throw new \RuntimeException(sprintf('No associated entity with field "%s".', $field));
        }

        return $fieldDescription;
    }

    /**
     * @throws \Exception
     */
    protected function handleModelManagerException(\Exception $exception): void
    {
        if ($this->get('kernel')->isDebug()) {
            throw $exception;
        }

        $context = ['exception' => $exception];
        if ($exception->getPrevious()) {
            $context['previous_exception_message'] = $exception->getPrevious()->getMessage();
        }
        $this->getLogger()->error($exception->getMessage(), $context);
    }

    /**
     * Redirect the user depend on this choice.
     */
    protected function redirectTo(Request $request, object $object): RedirectResponse
    {
        $url = false;

        if (null !== $request->get('btn_update_and_list')) {
            return $this->redirectToList();
        }
        if (null !== $request->get('btn_create_and_list')) {
            return $this->redirectToList();
        }

        if (null !== $request->get('btn_create_and_create')) {
            $params = [];
            if ($this->admin->hasActiveSubClass()) {
                $params['subclass'] = $request->get('subclass');
            }
            $url = $this->admin->generateUrl('create', $params);
        }

        if ('DELETE' === $request->getMethod()) {
            return $this->redirectToList();
        }

        if (!$url) {
            foreach (['edit', 'show'] as $route) {
                if ($this->admin->hasRoute($route) && $this->admin->hasAccess($route, $object)) {
                    $url = $this->admin->generateObjectUrl($route, $object);

                    break;
                }
            }
        }

        if (!$url) {
            return $this->redirectToList();
        }

        return new RedirectResponse($url);
    }
}

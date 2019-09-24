<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sonata\AdminBundle\Admin\AdminInterface;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Bridge\Twig\AppVariable;
use Symfony\Bridge\Twig\Command\DebugCommand;
use Symfony\Bridge\Twig\Extension\FormExtension;
use Symfony\Bridge\Twig\Form\TwigRenderer;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\Form\FormView;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyPath;

class CRUDController extends Controller
{
    public function editAction($id = null)
    {
        $request = $this->getRequest();
        // the key used to lookup the template
        $templateKey = 'edit';

        $id = $request->get($this->admin->getIdParameter());
        $existingObject = $this->admin->getObject($id);

        if (!$existingObject) {
            throw $this->createNotFoundException(
                sprintf('unable to find the object with id: %s', $id)
            );
        }

        if (\is_object($existingObject)) {
            if (
                $existingObject instanceof DisplayableInBOInterface &&
                !$existingObject->viewerCanSeeInBo($this->getUser())
            ) {
                throw new ProjectAccessDeniedException();
            }
            if (
                !$existingObject instanceof DisplayableInBOInterface &&
                !$existingObject->canDisplay($this->getUser())
            ) {
                throw new ProjectAccessDeniedException();
            }
        }

        $this->checkParentChildAssociation($request, $existingObject);

        $this->admin->checkAccess('edit', $existingObject);

        $preResponse = $this->preEdit($request, $existingObject);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($existingObject);
        $objectId = $this->admin->getNormalizedIdentifier($existingObject);

        /** @var $form Form */
        $form = $this->admin->getForm();
        $form->setData($existingObject);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if ($isFormValid && (!$this->isInPreviewMode() || $this->isPreviewApproved())) {
                $submittedDistricts = $form->get('districts')->getData();
                $submittedObject = $form->getData();

                $em = $this->container->get('doctrine.orm.entity_manager');

                $em
                    ->createQueryBuilder()
                    ->delete(ProjectDistrictPositioner::class, 'p')
                    ->where('p.project = :project')
                    ->setParameter('project', $existingObject->getId())
                    ->getQuery()
                    ->execute();
                $positioners = [];
                foreach ($submittedDistricts as $position => $district) {
                    $positioner = new ProjectDistrictPositioner();
                    $positioner->setDistrict($district);
                    $positioner->setProject($existingObject);
                    $positioner->setPosition($position);

                    $positioners[] = $positioner;
                }
                $submittedObject->setProjectDistrictPositioner($positioners);

                $this->admin->setSubject($submittedObject);

                try {
                    $existingObject = $this->admin->update($submittedObject);

                    if ($this->isXmlHttpRequest()) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $objectId,
                                'objectName' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                )
                            ],
                            200,
                            []
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->trans(
                            'flash_edit_success',
                            [
                                '%name%' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                )
                            ],
                            'SonataAdminBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($existingObject);
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
                                '%link_start%' =>
                                    '<a href="' .
                                    $this->admin->generateObjectUrl('edit', $existingObject) .
                                    '">',
                                '%link_end%' => '</a>'
                            ],
                            'SonataAdminBundle'
                        )
                    );
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                if (!$this->isXmlHttpRequest()) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->trans(
                            'flash_edit_error',
                            [
                                '%name%' => $this->escapeHtml(
                                    $this->admin->toString($existingObject)
                                )
                            ],
                            'SonataAdminBundle'
                        )
                    );
                }
            } elseif ($this->isPreviewRequested()) {
                // enable the preview template if the form was valid and preview was requested
                $templateKey = 'preview';
                $this->admin->getShow();
            }
        }

        $formView = $form->createView();
        // set the theme for the current Admin Form
        $this->setFormTheme($formView, $this->admin->getFormTheme());

        // NEXT_MAJOR: Remove this line and use commented line below it instead
        $template = $this->admin->getTemplate($templateKey);

        // $template = $this->templateRegistry->getTemplate($templateKey);

        return $this->renderWithExtraParams(
            $template,
            [
                'action' => 'edit',
                'form' => $formView,
                'object' => $existingObject,
                'objectId' => $objectId
            ],
            null
        );
    }

    /**
     * @param Request $request
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
            'filter' !== $context &&
            false === $admin->isGranted('CREATE') &&
            false === $admin->isGranted('EDIT')
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
                throw $this->createAccessDeniedException(
                    'Autocomplete list can`t be retrieved because the form element is disabled or read_only.'
                );
            }

            $property = $formAutocomplete->getConfig()->getAttribute('property');
            $callback = $formAutocomplete->getConfig()->getAttribute('callback');
            $minimumInputLength = $formAutocomplete
                ->getConfig()
                ->getAttribute('minimum_input_length');
            $itemsPerPage = $formAutocomplete->getConfig()->getAttribute('items_per_page');
            $reqParamPageNumber = $formAutocomplete
                ->getConfig()
                ->getAttribute('req_param_name_page_number');
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
                        throw new \RuntimeException(
                            sprintf(
                                'To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.',
                                $prop,
                                \get_class($targetAdmin)
                            )
                        );
                    }

                    $filter = $datagrid->getFilter($prop);
                    $filter->setCondition(FilterInterface::CONDITION_OR);

                    $datagrid->setValue($prop, null, $searchText);
                }
            } else {
                if (!$datagrid->hasFilter($property)) {
                    throw new \RuntimeException(
                        sprintf(
                            'To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.',
                            $property,
                            \get_class($targetAdmin)
                        )
                    );
                }

                $datagrid->setValue($property, null, $searchText);
            }
        }

        foreach ($conditions as $field => $value) {
            if (!$datagrid->hasFilter($field)) {
                throw new \RuntimeException(
                    sprintf(
                        'To retrieve autocomplete items, you should add filter "%s" to "%s" in configureDatagridFilters() method.',
                        $field,
                        \get_class($targetAdmin)
                    )
                );
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
                    throw new \RuntimeException(
                        'Option "to_string_callback" does not contain callable function.'
                    );
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
            'items' => $items
        ]);
    }

    /**
     * @param AdminInterface $admin
     * @param $field
     *
     * @return \Sonata\AdminBundle\Admin\FieldDescriptionInterface
     *                                                             Method from Sonata Admin HelperController
     */
    protected function retrieveFormFieldDescription(AdminInterface $admin, $field)
    {
        $admin->getFormFieldDescriptions();

        $fieldDescription = $admin->getFormFieldDescription($field);

        if (!$fieldDescription) {
            throw new \RuntimeException(sprintf('The field "%s" does not exist.', $field));
        }

        if ('sonata_type_model_autocomplete' !== $fieldDescription->getType()) {
            throw new \RuntimeException(
                sprintf(
                    'Unsupported form type "%s" for field "%s".',
                    $fieldDescription->getType(),
                    $field
                )
            );
        }

        if (null === $fieldDescription->getTargetEntity()) {
            throw new \RuntimeException(sprintf('No associated entity with field "%s".', $field));
        }

        return $fieldDescription;
    }

    /**
     * @throws \Exception
     */
    protected function handleModelManagerException(\Exception $e)
    {
        if ($this->get('kernel')->isDebug()) {
            throw $e;
        }

        $context = ['exception' => $e];
        if ($e->getPrevious()) {
            $context['previous_exception_message'] = $e->getPrevious()->getMessage();
        }
        $this->getLogger()->error($e->getMessage(), $context);
    }

    /**
     * Redirect the user depend on this choice.
     *
     * @param object $object
     *
     * @return RedirectResponse
     */
    protected function redirectTo($object)
    {
        $request = $this->getRequest();

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

        if ('DELETE' === $this->getRestMethod()) {
            if (
                'admin_capco_app_steps_abstractstep_delete' === $request->attributes->get('_route')
            ) {
                return $this->redirectToRoute('admin_capco_app_project_list');
            }

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

    private function checkParentChildAssociation(Request $request, $object)
    {
        if (!($parentAdmin = $this->admin->getParent())) {
            return;
        }

        // NEXT_MAJOR: remove this check
        if (!$this->admin->getParentAssociationMapping()) {
            return;
        }

        $parentId = $request->get($parentAdmin->getIdParameter());

        $propertyAccessor = PropertyAccess::createPropertyAccessor();
        $propertyPath = new PropertyPath($this->admin->getParentAssociationMapping());

        if (
            $parentAdmin->getObject($parentId) !==
            $propertyAccessor->getValue($object, $propertyPath)
        ) {
            // NEXT_MAJOR: make this exception
            @trigger_error(
                "Accessing a child that isn't connected to a given parent is deprecated since 3.34" .
                    " and won't be allowed in 4.0.",
                E_USER_DEPRECATED
            );
        }
    }

    /**
     * Sets the admin form theme to form view. Used for compatibility between Symfony versions.
     *
     * @param string $theme
     */
    private function setFormTheme(FormView $formView, $theme)
    {
        $twig = $this->get('twig');

        // BC for Symfony < 3.2 where this runtime does not exists
        if (!method_exists(AppVariable::class, 'getToken')) {
            $twig->getExtension(FormExtension::class)->renderer->setTheme($formView, $theme);

            return;
        }

        // BC for Symfony < 3.4 where runtime should be TwigRenderer
        if (!method_exists(DebugCommand::class, 'getLoaderPaths')) {
            $twig->getRuntime(TwigRenderer::class)->setTheme($formView, $theme);

            return;
        }

        $twig->getRuntime(FormRenderer::class)->setTheme($formView, $theme);
    }
}

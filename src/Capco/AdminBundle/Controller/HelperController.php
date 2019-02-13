<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Controller\HelperController as BaseHelperController;
use Sonata\AdminBundle\Admin\AdminHelper;
use Sonata\AdminBundle\Admin\AdminInterface;
use Sonata\AdminBundle\Admin\Pool;
use Sonata\AdminBundle\Filter\FilterInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Twig\Environment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class HelperController extends BaseHelperController
{
    private $userSearch;

    public function __construct(
        Environment $twig,
        Pool $pool,
        AdminHelper $helper,
        ValidatorInterface $validator,
        UserSearch $userSearch
    ) {
        $this->userSearch = $userSearch;
        parent::__construct($twig, $pool, $helper, $validator);
    }

    /**
     * Retrieve list of items for autocomplete form field.
     *
     * @Route("/admin/core/get-autocomplete-items", name="sonata_admin_retrieve_autocomplete_items" )
     */
    public function retrieveAutocompleteItemsAction(Request $request)
    {
        $admin = $this->pool->getInstance($request->get('admin_code'));
        $admin->setRequest($request);
        $context = $request->get('_context', '');

        if ('filter' === $context) {
            $admin->checkAccess('list');
        } elseif (!$admin->hasAccess('create') && !$admin->hasAccess('edit')) {
            throw new AccessDeniedException();
        }

        // subject will be empty to avoid unnecessary database requests and keep autocomplete function fast
        $admin->setSubject($admin->getNewInstance());
        dump($context);
        if ('filter' === $context) {
            // filter
            $fieldDescription = $this->retrieveFilterFieldDescription(
                $admin,
                $request->get('field')
            );
            $filterAutocomplete = $admin->getDatagrid()->getFilter($fieldDescription->getName());
            dump($filterAutocomplete);
            $entity = $filterAutocomplete->getOption('field_options')['class'];
            $property = $filterAutocomplete->getFieldOption('property');
            $callback = $filterAutocomplete->getFieldOption('callback');
            $minimumInputLength = $filterAutocomplete->getFieldOption('minimum_input_length', 3);
            $itemsPerPage = $filterAutocomplete->getFieldOption('items_per_page', 10);
            $reqParamPageNumber = $filterAutocomplete->getFieldOption(
                'req_param_name_page_number',
                '_page'
            );
            $toStringCallback = $filterAutocomplete->getFieldOption('to_string_callback');
            $targetAdminAccessAction = $filterAutocomplete->getFieldOption(
                'target_admin_access_action',
                'list'
            );
        } else {
            // create/edit form
            $fieldDescription = $this->retrieveFormFieldDescription($admin, $request->get('field'));
            $formAutocomplete = $admin->getForm()->get($fieldDescription->getName());

            $formAutocompleteConfig = $formAutocomplete->getConfig();
            $entity = $formAutocompleteConfig->getOption('class');
            if ($formAutocompleteConfig->getAttribute('disabled')) {
                throw new AccessDeniedException(
                    'Autocomplete list can`t be retrieved because the form element is disabled or read_only.'
                );
            }

            $property = $formAutocompleteConfig->getAttribute('property');
            $callback = $formAutocompleteConfig->getAttribute('callback');
            $minimumInputLength = $formAutocompleteConfig->getAttribute('minimum_input_length');
            $itemsPerPage = $formAutocompleteConfig->getAttribute('items_per_page');
            $reqParamPageNumber = $formAutocompleteConfig->getAttribute(
                'req_param_name_page_number'
            );
            $toStringCallback = $formAutocompleteConfig->getAttribute('to_string_callback');
            $targetAdminAccessAction = $formAutocompleteConfig->getAttribute(
                'target_admin_access_action'
            );
        }
        $searchText = $request->get('q');

        if (User::class === $entity) {
            $items = [];

            /** @var UserSearch $userSearch */
            $users = $this->userSearch->searchUsers($searchText, [$property]);
            if ($users['count'] > 0) {
                $getter = 'get' . ucfirst($property);
                foreach ($users['users'] as $user) {
                    $items[] = ['id' => $user->getId(), 'label' => $user->$getter()];
                }
            }

            return new JsonResponse([
                'status' => 'OK',
                'more' => false,
                'items' => $items,
            ]);
        }
        $targetAdmin = $fieldDescription->getAssociationAdmin();

        // check user permission
        $targetAdmin->checkAccess($targetAdminAccessAction);

        if (mb_strlen($searchText, 'UTF-8') < $minimumInputLength) {
            return new JsonResponse(
                ['status' => 'KO', 'message' => 'Too short search string.'],
                403
            );
        }

        $targetAdmin->setFilterPersister(null);
        $datagrid = $targetAdmin->getDatagrid();

        if (null !== $callback) {
            if (!\is_callable($callback)) {
                throw new \RuntimeException('Callback does not contain callable function.');
            }

            \call_user_func($callback, $targetAdmin, $property, $searchText);
        } else {
            if (\is_array($property)) {
                // multiple properties
                foreach ($property as $prop) {
                    if (!$datagrid->hasFilter($prop)) {
                        throw new \RuntimeException(
                            sprintf(
                                'To retrieve autocomplete items,' .
                                    ' you should add filter "%s" to "%s" in configureDatagridFilters() method.',
                                $prop,
                                \get_class($targetAdmin)
                            )
                        );
                    }

                    $filter = $datagrid->getFilter($prop);
                    $filter->setCondition(FilterInterface::CONDITION_OR);

                    $datagrid->setValue($filter->getFormName(), null, $searchText);
                }
            } else {
                if (!$datagrid->hasFilter($property)) {
                    throw new \RuntimeException(
                        sprintf(
                            'To retrieve autocomplete items,' .
                                ' you should add filter "%s" to "%s" in configureDatagridFilters() method.',
                            $property,
                            \get_class($targetAdmin)
                        )
                    );
                }

                $datagrid->setValue(
                    $datagrid->getFilter($property)->getFormName(),
                    null,
                    $searchText
                );
            }
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

            $items[] = [
                'id' => $admin->id($entity),
                'label' => $label,
            ];
        }

        return new JsonResponse([
            'status' => 'OK',
            'more' => !$pager->isLastPage(),
            'items' => $items,
        ]);
    }

    /**
     * Retrieve the filter field description given by field name.
     *
     * @param string $field
     *
     * @throws \RuntimeException
     *
     * @return \Sonata\AdminBundle\Admin\FieldDescriptionInterface
     */
    private function retrieveFilterFieldDescription(AdminInterface $admin, $field)
    {
        $admin->getFilterFieldDescriptions();

        $fieldDescription = $admin->getFilterFieldDescription($field);

        if (!$fieldDescription) {
            throw new \RuntimeException(sprintf('The field "%s" does not exist.', $field));
        }

        if (null === $fieldDescription->getTargetEntity()) {
            throw new \RuntimeException(sprintf('No associated entity with field "%s".', $field));
        }

        return $fieldDescription;
    }

    /**
     * Retrieve the form field description given by field name.
     *
     * @param string $field
     *
     * @throws \RuntimeException
     *
     * @return \Sonata\AdminBundle\Admin\FieldDescriptionInterface
     */
    private function retrieveFormFieldDescription(AdminInterface $admin, $field)
    {
        $admin->getFormFieldDescriptions();

        $fieldDescription = $admin->getFormFieldDescription($field);

        if (!$fieldDescription) {
            throw new \RuntimeException(sprintf('The field "%s" does not exist.', $field));
        }

        if (null === $fieldDescription->getTargetEntity()) {
            throw new \RuntimeException(sprintf('No associated entity with field "%s".', $field));
        }

        return $fieldDescription;
    }
}
